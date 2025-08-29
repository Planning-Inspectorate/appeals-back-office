import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';
import { Folder } from './folders-documents.js';

const appealDecision = {
	type: 'object',
	properties: {
		...Folder.properties,
		documentId: {
			type: 'string',
			format: 'uuid',
			nullable: true
		},
		documentName: {
			type: 'string',
			nullable: true
		},
		letterDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		invalidReason: {
			type: 'string',
			nullable: true
		},
		virusCheckStatus: {
			type: 'string',
			enum: [...Object.values(APPEAL_VIRUS_CHECK_STATUS)]
		},
		outcome: {
			type: 'string',
			enum: [...Object.values(APPEAL_CASE_DECISION_OUTCOME)]
		}
	}
};

export const AppealDecision = appealDecision;
