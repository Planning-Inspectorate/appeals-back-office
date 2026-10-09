import { databaseConnector } from '#utils/database-connector.js';
import { DATABASE_ORDER_BY_DESC } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Appeals.CreateAuditTrailRequest} CreateAuditTrailRequest */
/** @typedef {import('@pins/appeals.api').Schema.AuditTrail} AuditTrail */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {CreateAuditTrailRequest & { representationId?: number }} param0
 * @returns {PrismaPromise<AuditTrail>}
 */
const createAuditTrail = ({ appealId, details, loggedAt, userId, representationId }) =>
	// @ts-ignore
	databaseConnector.auditTrail.create({
		data: {
			appealId,
			details,
			loggedAt,
			userId,
			...(representationId ? { representationId } : {})
		}
	});

/**
 * @param {number} appealId
 * @returns {PrismaPromise<AuditTrail[]>}
 */
const getAuditTrail = (appealId) =>
	databaseConnector.auditTrail.findMany({
		where: { appealId },
		include: {
			user: true,
			representation: {
				include: {
					represented: {
						include: { address: true }
					},
					representative: {
						include: { address: true }
					},
					lpa: true,
					attachments: {
						include: {
							documentVersion: {
								include: { document: true }
							}
						}
					},
					representationRejectionReasonsSelected: {
						include: {
							representationRejectionReason: true,
							representationRejectionReasonText: true
						}
					}
				}
			},
			doc: {
				select: {
					document: {
						include: {
							latestDocumentVersion: {
								include: { redactionStatus: true }
							}
						}
					}
				}
			}
		},
		orderBy: {
			loggedAt: DATABASE_ORDER_BY_DESC
		}
	});

/**
 * @param {any} options
 * @returns {Promise<any>}
 */
const findFirst = (options) => {
	return databaseConnector.auditTrail.findFirst(options);
};

export default { createAuditTrail, getAuditTrail, findFirst };
