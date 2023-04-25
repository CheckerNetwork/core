export class Core {
    constructor(cacheRoot: any, stateRoot: any);
    paths: {
        repoRoot: string;
        metrics: string;
        allMetrics: string;
        activity: string;
        moduleCache: string;
        moduleState: string;
        moduleLogs: string;
        allLogs: string;
        moduleBinaries: string;
        lockFile: string;
    };
    logs: Logs;
    activity: Activity;
    metrics: Metrics;
}
import { Logs } from './lib/log.js';
import { Activity } from './lib/activity.js';
import { Metrics } from './lib/metrics.js';
//# sourceMappingURL=index.d.ts.map