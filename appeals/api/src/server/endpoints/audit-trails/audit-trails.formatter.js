import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

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
				loggedDate: typeof loggedAt === 'string' ? loggedAt : loggedAt?.toISOString() || '',
				doc: doc
					? {
							name: doc.document?.name || '',
							documentGuid: doc.document?.latestDocumentVersion?.documentGuid || '',
							stage: doc.document?.latestDocumentVersion?.stage || '',
							folderId: doc.document?.folderId ?? 0,
							documentType: doc.document?.latestDocumentVersion?.documentType || '',
							redactionStatus: doc.document?.latestDocumentVersion?.redactionStatus?.key
						}
					: undefined
			}))
		: [];

/**
 * @param {string} details
 * @param {string | undefined} appealTypeKey
 * @returns {string}
 */
const formatAuditDetails = (details, appealTypeKey) => {
	if (appealTypeKey !== APPEAL_CASE_TYPE.ZA && appealTypeKey !== APPEAL_CASE_TYPE.H) return details;

	if (details.includes('Description of development updated to')) {
		const newDetails = details.replace(
			'Description of development',
			'Description of advertisement'
		);
		return newDetails;
	} else return details;
};

export { formatAuditTrail };
