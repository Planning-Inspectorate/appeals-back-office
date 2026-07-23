import { databaseConnector } from '#utils/database-connector.js';
import { hasValueOrIsNull } from '#utils/has-value-or-null.js';
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import { MAX_VISIBLE_DOCUMENTS_IN_SUMMARY } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	deleteAppealsInBatches,
	getAppealReferencesByIds
} from './delete-appeal-data/delete-appeal-data.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.User} User */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppealRequest} UpdateAppealRequest */
/** @typedef {import('@pins/appeals.api').Appeals.SetAppealDecisionRequest} SetAppealDecisionRequest */
/** @typedef {import('@pins/appeals.api').Appeals.SetInvalidAppealDecisionRequest} SetInvalidAppealDecisionRequest */
/** @typedef {import('@pins/appeals.api').Appeals.AppealRelationshipRequest } AppealRelationshipRequest */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

const linkedAppealsInclude = isLinkedAppealsActive()
	? {
			appealType: true,
			appealStatus: true,
			lpaQuestionnaire: { include: { lpaQuestionnaireValidationOutcome: true } },
			appellantCase: { include: { appellantCaseValidationOutcome: true } },
			inspectorDecision: true,
			address: true,
			appellant: { include: { address: true } },
			agent: { include: { address: true } }
		}
	: {
			appealType: true
		};

/**
 * @deprecated too inefficient, use specific selects only
 * @type {Omit<typeof appealDetailsIncludeMap, 'caseNotes' | 'folders'>}
 * legacy all data include
 **/
export const appealDetailsInclude = /** @type {Object} */ {
	address: true,
	procedureType: true,
	parentAppeals: {
		include: {
			parent: {
				include: linkedAppealsInclude
			}
		}
	},
	childAppeals: {
		include: {
			child: {
				include: linkedAppealsInclude
			}
		}
	},
	neighbouringSites: {
		include: { address: true }
	},
	allocation: true,
	specialisms: {
		include: {
			specialism: true
		}
	},
	appellantCase: {
		include: {
			appellantCaseIncompleteReasonsSelected: {
				include: {
					appellantCaseIncompleteReason: true,
					appellantCaseIncompleteReasonText: true
				}
			},
			appellantCaseInvalidReasonsSelected: {
				include: {
					appellantCaseInvalidReason: true,
					appellantCaseInvalidReasonText: true
				}
			},
			appellantCaseEnforcementInvalidReasonsSelected: {
				include: {
					appellantCaseEnforcementInvalidReason: true,
					appellantCaseEnforcementInvalidReasonText: true
				}
			},
			appellantCaseEnforcementMissingDocumentsSelected: {
				include: {
					appellantCaseEnforcementMissingDocument: true,
					appellantCaseEnforcementMissingDocumentText: true
				}
			},
			appellantCaseEnforcementGroundsMismatchFactsSelected: {
				include: {
					appellantCaseEnforcementGroundsMismatchFacts: true,
					appellantCaseEnforcementGroundsMismatchFactsText: true
				}
			},
			appellantCaseValidationOutcome: true,
			knowsOtherOwners: true,
			knowsAllOwners: true,
			appellantCaseAdvertDetails: true,
			contactAddress: true
		}
	},
	appellant: true,
	agent: true,
	lpa: true,
	appealStatus: true,
	appealTimetable: true,
	appealType: true,
	assignedTeam: true,
	caseOfficer: true,
	inspector: true,
	inspectorDecision: true,
	lpaQuestionnaire: {
		include: {
			listedBuildingDetails: {
				include: {
					listedBuilding: true
				}
			},
			designatedSiteNames: {
				include: {
					designatedSite: true
				}
			},
			lpaNotificationMethods: {
				include: {
					lpaNotificationMethod: true
				}
			},
			lpaQuestionnaireIncompleteReasonsSelected: {
				include: {
					lpaQuestionnaireIncompleteReason: true,
					lpaQuestionnaireIncompleteReasonText: true
				}
			},
			lpaQuestionnaireValidationOutcome: true
		}
	},
	siteVisit: {
		where: {
			whoMissedSiteVisit: null
		},
		include: {
			siteVisitType: true
		}
	},
	hearing: {
		include: {
			address: true
		}
	},
	inquiry: {
		include: {
			address: true
		}
	},
	representations: true,
	hearingEstimate: true,
	inquiryEstimate: true,
	appealGrounds: {
		where: {
			isDeleted: false
		},
		include: {
			ground: true
		}
	},
	appealRule6Parties: {
		include: {
			serviceUser: true
		}
	},
	enforcementNoticeAppealOutcome: true
};

