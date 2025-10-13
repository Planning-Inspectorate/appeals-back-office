import { databaseConnector } from '#utils/database-connector.js';
import { getSkipValue } from '#utils/database-pagination.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.PersonalList} PersonalList */

/**
 * Upserts a personal list entry by appeal id
 * @param {PersonalList} data
 * @returns {Promise<PersonalList>}
 */
const upsertPersonalListEntry = async (data) => {
	const { appealId, ...createData } = data;
	// @ts-ignore
	return databaseConnector.personalList.upsert({
		// @ts-ignore
		where: { appealId },
		// @ts-ignore
		create: { ...createData, appeal: { connect: { id: appealId } } },
		update: data
	});
};

/**
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} [status]
 * @param {number} [leadAppealId]
 * @returns {Promise<{personalList: PersonalList[], itemCount?: number, statuses?: string[]}>}
 */
const getPersonalList = async (userId, pageNumber, pageSize, status, leadAppealId) => {
	/**
	 * @param {{status?: string, leadAppealId?: number}} param0
	 * @returns {*}
	 */
	const where = ({ status, leadAppealId }) => ({
		AND: [
			{
				...(leadAppealId ? { leadAppealId: { equals: leadAppealId } } : {}),
				dueDate: { not: null }
			},
			{
				appeal: {
					is: {
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
											notIn: [APPEAL_CASE_STATUS.TRANSFERRED, APPEAL_CASE_STATUS.INVALID]
										}
									}
								}
							}
						],
						OR: [
							{ inspector: { azureAdUserId: { equals: userId } } },
							{ caseOfficer: { azureAdUserId: { equals: userId } } }
						]
					}
				}
			}
		]
	});

	return databaseConnector.$transaction(async (tx) => {
		const personalList = await tx.personalList.findMany({
			where: where({ status, leadAppealId }),
			include: {
				appeal: {
					include: {
						appealStatus: true,
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
					}
				}
			},
			skip: getSkipValue(pageNumber, pageSize),
			take: pageSize,
			orderBy: [
				{
					dueDate: 'asc'
				},
				{
					leadAppealId: 'asc'
				},
				{
					linkType: 'desc'
				},
				{
					appealId: 'asc'
				}
			]
		});

		if (leadAppealId) {
			return { personalList };
		}

		const itemCount = await tx.personalList.count({ where: where({ status }) });

		const appealStatuses = await tx.personalList.findMany({
			where: where({}),
			select: {
				appeal: {
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
				}
			}
		});

		const statuses = [
			...new Set(appealStatuses.map(({ appeal }) => appeal.appealStatus[0].status))
		];

		return { itemCount, personalList, statuses };
	});
};

export default {
	getPersonalList,
	upsertPersonalListEntry
};
