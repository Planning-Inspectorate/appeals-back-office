export const APPLICATION_DECISIONS = {
	GRANTED: 'granted',
	REFUSED: 'refused',
	NOT_RECEIVED: 'not_received'
};

export const PLANNING_APPLICATION_TYPES = {
	FULL: 'full-appeal',
	OUTLINE: 'outline-planning',
	RESERVED_MATTERS: 'reserved-matters',
	PRIOR_APPROVAL: 'prior-approval'
};

export const APPEAL_PAYLOAD_TYPES = {
	FULL_APPEAL_SUBMISSION: 'S78FullAppealSubmission',
	OUTLINE_PLANNING_APPEAL_SUBMISSION: 'S78OutlinePlanningAppealSubmission',
	RESERVED_MATTERS_APPEAL_SUBMISSION: 'S78ReservedMattersAppealSubmission',
	PRIOR_APPROVAL_APPEAL_SUBMISSION: 'S78PriorApprovalAppealSubmission'
};

export const CTA_TEXT = {
	documents: {
		viewEdit: 'View and edit',
		manageShare: 'Manage and share'
	},
	caseProgression: {
		progressToProofOfEvidence: 'Progress to proof of evidence and witnesses'
	}
};

export const PROCEDURE_TYPES = {
	hearing: 'Hearing',
	inquiry: 'Inquiry',
	written: 'Written representations',
	writtenPart2: 'Written representations (Part 2)'
};

export const BANNER_TYPES = {
	success: 'Success'
};

export const SUCCESS_MESSAGES = {
	filenameUpdated: 'Document filename updated'
};

export const ERROR_MESSAGES = {
	invalidFileName:
		'File name must only include letters a to z, numbers 0 to 9, spaces and special characters such as hyphens, underscores, and parentheses'
};

export const SAMPLE_FILES = {
	document: 'sample-file.doc',
	document2: 'sample-file-2.doc',
	document3: 'sample-file-3.doc',
	documentWithSpaces: 'sample file.doc',
	documentWithBrackets: 'sample-file(1).doc',
	image: 'sample-img.jpeg',
	pdf: 'test.pdf',
	pdf2: 'test-2.pdf'
};

export const validFileNameVariants = [
	{
		name: 'newFile',
		type: 'upper and lower case letters'
	},
	{
		name: 'newFile123',
		type: 'letters and numbers'
	},
	{
		name: 'new_File',
		type: 'underscores'
	},
	{
		name: 'new-File',
		type: 'hyphens'
	},
	{
		name: 'new File',
		type: 'spaces'
	},
	{
		name: 'newFile (1)',
		type: 'brackets'
	}
];

export const invalidFileNameVariants = [
	{
		name: 'newFile<',
		type: 'less than'
	},
	{
		name: 'newFile>',
		type: 'greater than'
	},
	{
		name: 'newFile:',
		type: 'colon'
	},
	{
		name: 'newFile"',
		type: 'quotation marks'
	},
	{
		name: 'newFile/',
		type: 'forward slash'
	},
	{
		name: 'newFile\\',
		type: 'back slash'
	},
	{
		name: 'newFile|',
		type: 'pipe'
	},
	{
		name: 'newFile?',
		type: 'question mark'
	},
	{
		name: 'newFile*',
		type: 'asterisk'
	}
];