/** all includes, can be selected from, don't include this, just select from it */
export const appealDetailsIncludeMap = /** @type {Object} */ {
	address: true,
	procedureType: true,
	parentAppeals: {
		include: {
			parent: {
				include: linkedAppealsInclude
			}
		}
	},
	childAppeals: {
		include: {
			child: {
				include: linkedAppealsInclude
			}
		}
	},
	neighbouringSites: {
		include: { address: true }
	},
	allocation: true,
	specialisms: {
		include: {
			specialism: true
		}
	},
	appellantCase: {
		include: {
			appellantCaseIncompleteReasonsSelected: {
				include: {
					appellantCaseIncompleteReason: true,
					appellantCaseIncompleteReasonText: true
				}
			},
			appellantCaseInvalidReasonsSelected: {
				include: {
					appellantCaseInvalidReason: true,
					appellantCaseInvalidReasonText: true
				}
			},
			appellantCaseEnforcementInvalidReasonsSelected: {
				include: {
					appellantCaseEnforcementInvalidReason: true,
					appellantCaseEnforcementInvalidReasonText: true
				}
			},
			appellantCaseEnforcementMissingDocumentsSelected: {
				include: {
					appellantCaseEnforcementMissingDocument: true,
					appellantCaseEnforcementMissingDocumentText: true
				}
			},
			appellantCaseEnforcementGroundsMismatchFactsSelected: {
				include: {
					appellantCaseEnforcementGroundsMismatchFacts: true,
					appellantCaseEnforcementGroundsMismatchFactsText: true
				}
			},
			appellantCaseValidationOutcome: true,
			knowsOtherOwners: true,
			knowsAllOwners: true,
			appellantCaseAdvertDetails: true,
			contactAddress: true
		}
	},
	appellant: true,
	agent: true,
	lpa: true,
	appealStatus: true,
	appealTimetable: true,
	appealType: true,
	assignedTeam: true,
	caseOfficer: true,
	inspector: true,
	inspectorDecision: true,
	lpaQuestionnaire: {
		include: {
			listedBuildingDetails: {
				include: {
					listedBuilding: true
				}
			},
			designatedSiteNames: {
				include: {
					designatedSite: true
				}
			},
			lpaNotificationMethods: {
				include: {
					lpaNotificationMethod: true
				}
			},
			lpaQuestionnaireIncompleteReasonsSelected: {
				include: {
					lpaQuestionnaireIncompleteReason: true,
					lpaQuestionnaireIncompleteReasonText: true
				}
			},
			lpaQuestionnaireValidationOutcome: true
		}
	},
	siteVisit: {
		where: {
			whoMissedSiteVisit: null
		},
		include: {
			siteVisitType: true
		}
	},
	hearing: {
		include: {
			address: true
		}
	},
	inquiry: {
		include: {
			address: true
		}
	},
	caseNotes: true,
	folders: true,
	representations: true,
	hearingEstimate: true,
	inquiryEstimate: true,
	appealGrounds: {
		where: {
			isDeleted: false
		},
		include: {
			ground: true
		}
	},
	appealRule6Parties: {
		include: {
			serviceUser: true
		}
	},
	enforcementNoticeAppealOutcome: true
};

/**
 * Build obj to include for an appeal
 *
 * @template {keyof typeof appealDetailsIncludeMap} K
 *
 * @param {K[]} selectedKeys
 * @param {boolean} includeDetails
 * @param {boolean} selectAppealTypeKey
 * @returns {Partial<import('#db-client/models.ts').AppealInclude> | null}
 */
export const buildAppealInclude = (
	selectedKeys = [],
	includeDetails = true,
	selectAppealTypeKey = false
) => {
	if (!includeDetails) {
		if (selectAppealTypeKey) {
			return {
				appealType: { select: { key: true } }
			};
		}
		// Only return appeal details
		return null;
	}

	if (!selectedKeys.length && !selectAppealTypeKey) {
		throw new Error('Must provide at least one: selectedKeys or selectAppealTypeKey');
	}

	/** @type {Partial<import('#db-client/models.ts').AppealInclude>} */
	let include = {};
	for (const key of selectedKeys) {
		include[key] = appealDetailsIncludeMap[key];
	}

	if (selectAppealTypeKey && !selectedKeys.some((key) => key === 'appealType')) {
		// required for BO middleware to ensure appeal type is enabled
		include = {
			...include,
			appealType: { select: { key: true } }
		};
	}

	return include;
};

