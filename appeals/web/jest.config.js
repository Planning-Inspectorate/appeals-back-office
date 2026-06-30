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
	setupFiles: ['<rootDir>/setup-tests.js'],
	testTimeout: 50000,
	transform: {
		// NEVER transform node_modules except the uuid ESM build
		'^.+\\.[jt]sx?$': 'babel-jest',

		// Add a dedicated transform for uuid’s ESM browser build
		'^node_modules/uuid/.+\\.js$': 'babel-jest'
	},

	transformIgnorePatterns: [
		// Ignore ALL node_modules except uuid
		'/node_modules/(?!uuid/)'
	],
	moduleNameMapper: {
		'^uuid$': 'uuid'
	},
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
