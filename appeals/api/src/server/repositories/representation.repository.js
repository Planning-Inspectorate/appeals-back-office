import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {number} id
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation | null>}
 */
export const getById = (id) => {
	return databaseConnector.representation.findUnique({
		where: { id },
		include: {
			representative: true,
			represented: true,
			lpa: true,
			attachments: {
				include: {
					documentVersion: true
				}
			}
		}
	});
};

/**
 *
 * @param {number} appealId
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation[]>}
 */
export const getStatementsByAppealId = (appealId) => {
	return databaseConnector.representation.findMany({
		where: {
			appealId,
			representationType: APPEAL_REPRESENTATION_TYPE.STATEMENT
		},
		include: {
			representative: true,
			represented: true,
			lpa: true
		}
	});
};

/**
 *
 * @param {number} appealId
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation[]>}
 */
export const getFinalCommentsByAppealId = (appealId) => {
	return databaseConnector.representation.findMany({
		where: {
			appealId,
			representationType: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT
		},
		include: {
			representative: true,
			represented: true,
			lpa: true
		}
	});
};

/**
 *
 * @param {number} appealId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string|undefined} status
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation[]>}
 */
export const getThirdPartyCommentsByAppealId = (
	appealId,
	pageNumber = 0,
	pageSize = 30,
	status
) => {
	return databaseConnector.representation.findMany({
		where: {
			appealId,
			representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
			...(status && { status })
		},
		include: {
			representative: true,
			represented: true,
			lpa: true
		},
		orderBy: { dateCreated: 'desc' },
		skip: pageNumber * pageSize,
		take: pageSize
	});
};

/**
 *
 * @param {number} id
 * @param {string|undefined} redactedRepresentation
 * @param {string|undefined} status
 * @param {string|undefined} notes
 * @param {string} reviewer
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 */
export const updateRepresentationById = (id, redactedRepresentation, status, notes, reviewer) => {
	return databaseConnector.representation.update({
		where: {
			id
		},
		data: {
			...(status && { status }),
			...(redactedRepresentation && { redactedRepresentation }),
			...(notes && { notes }),
			reviewer,
			dateLastUpdated: new Date()
		},
		include: {
			representative: true,
			represented: true,
			lpa: true
		}
	});
};
