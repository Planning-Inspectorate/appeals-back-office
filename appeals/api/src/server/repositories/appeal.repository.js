import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { databaseConnector } from '#utils/database-connector.js';
import { hasValueOrIsNull } from '#endpoints/appeals/appeals.service.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/** @typedef {import('@pins/appeals.api').Schema.DocumentVersion} DocumentVersion */
/** @typedef {import('@pins/appeals.api').Schema.User} User */
/** @typedef {import('@pins/appeals.api').Schema.AppealRelationship} AppealRelationship */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppealRequest} UpdateAppealRequest */
/** @typedef {import('@pins/appeals.api').Appeals.SetAppealDecisionRequest} SetAppealDecisionRequest */
/** @typedef {import('@pins/appeals.api').Appeals.SetInvalidAppealDecisionRequest} SetInvalidAppealDecisionRequest */
/** @typedef {import('@pins/appeals.api').Appeals.AppealRelationshipRequest } AppealRelationshipRequest */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

const appealDetailsInclude = {
	address: true,
	procedureType: true,
	parentAppeals: {
		include: {
			parent: {
				include: {
					appealType: true
				}
			}
		}
	},
	childAppeals: {
		include: {
			child: {
				include: {
					appealType: true
				}
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
			appellantCaseValidationOutcome: true,
			knowsOtherOwners: true,
			knowsAllOwners: true
		}
	},
	appellant: true,
	agent: true,
	lpa: true,
	appealStatus: {
		where: {
			valid: true
		}
	},
	appealTimetable: true,
	appealType: true,
	caseOfficer: true,
	inspector: true,
	inspectorDecision: true,
	lpaQuestionnaire: {
		include: {
			listedBuildingDetails: true,
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
		include: {
			siteVisitType: true
		}
	},
	caseNotes: true,
	folders: {
		include: {
			documents: {
				include: {
					latestDocumentVersion: {
						include: {
							redactionStatus: true
						}
					}
				}
			}
		}
	},
	representations: true
};

/**
 * @param {number} id
 * @returns {Promise<Appeal|undefined>}
 */
const getAppealById = async (id) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		include: appealDetailsInclude
	});

	if (appeal) {
		// @ts-ignore
		return appeal;
	}
};

/**
 *
 * @param {string} appealReference
 * @returns {Promise<Appeal|undefined|null>}
 */
const getAppealByAppealReference = async (appealReference) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			reference: appealReference
		},
		include: appealDetailsInclude
	});

	if (appeal) {
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
		agent,
		applicationReference
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
			...(hasValueOrIsNull(agent) && { agentId: agent }),
			caseUpdatedDate: new Date()
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
const setAppealDecision = (id, { documentDate, documentGuid, version = 1, outcome }) => {
	const decisionDate = new Date(documentDate).toISOString();
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
				decisionLetterGuid: documentGuid,
				caseDecisionOutcomeDate: new Date(documentDate)
			}
		}),
		databaseConnector.documentVersion.update({
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
		})
	]);
};

/**
 * @param {number} id
 * @param {Date} withdrawalRequestDate
 * @returns {PrismaPromise<import('#db-client').Appeal>}
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
 * @returns {PrismaPromise<import('#db-client').Appeal>}
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
 * @returns {Promise<AppealRelationship[]>}
 */
const getLinkedAppeals = async (appealReference) => {
	return await databaseConnector.appealRelationship.findMany({
		where: {
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
 * @returns {Promise<import('#db-client').ServiceUser>}
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

const getAppealsWithCompletedEvents = () =>
	databaseConnector.appeal.findMany({
		where: {
			appealStatus: {
				some: {
					status: APPEAL_CASE_STATUS.AWAITING_EVENT
				}
			},
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
		include: appealDetailsInclude
	});

export default {
	getLinkedAppeals,
	getAppealById,
	getAppealByAppealReference,
	updateAppealById,
	setAppealDecision,
	setAppealWithdrawal,
	setInvalidAppealDecision,
	setAppealEiaScreeningRequired,
	removeAppealServiceUser,
	linkAppeal,
	unlinkAppeal,
	getAppealsByIds,
	getAppealsWithCompletedEvents
};
