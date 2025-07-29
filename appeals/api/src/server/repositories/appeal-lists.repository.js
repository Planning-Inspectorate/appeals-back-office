import { getSkipValue } from '#utils/database-pagination.js';
import { databaseConnector } from '#utils/database-connector.js';
import { APPEAL_CASE_STATUS, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import config from '#config/config.js';

/**
 * @typedef {Awaited<ReturnType<getAllAppeals>>} DBAppeals
 */

/**
 * @typedef {Awaited<ReturnType<getUserAppeals>>[1][0]} DBUserAppeal
 */

/**
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @param {string} lpaCode
 * @param {number} inspectorId
 * @param {number} caseOfficerId
 * @param {boolean} isGreenBelt
 * @param {number} appealTypeId
 * @param {number} [pageNumber]
 * @param {number} [pageSize]
 */
const getAllAppeals = async (
	searchTerm,
	status,
	hasInspector,
	lpaCode,
	inspectorId,
	caseOfficerId,
	isGreenBelt,
	appealTypeId,
	pageNumber,
	pageSize
) => {
	/** @type {{ skip?: number, take?: number }} */
	const pagination =
		pageNumber && pageSize
			? {
					skip: getSkipValue(pageNumber, pageSize),
					take: pageSize
			  }
			: {};

	const where = buildAllAppealsWhereClause(
		searchTerm,
		status,
		hasInspector,
		lpaCode,
		inspectorId,
		caseOfficerId,
		isGreenBelt,
		appealTypeId
	);

	const appeals = await databaseConnector.appeal.findMany({
		where,
		include: {
			address: true,
			appealStatus: {
				where: {
					valid: true
				}
			},
			appealType: true,
			procedureType: true,
			lpa: true,
			appellantCase: {
				include: {
					appellantCaseValidationOutcome: true
				}
			},
			inspector: true,
			caseOfficer: true,
			appealTimetable: true,
			representations: true,
			lpaQuestionnaire: {
				include: {
					lpaQuestionnaireValidationOutcome: true
				}
			},
			siteVisit: true,
			hearing: true,
			inquiry: true
		},
		orderBy: { caseUpdatedDate: 'desc' },
		...pagination
	});

	return appeals;
};

/**
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @param {string} lpaCode
 * @param {number} inspectorId
 * @param {number} caseOfficerId
 * @param {boolean} isGreenBelt
 * @param {number} appealTypeId
 */
const getAllAppealsCount = async (
	searchTerm,
	status,
	hasInspector,
	lpaCode,
	inspectorId,
	caseOfficerId,
	isGreenBelt,
	appealTypeId
) => {
	const where = buildAllAppealsWhereClause(
		searchTerm,
		status,
		hasInspector,
		lpaCode,
		inspectorId,
		caseOfficerId,
		isGreenBelt,
		appealTypeId
	);

	const count = await databaseConnector.appeal.count({ where });

	return count;
};

/**
 * @param {string} searchTerm
 * @param {string} status
 * @param {string} hasInspector
 * @param {string} lpaCode
 * @param {number} inspectorId
 * @param {number} caseOfficerId
 * @param {boolean} isGreenBelt
 * @param {number} appealTypeId
 */
const buildAllAppealsWhereClause = (
	searchTerm,
	status,
	hasInspector,
	lpaCode,
	inspectorId,
	caseOfficerId,
	isGreenBelt,
	appealTypeId
) => {
	return {
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
				},
				{
					applicationReference: {
						contains: searchTerm
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
		}),
		...(!!appealTypeId && {
			appealTypeId
		})
	};
};

/**
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} [status]
 */
const getUserAppeals = (userId, pageNumber, pageSize, status) => {
	const where = {
		appealType: { key: { in: getEnabledAppealTypes() } },
		AND: [
			...(status
				? [
						{
							appealStatus: {
								some: { valid: true, status }
							}
						}
				  ]
				: []),
			{
				appealStatus: {
					some: {
						valid: true,
						status: {
							notIn: [
								APPEAL_CASE_STATUS.CLOSED,
								APPEAL_CASE_STATUS.TRANSFERRED,
								APPEAL_CASE_STATUS.INVALID,
								APPEAL_CASE_STATUS.WITHDRAWN,
								...(config.featureFlags.featureFlagNetResidence
									? []
									: [APPEAL_CASE_STATUS.COMPLETE])
							]
						}
					}
				}
			},
			config.featureFlags.featureFlagNetResidence
				? {
						OR: [
							{
								appealStatus: {
									none: {
										valid: true,
										status: APPEAL_CASE_STATUS.COMPLETE
									}
								}
							},
							{
								appealStatus: {
									some: {
										valid: true,
										status: APPEAL_CASE_STATUS.COMPLETE
									}
								},
								appellantCase: {
									numberOfResidencesNetChange: null
								},
								appealType: {
									key: APPEAL_CASE_TYPE.W
								}
							}
						]
				  }
				: {}
		],
		OR: [
			{ inspector: { azureAdUserId: { equals: userId } } },
			{ caseOfficer: { azureAdUserId: { equals: userId } } }
		]
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
				procedureType: true,
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
				representations: true,
				siteVisit: {
					include: { siteVisitType: true }
				},
				hearing: true,
				inquiry: true
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

/**
 * @returns {Promise<string[]>} a duplicate-free list of all appeal statuses in the national list
 */
const getAppealsStatusesInNationalList = async () => {
	const results = await databaseConnector.appealStatus.findMany({
		select: {
			status: true
		},
		distinct: ['status']
	});

	return results.map((result) => result.status);
};

export default {
	getAllAppeals,
	getAllAppealsCount,
	getUserAppeals,
	getAppealsStatusesInNationalList
};
