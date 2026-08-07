import type { PrismaClient } from '@pins/appeals-database/src/client/client.ts';
import type {
	AppealFindManyArgs,
	AppealWhereInput
} from '@pins/appeals-database/src/client/models/Appeal';
import { TEAM_NAME_MAP } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { paginationDefaultSettings } from '../appeal.constants.js';

export interface GetAppealsArgs {
	searchTerm?: string;
	appealStatusFilter?: string;
	inspectorStatusFilter?: string;
	localPlanningAuthorityFilter?: string;
	caseOfficerFilter?: string;
	inspectorFilter?: string;
	greenBeltFilter?: string;
	appealTypeFilter?: string;
	caseTeamFilter?: string;
	appealProcedureFilter?: string;
	appellantProcedurePreferencePreFilter?: string;
	pageNumber?: number;
	pageSize?: number;
}

export type GetAppealsResponse = Awaited<
	ReturnType<typeof NationalListService.prototype.getAppeals>
>;
export type GetAppealTypesResponse = Awaited<
	ReturnType<typeof NationalListService.prototype.getAppealTypes>
>;
export type GetCaseTeamsResponse = Awaited<
	ReturnType<typeof NationalListService.prototype.getCaseTeams>
>;

export class NationalListService {
	dbClient: PrismaClient;
	constructor(dbClient: PrismaClient) {
		this.dbClient = dbClient;
	}

	async getAppeals({
		searchTerm,
		appealStatusFilter,
		inspectorStatusFilter,
		localPlanningAuthorityFilter,
		caseOfficerFilter,
		inspectorFilter,
		greenBeltFilter,
		appealTypeFilter,
		caseTeamFilter,
		appealProcedureFilter,
		appellantProcedurePreferencePreFilter,
		pageNumber = paginationDefaultSettings.firstPageNumber,
		pageSize = paginationDefaultSettings.pageSize
	}: GetAppealsArgs) {
		// fixme: note that some filters overwrite previous ones,
		//  e.g. searchTerms are overwritten by inspector status
		const where: AppealWhereInput = {
			// do we need this? all types look to be enabled
			// appealType: {
			// 	key: {in: []} // enabled types
			// }
		};

		if (searchTerm && searchTerm !== '') {
			where.OR = [
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
				},
				{
					appellantCase: {
						enforcementReference: {
							contains: searchTerm
						}
					}
				}
			];
		}

		if (appealStatusFilter && appealStatusFilter !== 'all') {
			where.currentStatus = appealStatusFilter;
		}

		if (inspectorStatusFilter && inspectorStatusFilter !== 'all') {
			if (inspectorStatusFilter === 'assigned') {
				where.OR = [{ inspectorUserId: { not: null } }, { padsInspectorUserId: { not: null } }];
			} else if (inspectorStatusFilter === 'unassigned') {
				where.OR = [{ inspectorUserId: null }, { padsInspectorUserId: null }];
			}
		}

		if (localPlanningAuthorityFilter && localPlanningAuthorityFilter !== 'all') {
			where.lpa = { lpaCode: localPlanningAuthorityFilter };
		}

		if (caseOfficerFilter && caseOfficerFilter !== 'all') {
			where.caseOfficerUserId = Number(caseOfficerFilter);
		}

		if (inspectorFilter && inspectorFilter !== 'all') {
			if (inspectorFilter.length <= 5) {
				where.inspectorUserId = Number(inspectorFilter);
			} else {
				where.padsInspectorUserId = inspectorFilter;
			}
		}

		if (greenBeltFilter) {
			where.appellantCase = { isGreenBelt: true };
		}

		if (appealTypeFilter && appealTypeFilter !== 'all') {
			where.appealTypeId = Number(appealTypeFilter);
		}
		if (caseTeamFilter && caseTeamFilter !== 'all') {
			const teamId = Number(caseTeamFilter);
			if (teamId === -1) {
				where.assignedTeamId = null;
			} else {
				where.assignedTeamId = teamId;
			}
		}

		if (appealProcedureFilter && appealProcedureFilter !== 'all') {
			where.procedureTypeId = Number(appealProcedureFilter);
		}

		if (appellantProcedurePreferencePreFilter && appellantProcedurePreferencePreFilter !== 'all') {
			where.currentStatus = {
				in: [
					APPEAL_CASE_STATUS.READY_TO_START,
					APPEAL_CASE_STATUS.VALIDATION,
					APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER
				]
			};
			where.appellantCase = {
				appellantProcedurePreference: appellantProcedurePreferencePreFilter
			};
		}

		const pagination: { take?: number; skip?: number } = {};
		if (pageNumber && pageSize) {
			pagination.skip = (pageNumber - 1) * pageSize;
			pagination.take = pageSize;
		}
		const findManyArgs = {
			where,
			orderBy: { caseUpdatedDate: 'desc' },
			select: {
				// appeal fields
				id: true,
				reference: true,
				applicationReference: true,
				currentStatus: true,
				// relation fields
				address: true,
				appealType: { select: { type: true } },
				appellantCase: { select: { enforcementReference: true } },
				procedureType: { select: { name: true } },
				lpa: { select: { name: true } }
			},
			...pagination
		} satisfies AppealFindManyArgs;

		const findAllArgs = {
			where,
			select: {
				lpa: { select: { name: true, lpaCode: true } },
				inspector: { select: { id: true, azureAdUserId: true } },
				caseOfficer: { select: { id: true, azureAdUserId: true } },
				padsInspector: { select: { name: true, sapId: true } }
			}
		} satisfies AppealFindManyArgs;

		const [appealsPage, allAppeals] = await Promise.all([
			// get the page of appeals which match the filter criteria,
			// and the relation fields required for the view
			this.dbClient.appeal.findMany(findManyArgs),
			// get all appeals which match the filter criteria,
			// and the relations needed for the filter controls
			this.dbClient.appeal.findMany(findAllArgs)
		]);
		return { appealsPage, allAppeals };
	}

	getAppealTypes() {
		// TODO: this can be cached
		return this.dbClient.appealType.findMany();
	}

	getAppealProcedureTypes() {
		// TODO: this can be cached
		return this.dbClient.procedureType.findMany();
	}

	async getAppealsStatusesInNationalList() {
		const appeals = await this.dbClient.appeal.findMany({
			distinct: 'currentStatus',
			select: { currentStatus: true }
		});
		return appeals.map((appeal) => appeal.currentStatus);
	}

	getCaseTeams() {
		// TODO: this can be cached
		return this.dbClient.team.findMany({
			where: {
				NOT: {
					name: TEAM_NAME_MAP.ENFORCEMENT_APPEALS_TEAM
				}
			},
			select: {
				id: true,
				name: true,
				email: true
			}
		});
	}
}