/**
 * @description Gets an appeal and it's related entities.
 *
 * @template {keyof typeof appealDetailsIncludeMap} K
 *
 * @param {number} id
 * @param {boolean} [includeDetails]
 * @param {K[]} selectedKeys
 * @param {boolean} [selectAppealTypeKey]
 * @returns {Promise<Appeal|undefined>}
 */
const getAppealById = async (id, includeDetails = true, selectedKeys = [], selectAppealTypeKey) => {
	const include = buildAppealInclude(selectedKeys, includeDetails, selectAppealTypeKey);

	const includeFolders = include && include.folders;
	if (include && 'folders' in include) {
		delete include.folders;
	}

	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		include
	});
	if (appeal) {
		//@ts-ignore
		if (includeFolders && !appeal.folders) {
			if (process.env.NODE_ENV === 'test') {
				// @ts-ignore
				appeal.folders = [];
			} else {
				const folders = await getFoldersWithDocumentsAndVersions(id);
				// @ts-ignore
				appeal.folders = folders;
			}
		}
		// @ts-ignore
		return appeal;
	}
};

/**
 * @param {number} id
 * @returns {Promise<{id: number} | null>}
 */
const checkAppealExistsById = async (id) => {
	return databaseConnector.appeal.findUnique({
		where: {
			id
		},
		select: {
			id: true,
			reference: true
		}
	});
};

/**
 * @deprecated too inefficient do not use, use getAppealById with specific includes only
 * @description DO NOT USE. Gets an appeal and all it's related entities
 * @param {number} id
 * @returns {Promise<Appeal|undefined>}
 */
const deprecatedGetAppealById = async (id) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		include: appealDetailsInclude
	});
	if (appeal) {
		// @ts-ignore
		if (!appeal.folders) {
			if (process.env.NODE_ENV === 'test') {
				// @ts-ignore
				appeal.folders = [];
			} else {
				const folders = await getFoldersWithDocumentsAndVersions(id);
				// @ts-ignore
				appeal.folders = folders;
			}
		}
		// @ts-ignore
		return appeal;
	}
};

/**
 * @param {number} id
 * @returns {Promise<AppealType|undefined>}
 */
const getAppealTypeById = async (id) => {
	const appealType = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		select: { appealType: true }
	});

	if (appealType) {
		// @ts-ignore
		return appealType.appealType;
	}
};

/**
 * @deprecated too inefficient, use getAppealById with specific includes only
 * @param {string} appealReference
 * @returns {Promise<Appeal|undefined|null>}
 */
const deprecatedGetAppealByAppealReference = async (appealReference) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			reference: appealReference
		},
		include: appealDetailsInclude
	});

	if (appeal) {
		// @ts-ignore
		if (!appeal.folders) {
			if (process.env.NODE_ENV === 'test') {
				// @ts-ignore
				appeal.folders = [];
			} else {
				const folders = await getFoldersWithDocumentsAndVersions(appeal.id);
				// @ts-ignore
				appeal.folders = folders;
			}
		}
		// @ts-ignore
		return appeal;
	}
};

/**
 * @param {number} id
 * @param {UpdateAppealRequest} data
 * @returns {Promise<*>}
 */
const updateAppealById = (
	id,
	{
		caseExtensionDate,
		caseStartedDate,
		caseValidDate,
		caseOfficer,
		inspector,
		padsInspector,
		agent,
		applicationReference,
		procedureTypeId,
		hearingStartTime,
		hearingEstimatedDays
	}
) =>
	databaseConnector.appeal.update({
		where: { id },
		data: {
			...(caseExtensionDate && { caseExtensionDate }),
			...(caseStartedDate && { caseStartedDate }),
			...(caseValidDate && { caseValidDate }),
			...(applicationReference && { applicationReference }),
			...(hasValueOrIsNull(caseOfficer) && { caseOfficerUserId: caseOfficer }),
			...(hasValueOrIsNull(inspector) && { inspectorUserId: inspector }),
			...(hasValueOrIsNull(padsInspector) && { padsInspectorUserId: padsInspector }),
			...(hasValueOrIsNull(agent) && { agentId: agent }),
			...(hasValueOrIsNull(procedureTypeId) && { procedureTypeId }),
			caseUpdatedDate: new Date(),
			...((hearingStartTime || hearingEstimatedDays) && {
				hearing: {
					upsert: {
						create: {
							...(hearingStartTime && { hearingStartTime }),
							...(hearingEstimatedDays && { estimatedDays: Number(hearingEstimatedDays) })
						},
						update: {
							...(hearingStartTime && { hearingStartTime }),
							...(hearingEstimatedDays && { estimatedDays: Number(hearingEstimatedDays) })
						},
						where: { appealId: id }
					}
				}
			})
		},
		include: {
			appealType: true,
			appealStatus: true
		}
	});

