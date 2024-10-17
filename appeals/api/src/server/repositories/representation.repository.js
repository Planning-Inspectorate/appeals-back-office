import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#db-client').Prisma.RepresentationUpdateInput} RepresentationUpdateInput */
/** @typedef {import('#db-client').Prisma.RepresentationUncheckedCreateInput} RepresentationCreateInput */

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
			represented: {
				include: {
					address: true
				}
			},
			lpa: true,
			attachments: {
				include: {
					documentVersion: {
						include: {
							document: true
						}
					}
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
 * @param {number} appealId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string|undefined} status
 * @returns {Promise<{ itemCount: number, comments: import('@pins/appeals.api').Schema.Representation[] }>}
 */
export const getThirdPartyCommentsByAppealId = async (
	appealId,
	pageNumber = 0,
	pageSize = 30,
	status
) => {
	const whereClause = {
		appealId,
		representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
		...(status && { status })
	};

	const transaction = await databaseConnector.$transaction([
		databaseConnector.representation.count({
			where: whereClause
		}),
		databaseConnector.representation.findMany({
			where: whereClause,
			include: {
				representative: true,
				represented: true,
				lpa: true
			},
			orderBy: { dateCreated: 'desc' },
			skip: pageNumber * pageSize,
			take: pageSize
		})
	]);

	const [itemCount, comments] = transaction;

	return { itemCount, comments };
};

/**
 *
 * @param {number} id
 * @param {RepresentationUpdateInput} data
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 */
export const updateRepresentationById = (id, data) => {
	const { status, redactedRepresentation, notes, reviewer } = data;

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

/**
 * @param {number} appealId
 * @param {string} [representationType]
 * @returns {Promise<Record<string, number>>}
 * */
export const countAppealRepresentationsByStatus = async (appealId, representationType) => {
	const statusCounts = await databaseConnector.representation.groupBy({
		by: ['status'],
		where: {
			appealId,
			representationType
		},
		_count: true
	});

	return statusCounts.reduce(
		(acc, item) => ({
			...acc,
			[item.status]: item._count
		}),
		{}
	);
};

/**
 * @param {RepresentationCreateInput} data
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
export const createRepresentation = (data) => databaseConnector.representation.create({ data });

/**
 * @param {number} repId
 * @param {{ documentGuid: string, version: number }[]} attachments
 * */
export const addAttachments = (repId, attachments) =>
	databaseConnector.representation.update({
		where: { id: repId },
		data: {
			attachments: {
				connect: attachments.map((a) => ({
					documentGuid_version: a
				}))
			}
		}
	});
