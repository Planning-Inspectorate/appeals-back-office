/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').interestedPartyComment} IpComment */

/**
 * @param { IpComment } comment
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

	const ipComment = await apiClient.post(`appeals/${appealId}/reps/comments`, { json }).json();

	return ipComment;
};
