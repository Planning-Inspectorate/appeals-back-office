import {
	APPEAL_CASE_STAGE,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_REDACTED_STATUS,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';

const documentLog = {
	type: 'object',
	required: ['loggedAt', 'user', 'action', 'details'],
	properties: {
		loggedAt: {
			type: 'string',
			format: 'date-time'
		},
		user: {
			type: 'string',
			format: 'uuid'
		},
		action: {
			type: 'string'
		},
		details: {
			type: 'string'
		}
	}
};

const documentVersion = {
	type: 'object',
	required: ['id', 'version', 'virusCheckStatus', 'redactionStatus', 'documentURI'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid'
		},
		version: {
			type: 'number'
		},
		fileName: {
			type: 'string'
		},
		originalFileName: {
			type: 'string'
		},
		size: {
			type: 'number'
		},
		mime: {
			type: 'string'
		},
		createdAt: {
			type: 'string',
			format: 'date-time'
		},
		dateReceived: {
			type: 'string',
			format: 'date-time'
		},
		redactionStatus: {
			type: 'string',
			enum: [...Object.values(APPEAL_REDACTED_STATUS)]
		},
		virusCheckStatus: {
			type: 'string',
			enum: [...Object.values(APPEAL_VIRUS_CHECK_STATUS)]
		},
		documentType: {
			type: 'string',
			enum: [...Object.values(APPEAL_DOCUMENT_TYPE)]
		},
		stage: {
			type: 'string',
			enum: [...Object.values(APPEAL_CASE_STAGE)]
		},
		documentURI: {
			type: 'string'
		},
		isLateEntry: {
			type: 'boolean'
		},
		isDeleted: {
			type: 'boolean'
		},
		versionAudit: {
			nullable: true,
			type: 'array',
			items: {
				...documentLog
			}
		}
	}
};

const document = {
	type: 'object',
	required: ['id', 'name'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid'
		},
		caseId: {
			type: 'number'
		},
		folderId: {
			type: 'number'
		},
		name: {
			type: 'string'
		},
		createdAt: {
			type: 'string',
			format: 'date-time'
		},
		latestDocumentVersion: {
			...documentVersion,
			nullable: true
		},
		allVersions: {
			type: 'array',
			items: {
				...documentVersion
			},
			nullable: true
		}
	}
};

const folder = {
	type: 'object',
	required: ['caseId', 'folderId', 'path', 'documents'],
	properties: {
		caseId: {
			type: 'number'
		},
		folderId: {
			type: 'number'
		},
		path: {
			type: 'string'
		},
		documents: {
			nullable: true,
			type: 'array',
			items: {
				...document
			}
		}
	}
};

export const Folder = folder;
export const Document = document;
export const DocumentVersion = documentVersion;
export const DocumentLog = documentLog;