/**
 * @param {number} id
 * @param {SetAppealDecisionRequest} data
 * @returns {PrismaPromise<[InspectorDecision, DocumentVersion]>}
 */
const setAppealDecision = (
	id,
	{ documentDate, documentGuid, version = 1, outcome, invalidDecisionReason = null }
) => {
	const decisionDate = new Date(documentDate).toISOString();
	// @ts-ignore
	return databaseConnector.$transaction(async (tx) => {
		const result = await tx.inspectorDecision.create({
			data: {
				appeal: {
					connect: {
						id
					}
				},
				outcome,
				decisionLetterGuid: documentGuid,
				caseDecisionOutcomeDate: new Date(documentDate),
				invalidDecisionReason: invalidDecisionReason ? invalidDecisionReason : null
			}
		});

		if (!documentGuid) {
			return result;
		}

		return tx.documentVersion.update({
			where: {
				documentGuid_version: {
					documentGuid,
					version
				}
			},
			data: {
				dateReceived: decisionDate,
				published: true,
				draft: false
			}
		});
	});
};

/**
 * @param {number} id
 * @param {Date} withdrawalRequestDate
 * @returns {PrismaPromise<import('#db-client/client.ts').Appeal>}
 */
const setAppealWithdrawal = (id, withdrawalRequestDate) => {
	return databaseConnector.appeal.update({
		data: {
			withdrawalRequestDate
		},
		where: {
			id
		}
	});
};

/**
 * @param {number} id
 * @param {Boolean} eiaScreeningRequired
 * @returns {PrismaPromise<import('#db-client/client.ts').Appeal>}
 */
const setAppealEiaScreeningRequired = (id, eiaScreeningRequired) => {
	return databaseConnector.appeal.update({
		data: {
			eiaScreeningRequired
		},
		where: {
			id
		}
	});
};

/**
 * @param {number} id
 * @param {SetInvalidAppealDecisionRequest} data
 * @returns {PrismaPromise<[InspectorDecision, DocumentVersion]>}
 */
const setInvalidAppealDecision = (id, { invalidDecisionReason, outcome }) => {
	// @ts-ignore
	return databaseConnector.$transaction([
		databaseConnector.inspectorDecision.create({
			data: {
				appeal: {
					connect: {
						id
					}
				},
				outcome,
				invalidDecisionReason,
				caseDecisionOutcomeDate: new Date()
			}
		})
	]);
};

/**
 *
 * @param {string} appealReference
 * @param {string} relationshipType
 * @returns {Promise<AppealRelationship[]>}
 */
const getLinkedAppeals = async (appealReference, relationshipType) => {
	// ToDo Fix this typescript type
	// @ts-ignore
	return await databaseConnector.appealRelationship.findMany({
		where: {
			AND: [
				{ type: relationshipType },
				{
					OR: [
						{
							parentRef: {
								equals: appealReference
							}
						},
						{
							childRef: {
								equals: appealReference
							}
						}
					]
				}
			]
		},
		include: {
			child: {
				include: linkedAppealsInclude
			},
			parent: {
				include: linkedAppealsInclude
			}
		}
	});
};

/**
 *
 * @param {number} appealId
 * @param {string} [relationshipType]
 * @returns {Promise<AppealRelationship[]>}
 */
export const getLinkedAppealsById = async (appealId, relationshipType = 'linked') => {
	// ToDo Fix this typescript type
	// @ts-ignore
	return await databaseConnector.appealRelationship.findMany({
		where: {
			AND: [
				{ type: relationshipType },
				{
					OR: [
						{
							parentId: {
								equals: appealId
							}
						},
						{
							childId: {
								equals: appealId
							}
						}
					]
				}
			]
		}
	});
};

