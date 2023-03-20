import { join } from 'node:path'
import { paths } from '../lib/paths.js'
import * as saturnNode from '../lib/saturn-node.js'
import { createLogStream } from '../lib/log.js'
import { createMetricsStream } from '../lib/metrics.js'
import { createActivityStream } from '../lib/activity.js'
import lockfile from 'proper-lockfile'
import { maybeCreateFile } from '../lib/util.js'
import http from 'node:http'
import { once } from 'node:events'

const { FIL_WALLET_ADDRESS, PORT = 7834 } = process.env

const handler = (req, res) => {
  res.statusCode = 404
  res.end(http.STATUS_CODES[404])
}

export const station = async ({ listen, port }) => {
  if (!FIL_WALLET_ADDRESS) {
    console.error('FIL_WALLET_ADDRESS required')
    process.exit(1)
  }

  await maybeCreateFile(paths.lockFile)
  try {
    await lockfile.lock(paths.lockFile)
  } catch (err) {
    console.error('Another Station is already running on this machine.')
    console.error(`If you are sure this is not the case, please delete the lock file at "${paths.lockFile}" and try again.`)
    process.exit(1)
  }

  if (listen) {
    const server = http.createServer(handler)
    server.listen(PORT).unref()
    await once(server, 'listening')
  }

  await saturnNode.start({
    FIL_WALLET_ADDRESS,
    storagePath: join(paths.moduleStorage, 'saturn-L2-node'),
    binariesPath: paths.moduleBinaries,
    metricsStream: createMetricsStream(paths.metrics),
    activityStream: createActivityStream('Saturn'),
    logStream: createLogStream(join(paths.moduleLogs, 'saturn-L2-node.log'))
  })
}
