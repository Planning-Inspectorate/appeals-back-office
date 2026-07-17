import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#db-client/models.ts').RepresentationWhereInput} RepresentationWhereInput */
/** @typedef {import('#db-client/models.ts').RepresentationModel} RepresentationModel */
/** @typedef {import('#db-client/models.ts').RepresentationCreateArgs} RepresentationCreateArgs */
/** @typedef {import('#db-client/models.ts').RepresentationCreateManyInput} RepresentationCreateManyInput */

/**
 * @typedef {Object} RepresentationUpdateData
 * @property {RepresentationModel['appealId']} [appealId]
 * @property {RepresentationModel['representedId']} [representedId]
 * @property {RepresentationModel['status']} [status]
 * @property {RepresentationModel['redactedRepresentation']} [redactedRepresentation]
 * @property {RepresentationModel['notes']} [notes]
 * @property {RepresentationModel['reviewer']} [reviewer]
 * @property {RepresentationModel['siteVisitRequested']} [siteVisitRequested]
 */

/**
 * @param {number} id
 */
const checkRepresentationExistsById = (id) => {
	return databaseConnector.representation.findUnique({
		where: { id },
		select: {
			id: true
		}
	});
};

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
 * @param {number[]} appealIds
 * @param {{ representationType?: RepresentationModel['representationType'][], status?: RepresentationModel['status'] }} [options]
 * @param {number} [pageNumber]
 * @param {number} [pageSize]
 * */
const getRepresentations = async (appealIds, options, pageNumber, pageSize) => {
	const whereClause = {
		appealId: { in: appealIds },
		...(options?.status ? { status: options.status } : {}),
		...(options?.representationType
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
						id: true,
						address: true,
						email: true,
						firstName: true,
						lastName: true,
						organisationName: true
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
				source: true,
				redactedRepresentation: true,
				isRedacted: true
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
 * @param {number[]} appealIds
 * @param {{ status?: RepresentationModel['status'] }} options
 * @returns {Promise<{ [key: string]: number }>}
 */
const getRepresentationCounts = async (appealIds, options) => {
	const whereClause = {
		appealId: { in: appealIds },
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
 * @param {RepresentationUpdateData} data
 * @param {{ originalRepresentation?: RepresentationModel['originalRepresentation'] }} [existingRep]
 */
const updateRepresentationById = async (id, data, existingRep) => {
	const {
		status,
		redactedRepresentation,
		notes,
		reviewer,
		siteVisitRequested,
		representedId,
		appealId
	} = data;

	const redacted = redactedRepresentation
		? isRedacted({
				redactedRepresentation: redactedRepresentation,
				originalRepresentation: existingRep?.originalRepresentation
			})
		: undefined;

	return databaseConnector.representation.update({
		where: {
			id
		},
		data: {
			...(appealId && { appealId }),
			...(status && { status }),
			...(redactedRepresentation && {
				redactedRepresentation: redacted ? redactedRepresentation : null
			}),
			...(redactedRepresentation && { isRedacted: redacted }),
			...(notes && { notes }),
			...(representedId && { representedId }),
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
 * @param {number[]} appealIds
 * @param {RepresentationWhereInput} options
 * @param {{ status?: RepresentationModel['status'] }} data
 */
const updateRepresentations = (appealIds, options, data) => {
	const { status } = data;

	return databaseConnector.$transaction(async (tx) => {
		const reps = await tx.representation.findMany({
			where: { appealId: { in: appealIds }, ...options }
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
				dateLastUpdated: new Date()
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
 * @param {number[]} appealIds
 * @param {RepresentationModel['representationType']} [representationType]
 * @returns {Promise<Record<string, number>>}
 * */
const countAppealRepresentationsByStatus = async (appealIds, representationType) => {
	const statusCounts = await databaseConnector.representation.groupBy({
		by: ['status'],
		where: {
			appealId: { in: appealIds },
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
 * @param {string | null | undefined} value
 */
const normalizeWhitespace = (value) => (value ?? '').replace(/\s+/g, ' ').trim();

/**
 * @param {{ redactedRepresentation?: string | null, originalRepresentation?: string | null }} rep
 */
const isRedacted = (rep) =>
	rep.redactedRepresentation != null &&
	normalizeWhitespace(rep.redactedRepresentation) !==
		normalizeWhitespace(rep.originalRepresentation);

/**
 * @param {RepresentationCreateArgs['data']} data
 * @returns {Promise<import('@pins/appeals.api').Schema.Representation>}
 * */
const createRepresentation = (data) =>
	databaseConnector.representation.create({
		data: {
			...data,
			isRedacted: isRedacted(data)
		}
	});

/**
 * @param {RepresentationCreateManyInput[]} data
 * */
const createRepresentations = (data) => {
	return databaseConnector.representation.createMany({
		data: data.map((rep) => ({ ...rep, isRedacted: isRedacted(rep) }))
	});
};

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
 * @param {number} destinationAppealId
 * @param {number} destinationFolderId
 */
const moveRepresentationAttachmentDocuments = async (
	repId,
	destinationAppealId,
	destinationFolderId
) => {
	const attachmentsToUpdate = await databaseConnector.representationAttachment.findMany({
		where: { representationId: repId }
	});

	const attachmentDocumentGuidArray = attachmentsToUpdate.map(
		(attachment) => attachment.documentGuid
	);

	// returns a count rather than an array of documents
	await databaseConnector.document.updateMany({
		where: {
			guid: { in: attachmentDocumentGuidArray }
		},
		data: {
			caseId: destinationAppealId,
			folderId: destinationFolderId
		}
	});

	return databaseConnector.document.findMany({
		where: {
			guid: { in: attachmentDocumentGuidArray }
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

/**
 * @param {number[]} appealIds
 * @returns {Promise<string[]>}
 */
const getInterestedPartyEmails = async (appealIds) => {
	if (appealIds.length === 0) {
		return [];
	}

	const ipReps = await databaseConnector.representation.findMany({
		where: {
			appealId: { in: appealIds },
			representationType: APPEAL_REPRESENTATION_TYPE.COMMENT
		},
		select: {
			represented: {
				select: {
					email: true
				}
			}
		}
	});

	return ipReps
		.map((comment) => comment.represented?.email)
		.filter((email) => email !== undefined && email !== null);
};

export default {
	checkRepresentationExistsById,
	getById,
	getInterestedPartyEmails,
	getRepresentations,
	getRepresentationCounts,
	updateRepresentationById,
	updateRepresentations,
	countAppealRepresentationsByStatus,
	createRepresentation,
	createRepresentations,
	addAttachments,
	moveRepresentationAttachmentDocuments,
	updateRejectionReasons
};
