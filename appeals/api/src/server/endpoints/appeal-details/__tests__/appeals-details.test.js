import { request } from '#tests/../app-test.js';
import { mocks } from '#tests/appeals/index.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { savedFolder } from '#tests/documents/mocks.js';
import { ERROR_MUST_BE_NUMBER, ERROR_NOT_FOUND } from '#endpoints/constants.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';

const { databaseConnector } = await import('#utils/database-connector.js');
const householdAppeal = mocks.householdAppeal;
const fullPlanningAppeal = mocks.s78Appeal;

const householdAppealDto = {
	neighbouringSites: [],
	agent: {
		serviceUserId: householdAppeal.agent.id,
		firstName: householdAppeal.agent.firstName,
		lastName: householdAppeal.agent.lastName,
		email: householdAppeal.agent.email,
		phoneNumber: householdAppeal.agent.phoneNumber || null,
		organisationName: householdAppeal.agent.organisationName || null
	},
	appellant: {
		serviceUserId: householdAppeal.appellant.id,
		firstName: householdAppeal.appellant.firstName,
		lastName: householdAppeal.appellant.lastName,
		email: householdAppeal.appellant.email,
		phoneNumber: householdAppeal.appellant.phoneNumber || null,
		organisationName: householdAppeal.appellant.organisationName || null
	},
	appealId: householdAppeal.id,
	appealReference: householdAppeal.reference,
	appealSite: {
		addressId: householdAppeal.address.id,
		addressLine1: householdAppeal.address.addressLine1,
		addressLine2: householdAppeal.address.addressLine2,
		town: householdAppeal.address.addressTown,
		postCode: householdAppeal.address.postcode
	},
	appealStatus: householdAppeal.appealStatus[0].status,
	appealType: householdAppeal.appealType.type,
	appealTimetable: {
		appealTimetableId: householdAppeal.appealTimetable.id,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate: householdAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString()
	},
	appellantCaseId: householdAppeal.appellantCase.id,
	caseOfficer: householdAppeal.caseOfficer.azureAdUserId,
	costs: {},
	internalCorrespondence: {},
	decision: {
		folderId: savedFolder.id,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	},
	documentationSummary: {
		appellantCase: {
			dueDate: null,
			status: 'Valid',
			receivedAt: householdAppeal.caseCreatedDate.toISOString()
		},
		lpaQuestionnaire: {
			dueDate: householdAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
			status: 'received',
			receivedAt: householdAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
		}
	},
	healthAndSafety: {
		appellantCase: {
			details: householdAppeal.appellantCase.siteSafetyDetails,
			hasIssues: householdAppeal.appellantCase.siteSafetyDetails !== null
		},
		lpaQuestionnaire: {
			details: householdAppeal.lpaQuestionnaire.siteSafetyDetails,
			hasIssues: householdAppeal.lpaQuestionnaire.siteSafetyDetails !== null
		}
	},
	inspectorAccess: {
		appellantCase: {
			details: householdAppeal.appellantCase.siteAccessDetails,
			isRequired: householdAppeal.appellantCase.siteAccessDetails !== null
		},
		lpaQuestionnaire: {
			details: householdAppeal.lpaQuestionnaire.siteAccessDetails,
			isRequired: householdAppeal.lpaQuestionnaire.siteAccessDetails !== null
		}
	},
	isParentAppeal: false,
	isChildAppeal: false,
	linkedAppeals: [],
	otherAppeals: [],
	localPlanningDepartment: householdAppeal.lpa.name,
	lpaQuestionnaireId: householdAppeal.lpaQuestionnaire.id,
	planningApplicationReference: householdAppeal.applicationReference,
	procedureType: 'Written',
	createdAt: householdAppeal.caseCreatedDate.toISOString(),
	startedAt: householdAppeal.caseStartedDate?.toISOString(),
	validAt: householdAppeal.caseValidDate?.toISOString()
};

