import { Folder } from './folders-documents.js';

const appealWithdrawal = {
	type: 'object',
	properties: {
		withdrawalFolder: {
			...Folder
		},
		withdrawalRequestDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		}
	}
};

export const AppealWithdrawal = appealWithdrawal;