/**
 *
 * @param {AppealRelationshipRequest} relation
 * @returns {Promise<AppealRelationship>}
 */
const linkAppeal = async (relation) => {
	return await databaseConnector.appealRelationship.create({
		data: relation
	});
};

/**
 *
 * @param {number} appealRelationshipId
 * @returns {Promise<AppealRelationship>}
 */
const unlinkAppeal = async (appealRelationshipId) => {
	return await databaseConnector.appealRelationship.delete({
		where: {
			id: appealRelationshipId
		}
	});
};

/**
 * @param {number[]} linkedAppealIds
 * @returns {Promise<Appeal[]>}
 */
const getAppealsByIds = async (linkedAppealIds) => {
	if (!Array.isArray(linkedAppealIds) || linkedAppealIds.length === 0) {
		return [];
	}

	const where = {
		id: {
			in: linkedAppealIds
		}
	};

	const appeals = await databaseConnector.appeal.findMany({
		where,
		include: {
			address: true,
			appealStatus: true,
			appealType: true,
			procedureType: true,
			lpa: true
		}
	});

	// @ts-ignore
	return appeals;
};

/**
 *
 * @param {number} appealId
 * @param {Object<string, number>} data
 * @returns {Promise<import('#db-client/client.ts').ServiceUser>}
 */
const removeAppealServiceUser = async (appealId, data) => {
	const { userType, serviceUserId } = data;
	return databaseConnector.$transaction(async (tx) => {
		await tx.appeal.update({
			where: { id: appealId },
			data: { [userType]: { disconnect: true } }
		});
		return tx.serviceUser.delete({ where: { id: serviceUserId } });
	});
};

const statusSelect = {
	select: {
		status: true,
		valid: true
	},
	where: {
		valid: true
	}
};

const getAppealsWithCompletedEvents = () =>
	databaseConnector.appeal.findMany({
		where: {
			appealStatus: {
				some: {
					status: APPEAL_CASE_STATUS.AWAITING_EVENT,
					valid: true
				}
			},
			OR: [
				{
					siteVisit: {
						OR: [
							{
								visitEndTime: {
									lte: new Date()
								}
							},
							{
								visitEndTime: null,
								visitDate: {
									lte: new Date()
								}
							}
						]
					}
				},
				{
					hearing: {
						OR: [
							{
								hearingStartTime: {
									lte: new Date()
								}
							},
							{
								hearingEndTime: null,
								hearingStartTime: {
									lte: new Date()
								}
							}
						]
					}
				},
				{
					inquiry: {
						OR: [
							{
								inquiryStartTime: {
									lte: new Date()
								}
							},
							{
								inquiryEndTime: null,
								inquiryStartTime: {
									lte: new Date()
								}
							}
						]
					}
				}
			]
		},
		select: {
			id: true,
			appealStatus: statusSelect,
			childAppeals: {
				select: {
					childId: true,
					type: true,
					child: {
						select: {
							id: true,
							appealStatus: statusSelect
						}
					}
				}
			}
		}
	});

/**
 * @param {boolean} [whereNoPersonalListEntries]
 * @returns {PrismaPromise<{ id: number; }[]>}
 */
const getAppealIdList = (whereNoPersonalListEntries = false) => {
	const query = {
		select: { id: true }
	};
	if (whereNoPersonalListEntries) {
		// @ts-ignore
		query.where = { PersonalList: { is: null } };
	}
	return databaseConnector.appeal.findMany(query);
};

/**
 * @param {number} id
 * @param {number|null} assignedTeamId
 * @returns {PrismaPromise<import('#db-client/client.ts').Appeal>}
 */
const setAssignedTeamId = (id, assignedTeamId) => {
	return databaseConnector.appeal.update({
		data: {
			assignedTeamId
		},
		where: {
			id
		}
	});
};

/**
 * @param {number[]} appealIds
 * @returns {Promise<void>}
 */
const deleteAppealsByIds = async (appealIds) => {
	const appeals = await getAppealReferencesByIds(appealIds);

	if (appeals.length === 0) {
		logger.info('Nothing to delete.');
		return;
	}

	await deleteAppealsInBatches(appeals);
};

/**
 * @param {number} appealId
 * @returns {Promise<boolean>}
 */
