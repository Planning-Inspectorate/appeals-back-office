import { getSkipValue } from '#utils/database-pagination.js';
import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/** @typedef {import('@pins/appeals.api').Schema.User} User */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @param {string} lpaCode
 * @param {number} inspectorId
 * @param {number} caseOfficerId
 * @param {boolean} isGreenBelt
 * @returns {Promise<[number, Omit<Appeal, 'parentAppeals' | 'childAppeals'>[]]>}
 */
const getAllAppeals = (
	searchTerm,
	status,
	hasInspector,
	lpaCode,
	inspectorId,
	caseOfficerId,
	isGreenBelt
) => {
	const where = {
		appealStatus: {
			some: {
				valid: true,
				...(String(status) !== 'undefined' && { status })
			}
		},
		appealType: {
			key: { in: getEnabledAppealTypes() }
		},
		...(String(searchTerm) !== 'undefined' && {
			OR: [
				{
					reference: {
						contains: searchTerm
					}
				},
				{
					address: {
						postcode: {
							contains: searchTerm
						}
					}
				}
			]
		}),
		...(hasInspector === 'true' && {
			inspectorUserId: {
				not: null
			}
		}),
		...(hasInspector === 'false' && {
			inspectorUserId: null
		}),
		...(isGreenBelt && {
			appellantCase: {
				isGreenBelt: true
			}
		}),
		...(!!lpaCode && {
			lpa: {
				lpaCode
			}
		}),
		...(!!inspectorId && {
			inspectorUserId: inspectorId
		}),
		...(!!caseOfficerId && {
			caseOfficerUserId: caseOfficerId
		})
	};

	return databaseConnector.$transaction([
		databaseConnector.appeal.findMany({
			where,
			include: {
				address: true,
				appealStatus: {
					where: {
						valid: true
					}
				},
				appealType: true,
				lpa: true,
				appellantCase: true,
				inspector: true,
				caseOfficer: true
			},
			orderBy: { caseUpdatedDate: 'desc' }
		})
	]);
};

/**
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} status
 * @returns {Promise<[number, Omit<Appeal, 'parentAppeals' | 'childAppeals'>[], *[]]>}
 */
const getUserAppeals = (userId, pageNumber, pageSize, status) => {
	const where = {
		...(status !== 'undefined' && {
			appealStatus: {
				some: { valid: true, status }
			}
		}),
		appealType: { key: { in: getEnabledAppealTypes() } },
		OR: [
			{ inspector: { azureAdUserId: { equals: userId } } },
			{ caseOfficer: { azureAdUserId: { equals: userId } } }
		],
		AND: {
			appealStatus: {
				some: {
					valid: true,
					status: {
						notIn: [
							APPEAL_CASE_STATUS.COMPLETE,
							APPEAL_CASE_STATUS.CLOSED,
							APPEAL_CASE_STATUS.TRANSFERRED,
							APPEAL_CASE_STATUS.INVALID,
							APPEAL_CASE_STATUS.WITHDRAWN
						]
					}
				}
			}
		}
	};

	return databaseConnector.$transaction([
		databaseConnector.appeal.count({
			where
		}),

		databaseConnector.appeal.findMany({
			where,
			include: {
				address: true,
				appealStatus: {
					where: {
						valid: true
					}
				},
				appealTimetable: true,
				appealType: true,
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
				lpa: true,
				lpaQuestionnaire: {
					include: {
						lpaQuestionnaireValidationOutcome: true,
						lpaQuestionnaireIncompleteReasonsSelected: {
							include: {
								lpaQuestionnaireIncompleteReason: true,
								lpaQuestionnaireIncompleteReasonText: true
							}
						},
						lpaNotificationMethods: {
							include: {
								lpaNotificationMethod: true
							}
						},
						listedBuildingDetails: true
					}
				},
				representations: true
			},
			skip: getSkipValue(pageNumber, pageSize),
			take: pageSize
		}),
		getAppealsStatusesInPersonalList(userId)
	]);
};

/**
 * @param {string|undefined} userId
 */
const getAppealsStatusesInPersonalList = (userId) => {
	const where = {
		AND: {
			appealStatus: {
				some: {
					valid: true,
					status: {
						notIn: [APPEAL_CASE_STATUS.COMPLETE, APPEAL_CASE_STATUS.CLOSED]
					}
				}
			}
		},
		...(userId && {
			OR: [
				{ inspector: { azureAdUserId: { equals: userId } } },
				{ caseOfficer: { azureAdUserId: { equals: userId } } }
			]
		})
	};

	return databaseConnector.appeal.findMany({
		where,
		select: {
			appealStatus: {
				select: {
					status: true
				},
				where: {
					valid: true
				}
			}
		}
	});
};

export default {
	getAllAppeals,
	getUserAppeals
};
