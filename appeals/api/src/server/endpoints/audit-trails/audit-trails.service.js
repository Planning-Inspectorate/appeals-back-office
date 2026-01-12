import auditTrailRepository from '#repositories/audit-trail.repository.js';
import userRepository from '#repositories/user.repository.js';
import logger from '#utils/logger.js';

export const auditRequestCache = new Set();

/** @typedef {import('@pins/appeals.api').Appeals.CreateAuditTrail} CreateAuditTrail */
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */

/**
 * @param {CreateAuditTrail} param0
 * @returns {Promise<AuditTrail | undefined>}
 */
const createAuditTrail = async ({ appealId, azureAdUserId, details }) => {
	try {
		if (azureAdUserId && details) {
			const fingerprint = `${appealId}-${details}`;

			if (process.env.NODE_ENV !== 'test') {
				if (auditRequestCache.has(fingerprint)) return;

				auditRequestCache.add(fingerprint);
				setTimeout(() => auditRequestCache.delete(fingerprint), 2000);
			}

			const { id: userId } = await userRepository.findOrCreateUser(azureAdUserId);

			if (userId) {
				const fiveSecondsAgo = new Date(Date.now() - 5000);
				const existingAudit = await auditTrailRepository.findFirst({
					where: {
						appealId,
						details,
						loggedAt: { gte: fiveSecondsAgo }
					}
				});

				if (existingAudit) {
					return existingAudit;
				}

				return await auditTrailRepository.createAuditTrail({
					appealId,
					details,
					loggedAt: new Date(),
					userId
				});
			}
		}
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to create audit trail');
	}
};

export { createAuditTrail };