const checkIfAppealHasAgent = async (appealId) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id: appealId
		},
		select: {
			agentId: true
		}
	});

	return appeal?.agentId !== null && typeof appeal?.agentId !== 'undefined';
};

/**
 * @param {number} caseId
 * @returns {Promise<any[]>}
 */
/**
 * @param {number} caseId
 * @param {boolean} [loadAllVersions]
 * @returns {Promise<any[]>}
 */
const getFoldersWithDocumentsAndVersions = async (caseId, loadAllVersions = false) => {
	if (!databaseConnector.folder) {
		return [];
	}
	const folders = await databaseConnector.folder.findMany({
		where: { caseId }
	});

	if (!folders || folders.length === 0) {
		return [];
	}

	if (!databaseConnector.document) {
		return folders.map((f) => ({ ...f, documents: [] }));
	}

	const folderIds = folders.map((f) => f.id);
	const documents = await databaseConnector.document.findMany({
		where: {
			folderId: { in: folderIds },
			isDeleted: false
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	if (!documents || documents.length === 0) {
		return folders.map((f) => ({ ...f, documents: [] }));
	}

	if (!databaseConnector.documentVersion) {
		return folders.map((f) => {
			const folderDocs = documents.filter((d) => d.folderId === f.id);
			return {
				...f,
				documents: folderDocs.map((d) => ({ ...d, latestDocumentVersion: null }))
			};
		});
	}

	let guidsToFetch = [];
	if (loadAllVersions) {
		guidsToFetch = documents.map((d) => d.guid).filter(Boolean);
	} else {
		const docsByFolder = new Map();
		for (const doc of documents) {
			if (!docsByFolder.has(doc.folderId)) {
				docsByFolder.set(doc.folderId, []);
			}
			docsByFolder.get(doc.folderId).push(doc);
		}
		for (const docs of docsByFolder.values()) {
			const visibleDocs = docs.slice(0, MAX_VISIBLE_DOCUMENTS_IN_SUMMARY);
			for (const doc of visibleDocs) {
				if (doc.guid) {
					guidsToFetch.push(doc.guid);
				}
			}
		}
	}

	const batchSize = 1000;
	const documentVersions = [];

	for (let i = 0; i < guidsToFetch.length; i += batchSize) {
		const chunk = guidsToFetch.slice(i, i + batchSize);
		const chunkVersions = await databaseConnector.documentVersion.findMany({
			where: {
				documentGuid: { in: chunk }
			},
			include: {
				redactionStatus: true
			}
		});
		documentVersions.push(...chunkVersions);
	}

	const versionsByGuid = new Map();
	for (const version of documentVersions) {
		versionsByGuid.set(version.documentGuid, version);
	}

	const documentsWithVersions = documents.map((doc) => {
		const latestVersion = versionsByGuid.get(doc.guid) || null;
		return {
			...doc,
			latestDocumentVersion: latestVersion
		};
	});

	const documentsByFolderId = new Map();
	for (const doc of documentsWithVersions) {
		if (!documentsByFolderId.has(doc.folderId)) {
			documentsByFolderId.set(doc.folderId, []);
		}
		documentsByFolderId.get(doc.folderId).push(doc);
	}

	return folders.map((folder) => ({
		...folder,
		documents: documentsByFolderId.get(folder.id) || []
	}));
};

/**
 * @param {number} appealId
 * @returns {Promise<string>}
 */
const getAppealReference = async (appealId) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id: appealId
		},
		select: {
			reference: true
		}
	});

	return appeal?.reference ?? '';
};

/**
 * @type {import('#db-client/models.ts').AppealInclude}
 **/
