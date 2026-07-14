export interface Logger {
	info: import('pino').LogFn;
	error: import('pino').LogFn;
}
