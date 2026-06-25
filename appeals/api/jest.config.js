import os from 'node:os';

const totalMemLimit = os.freemem() / 1024 / 1024 / 1024; // Convert bytes to GB
const memPerWorker = 1; // 1 GB per worker
const maxWorkersByMemory = Math.max(1, Math.floor(totalMemLimit / memPerWorker));
const maxByCpu = os.cpus().length;

console.log(`Total system memory: ${totalMemLimit.toFixed(2)} GB`);
console.log(`Max workers by memory: ${maxWorkersByMemory}`);
console.log(`Max workers by CPU: ${maxByCpu}`);
console.log(`Using max workers: ${Math.min(maxWorkersByMemory, maxByCpu)}`);

export default {
	transform: {},
	moduleNameMapper: { '^uuid$': 'uuid' },
	globalSetup: './global-setup.js',
	setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 65,
			lines: 70,
			statements: 70
		}
	},
	workerThreads: false,
	workerIdleMemoryLimit: memPerWorker + 'GB',
	maxWorkers: Math.min(maxWorkersByMemory, maxByCpu)
};