export const appealDetailsPageDisplayInclude = /** @type {Object} */ {
	address: true,
	procedureType: {
		select: {
			id: true,
			name: true
		}
	},
	parentAppeals: {
		include: {
			parent: {
				include: linkedAppealsInclude
			}
		}
	},
	childAppeals: {
		include: {
			child: {
				include: linkedAppealsInclude
			}
		}
	},
	neighbouringSites: {
		include: { address: true }
	},
	allocation: true,
	specialisms: {
		include: {
			specialism: true
		}
	},
	appellantCase: {
		select: {
			id: true,
			appellantCaseValidationOutcome: true,
			knowsOtherOwners: true,
			knowsAllOwners: true,
			appellantCaseAdvertDetails: true,
			contactAddress: true,
			siteSafetyDetails: true,
			numberOfResidencesNetChange: true,
			screeningOpinionIndicatesEiaRequired: true,
			applicationMadeUnderActSection: true,
			planningObligation: true,
			statusPlanningObligation: true,
			enforcementReference: true
		}
	},
	appellant: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			organisationName: true,
			email: true,
			phoneNumber: true
		}
	},
	agent: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			organisationName: true,
			email: true,
			phoneNumber: true
		}
	},
	lpa: true,
	appealStatus: {
		select: {
			status: true,
			valid: true,
			createdAt: true
		}
	},
	appealTimetable: {
		select: {
			id: true,
			lpaQuestionnaireDueDate: true,
			caseResubmissionDueDate: true,
			ipCommentsDueDate: true,
			lpaStatementDueDate: true,
			finalCommentsDueDate: true,
			s106ObligationDueDate: true,
			issueDeterminationDate: true,
			proofOfEvidenceAndWitnessesDueDate: true,
			caseManagementConferenceDueDate: true
		}
	},
	appealType: {
		select: {
			id: true,
			type: true,
			key: true
		}
	},
	assignedTeam: {
		select: {
			id: true,
			name: true,
			email: true
		}
	},
	caseOfficer: {
		select: {
			azureAdUserId: true
		}
	},
	inspector: {
		select: {
			azureAdUserId: true
		}
	},
	inspectorDecision: true,
	lpaQuestionnaire: {
		select: {
			id: true,
			lpaqCreatedDate: true,
			lpaQuestionnaireValidationOutcome: {
				select: {
					name: true
				}
			},
			siteSafetyDetails: true
		}
	},
	siteVisit: {
		where: {
			whoMissedSiteVisit: null
		},
		include: {
			siteVisitType: true
		}
	},
	hearing: {
		include: {
			address: true
		}
	},
	inquiry: {
		include: {
			address: true
		}
	},
	representations: {
		select: {
			id: true,
			representationType: true,
			dateCreated: true,
			isRedacted: true,
			representedId: true,
			status: true
		}
	},
	hearingEstimate: true,
	inquiryEstimate: true,
	appealGrounds: {
		where: {
			isDeleted: false
		},
		include: {
			ground: true
		}
	},
	appealRule6Parties: {
		include: {
			serviceUser: true
		}
	},
	enforcementNoticeAppealOutcome: true,
	folders: {
		select: {
			id: true,
			path: true,
			caseId: true,
			_count: {
				select: {
					documents: {
						where: {
							isDeleted: false
						}
					}
				}
			},
			documents: {
				where: {
					isDeleted: false
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: 1,
				select: {
					guid: true,
					name: true,
					folderId: true,
					caseId: true,
					isDeleted: true,
					createdAt: true,
					latestDocumentVersion: {
						select: {
							documentGuid: true,
							version: true,
							fileName: true,
							originalFilename: true,
							dateReceived: true,
							virusCheckStatus: true,
							isDeleted: true,
							stage: true,
							documentType: true,
							size: true,
							mime: true,
							isLateEntry: true,
							documentURI: true,
							redactionStatus: {
								select: {
									id: true,
									key: true,
									name: true
								}
							}
						}
					}
				}
			}
		}
	},
	caseNotes: {
		include: {
			user: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	}
};

/**
 * @param {number} id
 * @returns {Promise<Appeal|undefined>}
 */
const getAppealByIdForPageDisplay = async (id) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		include: appealDetailsPageDisplayInclude
	});

	if (appeal) {
		// @ts-ignore
		return appeal;
	}
};

export default {
	checkAppealExistsById,
	getLinkedAppeals,
	getLinkedAppealsById,
	getAppealById,
	getAppealByIdForPageDisplay,
	deprecatedGetAppealById,
	getAppealTypeById,
	deprecatedGetAppealByAppealReference,
	getAppealIdList,
	updateAppealById,
	setAppealDecision,
	setAppealWithdrawal,
	setInvalidAppealDecision,
	setAppealEiaScreeningRequired,
	removeAppealServiceUser,
	linkAppeal,
	unlinkAppeal,
	getAppealsByIds,
	getAppealsWithCompletedEvents,
	setAssignedTeamId,
	deleteAppealsByIds,
	checkIfAppealHasAgent,
	getAppealReference,
	getFoldersWithDocumentsAndVersions
};
