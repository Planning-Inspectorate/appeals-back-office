import { Folder } from './folders-documents.js';

const appealCancellation = {
	type: 'object',
	properties: {
		cancellationFolder: {
			...Folder
		}
	}
};

export const AppealCancellation = appealCancellation;
