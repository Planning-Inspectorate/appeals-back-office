// @ts-nocheck
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */
/** @typedef {import('@pins/appeals.api').Appeals.GetAuditTrailsResponse} GetAuditTrailsResponse */

/**
 * @param {AuditTrail[] | null | undefined} auditTrail
 * @param {string | undefined} appealTypeKey
 * @returns {GetAuditTrailsResponse | []}
 */
const formatAuditTrail = (auditTrail, appealTypeKey) =>
	auditTrail
		? auditTrail.map(({ details, loggedAt, user, doc }) => ({
				azureAdUserId: user?.azureAdUserId || '',
				details: formatAuditDetails(details, appealTypeKey) || '',
				loggedDate: loggedAt,
				doc: doc
					? {
							name: doc.document?.name || '',
							documentGuid: doc.document?.latestDocumentVersion?.documentGuid || '',
							stage: doc.document?.latestDocumentVersion?.stage || '',
							folderId: doc.document?.folderId,
							documentType: doc.document?.latestDocumentVersion?.documentType,
							redactionStatus: doc.document?.latestDocumentVersion?.redactionStatus?.key
					  }
					: undefined
		  }))
		: [];

const formatAuditDetails = (details, appealTypeKey) => {
	if (appealTypeKey !== 'ZA' && appealTypeKey !== 'H') return details;

	if (details.includes('Description of development updated to')) {
		const newDetails = details.replace(
			'Description of development',
			'Description of advertisement'
		);
		return newDetails;
	} else return details;
};

export { formatAuditTrail };
