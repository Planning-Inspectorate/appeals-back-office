import { databaseConnector } from '#utils/database-connector.js';
import { getSkipValue } from '#utils/database-pagination.js';
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

/** @satisfies {import('#db-client/models.ts').PersonalListFindManyArgs['select'] } */
const personalListSelect = {
	id: true,
	appealId: true,
	linkType: true,
	leadAppealId: true,
	dueDate: true,
	appeal: {
		select: {
			id: true,
			reference: true,
			caseExtensionDate: true,
			currentStatus: true,
			caseCreatedDate: true,
			appealStatus: {
				select: {
					status: true,
					valid: true,
					createdAt: true
				}
			},
			appellantCase: {
				select: {
					numberOfResidencesNetChange: true,
					applicationDate: true,
					applicationDecision: true,
					typeOfPlanningApplication: true,
					appellantCaseValidationOutcomeId: true,
					appellantCaseValidationOutcome: {
						select: {
							name: true
						}
					}
				}
			},
			appealType: {
				select: {
					type: true,
					key: true
				}
			},
			lpaQuestionnaire: {
				select: {
					id: true,
					lpaqCreatedDate: true,
					lpaQuestionnaireValidationOutcome: {
						select: {
							name: true
						}
					}
				}
			},
			procedureType: {
				select: {
					name: true
				}
			},
			inquiry: {
				select: {
					addressId: true
				}
			},
			hearing: {
				select: {
					addressId: true
				}
			},
			enforcementNoticeAppealOutcome: {
				select: {
					enforcementNoticeInvalid: true
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
			representations: {
				select: {
					representationType: true,
					representedId: true,
					status: true,
					dateCreated: true,
					isRedacted: true
				}
			},
			appealRule6Parties: {
				select: {
					id: true,
					serviceUserId: true,
					serviceUser: {
						select: {
							organisationName: true
						}
					}
				}
			}
		}
	}
};

/** @typedef {typeof personalListSelect} PersonalListSelect */
/** @typedef {import('#db-client/models.ts').PersonalListGetPayload<{ select: PersonalListSelect }>} PersonalListSelected */
/** @typedef {Awaited<ReturnType<getPersonalList>>} getPersonalListRepoResponse */

/**
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} [status]
 * @param {number|null} [leadAppealId]
 * @returns {Promise<{personalList: PersonalListSelected[], itemCount?: number, statuses?: string[]}>}
 */
const getPersonalList = async (userId, pageNumber, pageSize, status, leadAppealId) => {
	/**
	 * @param {{status?: string, leadAppealId?: number|null}} param0
	 */
	const where = ({ status, leadAppealId }) => {
		const statusFilter = status
			? {
					currentStatus: status
				}
			: {
					currentStatus: {
						in: Object.values(APPEAL_CASE_STATUS).filter(
							(x) => x !== APPEAL_CASE_STATUS.TRANSFERRED && x !== APPEAL_CASE_STATUS.INVALID
						)
					}
				};
		return {
			AND: [
				{
					...(leadAppealId ? { leadAppealId: leadAppealId } : {}),
					dueDate: { not: null }
				},
				{
					appeal: {
						is: {
							...statusFilter,
							OR: [
								{ inspector: { azureAdUserId: userId } },
								{ caseOfficer: { azureAdUserId: userId } }
							]
						}
					}
				}
			]
		};
	};

	return databaseConnector.$transaction(async (tx) => {
		const personalList = await tx.personalList.findMany({
			where: where({ status, leadAppealId }),
			select: personalListSelect,
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
						currentStatus: true
					}
				}
			}
		});

		const statuses = [...new Set(appealStatuses.map(({ appeal }) => appeal.currentStatus))];

		return { itemCount, personalList, statuses };
	});
};

export default {
	getPersonalList,
	upsertPersonalListEntry
};