const s78AppealDto = {
	neighbouringSites: [],
	appellant: {
		serviceUserId: fullPlanningAppeal.appellant.id,
		firstName: fullPlanningAppeal.appellant.firstName,
		lastName: fullPlanningAppeal.appellant.lastName,
		email: fullPlanningAppeal.appellant.email,
		phoneNumber: fullPlanningAppeal.appellant.phoneNumber,
		organisationName: fullPlanningAppeal.appellant.organisationName
	},
	appealId: fullPlanningAppeal.id,
	appealReference: fullPlanningAppeal.reference,
	appealSite: {
		addressId: fullPlanningAppeal.address.id,
		addressLine1: fullPlanningAppeal.address.addressLine1,
		town: fullPlanningAppeal.address.addressTown,
		postCode: fullPlanningAppeal.address.postcode
	},
	appealStatus: fullPlanningAppeal.appealStatus[0].status,
	appealTimetable: {
		appealTimetableId: fullPlanningAppeal.appealTimetable.id,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate:
			fullPlanningAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
		ipCommentsDueDate: fullPlanningAppeal.appealTimetable.ipCommentsDueDate.toISOString(),
		appellantStatementDueDate:
			fullPlanningAppeal.appealTimetable.appellantStatementDueDate.toISOString(),
		lpaStatementDueDate: fullPlanningAppeal.appealTimetable.lpaStatementDueDate.toISOString(),
		appellantFinalCommentsDueDate:
			fullPlanningAppeal.appealTimetable.appellantFinalCommentsDueDate.toISOString(),
		lpaFinalCommentsDueDate:
			fullPlanningAppeal.appealTimetable.lpaFinalCommentsDueDate.toISOString(),
		s106ObligationDueDate: fullPlanningAppeal.appealTimetable.s106ObligationDueDate.toISOString()
	},
	appealType: fullPlanningAppeal.appealType.type,
	appellantCaseId: fullPlanningAppeal.appellantCase.id,
	caseOfficer: fullPlanningAppeal.caseOfficer.azureAdUserId,
	costs: {},
	decision: {
		folderId: savedFolder.id,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	},
	internalCorrespondence: {},
	documentationSummary: {
		appellantCase: {
			dueDate: null,
			status: 'Valid',
			receivedAt: fullPlanningAppeal.caseCreatedDate.toISOString()
		},
		lpaQuestionnaire: {
			dueDate: fullPlanningAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
			status: 'received',
			receivedAt: fullPlanningAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
		},
		ipComments: {
			status: 'received'
		},
		lpaStatement: {
			status: 'not_received',
			receivedAt: null
		}
	},
	healthAndSafety: {
		appellantCase: {
			details: fullPlanningAppeal.appellantCase.siteSafetyDetails,
			hasIssues: fullPlanningAppeal.appellantCase.siteSafetyDetails !== null
		},
		lpaQuestionnaire: {
			details: fullPlanningAppeal.lpaQuestionnaire.siteSafetyDetails,
			hasIssues: fullPlanningAppeal.lpaQuestionnaire.siteSafetyDetails !== null
		}
	},
	inspectorAccess: {
		appellantCase: {
			details: fullPlanningAppeal.appellantCase.siteAccessDetails,
			isRequired: fullPlanningAppeal.appellantCase.siteAccessDetails !== null
		},
		lpaQuestionnaire: {
			details: fullPlanningAppeal.lpaQuestionnaire.siteAccessDetails,
			isRequired: fullPlanningAppeal.lpaQuestionnaire.siteAccessDetails !== null
		}
	},
	isParentAppeal: false,
	isChildAppeal: false,
	linkedAppeals: [],
	otherAppeals: [],
	localPlanningDepartment: fullPlanningAppeal.lpa.name,
	lpaQuestionnaireId: fullPlanningAppeal.lpaQuestionnaire.id,
	planningApplicationReference: fullPlanningAppeal.applicationReference,
	procedureType: 'Written',
	createdAt: fullPlanningAppeal.caseCreatedDate.toISOString(),
	startedAt: fullPlanningAppeal.caseStartedDate?.toISOString(),
	validAt: fullPlanningAppeal.caseValidDate?.toISOString()
};

describe('Appeal detail routes', () => {
	describe('/appeals/:appealId', () => {
		describe('GET', () => {
			test('gets a single household appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mocks.householdAppeal,
					folders: [
						{
							...savedFolder,
							path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
						}
					]
				});

				const response = await request
					.get(`/appeals/${mocks.householdAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(householdAppealDto);
			});

			test('gets a single full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					folders: [
						{
							...savedFolder,
							path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
						}
					]
				});

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(s78AppealDto);
			});

			test('returns an error if appealId is not numeric', async () => {
				const response = await request.get('/appeals/one').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if appealId is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request.get('/appeals/3').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});
		});
	});

	describe('appeals/case-reference/:caseReference', () => {
		describe('GET', () => {
			test('gets a single household appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mocks.householdAppeal,
					folders: [
						{
							...savedFolder,
							path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
						}
					]
				});
				const response = await request
					.get(`/appeals/case-reference/${mocks.householdAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(householdAppealDto);
			});

			test('gets a single full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					folders: [
						{
							...savedFolder,
							path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
						}
					]
				});

				const response = await request
					.get(`/appeals/case-reference/${mocks.s78Appeal.reference}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(s78AppealDto);
			});
			test('returns an error if a caseReference is not found', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request
					.get('/appeals/case-reference/5')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						caseReference: ERROR_NOT_FOUND
					}
				});
			});
		});
	});
});
