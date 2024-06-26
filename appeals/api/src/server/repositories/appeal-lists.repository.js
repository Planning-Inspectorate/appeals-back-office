import { getSkipValue } from '#utils/database-pagination.js';
import { databaseConnector } from '#utils/database-connector.js';
import {
	STATE_TARGET_CLOSED,
	STATE_TARGET_COMPLETE,
	STATE_TARGET_TRANSFERRED,
	STATE_TARGET_INVALID,
	STATE_TARGET_WITHDRAWN
} from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} InspectorDecision */
/** @typedef {import('@pins/appeals.api').Schema.User} User */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @returns {Promise<[number, Appeal[], *[]]>}
 */
const getAllAppeals = (pageNumber, pageSize, searchTerm, status, hasInspector) => {
	const where = {
		appealStatus: {
			some: {
				valid: true,
				...(status !== 'undefined' && { status })
			}
		},
		...(searchTerm !== 'undefined' && {
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
		})
	};

	// @ts-ignore
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
				appealType: true,
				lpa: true
			},
			orderBy: { caseUpdatedDate: 'desc' },
			skip: getSkipValue(pageNumber, pageSize),
			take: pageSize
		}),
		getAppealsStatusesInNationalList(searchTerm, hasInspector)
	]);
};

/**
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} status
 * @returns {Promise<[number, Appeal[], *[]]>}
 */
const getUserAppeals = (userId, pageNumber, pageSize, status) => {
	const where = {
		...(status !== 'undefined' && {
			appealStatus: {
				some: { valid: true, status }
			}
		}),
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
							STATE_TARGET_COMPLETE,
							STATE_TARGET_CLOSED,
							STATE_TARGET_TRANSFERRED,
							STATE_TARGET_INVALID,
							STATE_TARGET_WITHDRAWN
						]
					}
				}
			}
		}
	};

	// @ts-ignore
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
				}
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
				some: { valid: true, status: { notIn: [STATE_TARGET_COMPLETE, STATE_TARGET_CLOSED] } }
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

/**
 * @param {string} searchTerm
 * @param {string} hasInspector
 */
const getAppealsStatusesInNationalList = (searchTerm, hasInspector) => {
	const where = {
		...(searchTerm !== 'undefined' && {
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
