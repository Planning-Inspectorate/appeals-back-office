import appealRepository from '#repositories/appeal.repository.js';
import auditTrailRepository from '#repositories/audit-trail.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import { formatAuditTrail } from './audit-trails.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAuditTrailById = async (req, res) => {
	const { appealId } = req.params;
	const auditTrail = await auditTrailRepository.getAuditTrail(Number(appealId));

	const appealType = await appealRepository.getAppealTypeById(Number(appealId));
	const auditTrailWithReps = await Promise.all(
		auditTrail.map(async (audit) => ({
			...audit,
			doc:
				audit.doc &&
				audit.doc.document?.latestDocumentVersion?.documentType === 'representationAttachments'
					? {
							...audit.doc,
							representation: await representationRepository.getRepresentationForDocument(
								audit.doc.document.latestDocumentVersion?.documentGuid,
								audit.doc.document.latestDocumentVersion?.version
							)
						}
					: audit.doc
		}))
	);

	const formattedAuditTrail = formatAuditTrail(auditTrailWithReps, appealType?.key);

	return res.send(formattedAuditTrail);
};

export { getAuditTrailById };
