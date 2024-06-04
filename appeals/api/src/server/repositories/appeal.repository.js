import { databaseConnector } from '#utils/database-connector.js';
import { hasValueOrIsNull } from '#endpoints/appeals/appeals.service.js';
import {
	DATABASE_ORDER_BY_DESC,
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '#endpoints/constants.js';

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

/**
 * @param {number} id
 * @returns {Promise<Appeal|undefined>}
 */
const getAppealById = async (id) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			id
		},
		include: {
			address: true,
			procedureType: true,
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
					appellantCaseValidationOutcome: true
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
			}
		}
	});

	if (appeal) {
		const appealRelationships = await databaseConnector.appealRelationship.findMany({
			where: {
				OR: [
					{
						parentRef: {
							equals: appeal.reference
						}
					},
					{
						childRef: {
							equals: appeal.reference
						}
					}
				]
			}
		});

		const linkedAppeals = appealRelationships.filter(
			(relationship) => relationship.type === CASE_RELATIONSHIP_LINKED
		);
		const relatedAppeals = appealRelationships.filter(
			(relationship) => relationship.type === CASE_RELATIONSHIP_RELATED
		);

		// @ts-ignore
		return {
			...appeal,
			linkedAppeals,
			relatedAppeals
		};
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
			caseUpdatedDate: new Date()
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
				decisionLetterGuid: documentGuid
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
				invalidDecisionReason
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
 * @param {string} appealReference
 * @returns {Promise<Appeal|undefined|null>}
 */
const getAppealByAppealReference = async (appealReference) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: {
			reference: appealReference
		},
		include: {
			address: true,
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
					appellantCaseValidationOutcome: true
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
			auditTrail: {
				include: {
					user: true
				},
				orderBy: {
					loggedAt: DATABASE_ORDER_BY_DESC
				}
			},
			caseOfficer: true,
			inspector: true,
			inspectorDecision: true,
			lpaQuestionnaire: {
				include: {
					listedBuildingDetails: true,
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
			}
		}
	});

	if (appeal) {
		const linkedAppeals = await databaseConnector.appealRelationship.findMany({
			where: {
				OR: [
					{
						parentRef: {
							equals: appeal.reference
						}
					},
					{
						childRef: {
							equals: appeal.reference
						}
					}
				]
			}
		});

		// @ts-ignore
		return {
			...appeal,
			linkedAppeals
		};
	}
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

	return appeals;
};

export default {
	getLinkedAppeals,
	getAppealById,
	getAppealByAppealReference,
	updateAppealById,
	setAppealDecision,
	setInvalidAppealDecision,
	linkAppeal,
	unlinkAppeal,
	getAppealsByIds
};
