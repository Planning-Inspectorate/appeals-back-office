import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#db-client/models.ts').RepresentationUpdateInput} RepresentationUpdateInput */
/** @typedef {import('#db-client/models.ts').RepresentationUncheckedCreateInput} RepresentationCreateInput */
/** @typedef {import('#db-client/models.ts').RepresentationWhereInput} RepresentationWhereInput */

/**
 * @param {number} id
 */
const getById = (id) => {
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
			},
			representationRejectionReasonsSelected: {
				include: {
					representationRejectionReason: true,
					representationRejectionReasonText: true
				}
			}
		}
	});
};

/**
 * @param {number} appealId
 * @param {{ representationType?: string[], status?: string }} options
 * @param {number} [pageNumber]
 * @param {number} [pageSize]
 * */
const getRepresentations = async (appealId, options, pageNumber, pageSize) => {
	const whereClause = {
		appealId,
		status: options.status,
		...(options.representationType
			? {
					representationType: {
						in: options.representationType
					}
			  }
			: {})
	};

	const transaction = await databaseConnector.$transaction([
		databaseConnector.representation.count({
			where: whereClause
		}),
		databaseConnector.representation.findMany({
			where: whereClause,
			select: {
				id: true,
				representative: {
					select: {
						firstName: true,
						lastName: true
					}
				},
				represented: {
					select: {
						firstName: true,
						lastName: true,
						address: true,
						email: true
					}
				},
				lpa: true,
				attachments: {
					select: {
						documentVersion: {
							select: {
								document: true,
								version: true,
								virusCheckStatus: true,
								fileName: true,
								originalFilename: true
							}
						},
						version: true,
						documentGuid: true
					}
				},
				representationRejectionReasonsSelected: {
					select: {
						representationRejectionReason: true,
						representationRejectionReasonText: true
					}
				},
				representationType: true,
				status: true,
				dateCreated: true,
				originalRepresentation: true,
				source: true
			},
			orderBy: { dateCreated: 'desc' },
			...(pageNumber && pageSize ? { skip: pageNumber * pageSize } : {}),
			...(pageSize ? { take: pageSize } : {})
		})
	]);

	const [itemCount, comments] = transaction;

	return { itemCount, comments };
};

/**
 * @param {number} appealId
 * @param {{ status?: string }} options
 * @returns {Promise<{ [key: string]: number }>}
 */
const getRepresentationCounts = async (appealId, options) => {
	const whereClause = {
		appealId,
		status: options.status
	};

	const queries = Object.values(APPEAL_REPRESENTATION_TYPE).map((representationType) =>
		databaseConnector.representation.count({
			where: { ...whereClause, representationType }
		})
	);

	const transaction = await databaseConnector.$transaction(queries);

	/** @type {{ [key: string]: number }} */
	const counts = Object.values(APPEAL_REPRESENTATION_TYPE).reduce(
		(acc, key, ii) => ({
			...acc,
			[key]: transaction[ii]
		}),
		{}
	);

	return counts;
};

/**
 * @param {number} id
 * @param {RepresentationUpdateInput} data
 */
const updateRepresentationById = (id, data) => {
	const { status, redactedRepresentation, notes, reviewer, siteVisitRequested } = data;

	return databaseConnector.representation.update({
		where: {
			id
		},
		data: {
			...(status && { status }),
			...(redactedRepresentation && { redactedRepresentation }),
			...(notes && { notes }),
			reviewer,
			dateLastUpdated: new Date(),
			siteVisitRequested
		},
		include: {
			representative: true,
			represented: {
				include: {
					address: true
				}
			},
			lpa: true,
			representationRejectionReasonsSelected: {
				include: {
					representationRejectionReason: true,
					representationRejectionReasonText: true
				}
			}
		}
	});
};

/**
 * @param {number} appealId
 * @param {RepresentationWhereInput} options
 * @param {RepresentationUpdateInput} data
 */
const updateRepresentations = (appealId, options, data) => {
	const { status, redactedRepresentation, notes, reviewer, siteVisitRequested } = data;

	return databaseConnector.$transaction(async (tx) => {
		const reps = await tx.representation.findMany({
			where: { appealId, ...options }
		});

		const repIds = reps.map((r) => r.id);

		await tx.representation.updateMany({
			where: {
				id: {
					in: repIds
				}
			},
			data: {
				...(status && { status }),
				...(redactedRepresentation && { redactedRepresentation }),
				...(notes && { notes }),
				reviewer,
				dateLastUpdated: new Date(),
				siteVisitRequested
			}
		});

		return await tx.representation.findMany({
			where: {
				id: {
					in: repIds
				}
			}
		});
	});
};

/**
 * @param {number} appealId
 * @param {string} [representationType]
 * @returns {Promise<Record<string, number>>}
 * */
const countAppealRepresentationsByStatus = async (appealId, representationType) => {
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
const createRepresentation = (data) => databaseConnector.representation.create({ data });

/**
 * @param {number} repId
 * @param {{ documentGuid: string, version: number }[]} attachments
 */
const addAttachments = async (repId, attachments) => {
	await Promise.all(
		attachments.map((attachment) =>
			databaseConnector.representationAttachment.create({
				data: {
					documentGuid: attachment.documentGuid,
					version: attachment.version,
					representationId: repId
				}
			})
		)
	);

	return databaseConnector.representation.update({
		where: { id: repId },
		data: {
			attachments: {
				connect: attachments.map((a) => ({
					documentGuid_version: a
				}))
			}
		}
	});
};

/**
 * @param {number} repId
 * @param {Array<{ id: number, text: string[] }>} rejectionReasons
 */
const updateRejectionReasons = async (repId, rejectionReasons) => {
	await databaseConnector.representationRejectionReasonText.deleteMany({
		where: { representationId: repId }
	});

	return databaseConnector.representation.update({
		where: { id: repId },
		data: {
			representationRejectionReasonsSelected: {
				deleteMany: {},
				create: rejectionReasons.map((reason) => ({
					representationRejectionReasonId: reason.id,
					representationRejectionReasonText: {
						createMany: {
							data: reason.text.map((text) => ({ text }))
						}
					}
				}))
			},
			dateLastUpdated: new Date()
		},
		include: {
			representationRejectionReasonsSelected: {
				include: {
					representationRejectionReason: true,
					representationRejectionReasonText: true,
					representation: true
				}
			}
		}
	});
};

export default {
	getById,
	getRepresentations,
	getRepresentationCounts,
	updateRepresentationById,
	updateRepresentations,
	countAppealRepresentationsByStatus,
	createRepresentation,
	addAttachments,
	updateRejectionReasons
};
