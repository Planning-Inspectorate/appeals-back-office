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
