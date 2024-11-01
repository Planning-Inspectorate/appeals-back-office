export const DOCUMENT_STAGE = 'representation';
export const DOCUMENT_TYPE = 'representationAttachments';

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @returns {Promise<import('@pins/appeals.api').Appeals.FolderInfo>}
 * */
export const getAttachmentsFolder = async (apiClient, appealId) => {
	const folders = await apiClient
		.get(`appeals/${appealId}/document-folders?path=${DOCUMENT_STAGE}/${DOCUMENT_TYPE}`)
		.json();
	if (!(folders && folders.length > 0)) {
		throw new Error(`failed to find folder for appeal ID ${appealId}`);
	}

	return folders[0];
};

/**
 * @param {{ firstName: string, lastName: string, emailAddress: string, addressLine1: string, addressLine2: string, town: string, county: string, postCode: string, redactionStatus: boolean, 'date-day': string, 'date-month': string, 'date-year': string }} comment
 * @param {import('got').Got} apiClient
 * @param {string} document
 * @param {number} appealId
 * @returns {Promise<import('@pins/appeals.api').Appeals.FolderInfo>}
 * */
export const createIPComment = async (comment, document, apiClient, appealId) => {
	const json = {
		ipDetails: {
			firstName: comment.firstName,
			lastName: comment.lastName,
			email: comment.emailAddress
		},
		ipAddress: {
			addressLine1: comment.addressLine1,
			addressLine2: comment.addressLine2,
			town: comment.town,
			county: comment.county,
			postCode: comment.postCode
		},
		attachments: [document],
		redactionStatus: comment.redactionStatus
	};

	const IPcomment = await apiClient.post(`appeals/${appealId}/reps/comments`, { json }).json();

	return IPcomment;
};
