export default async () => {
	process.env.TZ = 'UTC';
	process.env.LOG_LEVEL_STDOUT = 'fatal';
};
