import path from 'path';

export const getPaths = () => {
	const [, , originalFilePath, targetDirPath] = process.argv;

	if (!originalFilePath) {
		throw new Error(
			'Incorrect invocation signature. This script requires the path to the target file and optionally the path to the target write directory. Eg npm run scripts:split-file -- /path/to/target /path/to/write/dir'
		);
	}
	if (!targetDirPath) {
		console.log(
			`No write directory argument provided. Output will be written to ${path.join(
				originalFilePath
			)}`
		);
	}

	const originalFileDir = path.basename(originalFilePath);

	const writeDirPath = targetDirPath || path.join(originalFileDir, './split');

	return { originalFilePath, originalFileDir, writeDirPath };
};
