import test from 'test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import assert from 'node:assert'
import { tmpdir } from 'node:os'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import timers from 'node:timers/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const station = join(__dirname, '..', 'bin', 'station.js')

// From https://spec.filecoin.io/appendix/address/
const FIL_WALLET_ADDRESS = 'f17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy'

test('FIL_WALLET_ADDRESS', async t => {
  await t.test('require address', async t => {
    try {
      await execa(station)
    } catch (err) {
      return
    }
    assert.fail('should have thrown')
  })
  await t.test('with address', async t => {
    const ps = execa(station, { env: { FIL_WALLET_ADDRESS } })
    await once(ps.stdout, 'data')
    ps.kill()
  })
})

test('Storage', async t => {
  const XDG_STATE_HOME = join(tmpdir(), randomUUID())
  const ps = execa(station, {
    env: {
      FIL_WALLET_ADDRESS,
      XDG_STATE_HOME
    }
  })
  await timers.setTimeout(1000)
  ps.kill()
  await fs.stat(XDG_STATE_HOME, 'filecoin-station')
  await fs.stat(join(XDG_STATE_HOME, 'filecoin-station', 'modules'))
  await fs.stat(join(XDG_STATE_HOME, 'filecoin-station', 'logs'))
  await fs.stat(join(XDG_STATE_HOME, 'filecoin-station', 'logs', 'modules'))
  await fs.stat(
    join(
      XDG_STATE_HOME, 'filecoin-station', 'logs', 'modules', 'saturn-L2-node.log'
    )
  )
})

test('Metrics', async t => {
  const { stdout } = await execa(station, ['metrics'])
  assert.ok(stdout.includes('totalJobsComplete'))

  for (const flag of ['-f', '--follow']) {
    const ps = execa(station, ['metrics', flag])
    await once(ps.stdout, 'data')
    ps.kill()
  }
})

test('Update modules', async t => {
  await execa(join(__dirname, '..', 'scripts', 'update-modules.js'))
})
