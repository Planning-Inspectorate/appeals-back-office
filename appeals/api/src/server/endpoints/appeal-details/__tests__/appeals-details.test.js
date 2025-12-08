// @ts-nocheck
import { notifySend } from '#notify/notify-send.js';
import { request } from '#server/app-test.js';
import { mocks } from '#tests/appeals/index.js';
import { savedFolder } from '#tests/documents/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_UNASSIGNED_INSPECTOR,
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED,
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_NUMBER,
	ERROR_MUST_BE_STRING,
	ERROR_MUST_BE_UUID,
	ERROR_MUST_NOT_BE_IN_FUTURE,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
jest.mock('#notify/notify-send.js');

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
	stateList: householdAppeal.stateList,
	completedStateList: [],
	appealType: householdAppeal.appealType.type,
	appealTimetable: {
		appealTimetableId: householdAppeal.appealTimetable.id,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate: householdAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString()
	},
	assignedTeam: {
		id: 1,
		email: 'temp@email.com',
		name: 'temp'
	},
	appellantCaseId: householdAppeal.appellantCase.id,
	awaitingLinkedAppeal: false,
	caseOfficer: householdAppeal.caseOfficer.azureAdUserId,
	costs: {},
	costsDecision: {
		awaitingAppellantCostsDecision: false,
		awaitingLpaCostsDecision: false
	},
	padsInspector: null,
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
	lpaEmailAddress: householdAppeal.lpa.email,
	lpaQuestionnaireId: householdAppeal.lpaQuestionnaire.id,
	planningApplicationReference: householdAppeal.applicationReference,
	procedureType: 'Written',
	createdAt: householdAppeal.caseCreatedDate.toISOString(),
	startedAt: householdAppeal.caseStartedDate?.toISOString(),
	validAt: householdAppeal.caseValidDate?.toISOString(),
	enforcementNotice: { appellantCase: {} }
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
	stateList: fullPlanningAppeal.stateList,
	completedStateList: [],
	appealTimetable: {
		appealTimetableId: fullPlanningAppeal.appealTimetable.id,
		caseResubmissionDueDate: null,
		lpaQuestionnaireDueDate:
			fullPlanningAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
		ipCommentsDueDate: fullPlanningAppeal.appealTimetable.ipCommentsDueDate.toISOString(),
		appellantStatementDueDate:
			fullPlanningAppeal.appealTimetable.appellantStatementDueDate.toISOString(),
		lpaStatementDueDate: fullPlanningAppeal.appealTimetable.lpaStatementDueDate.toISOString(),
		finalCommentsDueDate: fullPlanningAppeal.appealTimetable.finalCommentsDueDate.toISOString(),
		s106ObligationDueDate: fullPlanningAppeal.appealTimetable.s106ObligationDueDate.toISOString(),
		statementOfCommonGroundDueDate:
			fullPlanningAppeal.appealTimetable.statementOfCommonGroundDueDate.toISOString(),
		planningObligationDueDate:
			fullPlanningAppeal.appealTimetable.planningObligationDueDate.toISOString(),
		proofOfEvidenceAndWitnessesDueDate:
			fullPlanningAppeal.appealTimetable.proofOfEvidenceAndWitnessesDueDate.toISOString()
	},
	appealType: fullPlanningAppeal.appealType.type,
	appellantCaseId: fullPlanningAppeal.appellantCase.id,
	assignedTeam: {
		id: 1,
		email: 'temp@email.com',
		name: 'temp'
	},
	awaitingLinkedAppeal: false,
	caseOfficer: fullPlanningAppeal.caseOfficer.azureAdUserId,
	padsInspector: null,
	costs: {},
	costsDecision: {
		awaitingAppellantCostsDecision: false,
		awaitingLpaCostsDecision: false
	},
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
		appellantFinalComments: {
			receivedAt: '2024-11-27T15:08:55.704Z',
			representationStatus: 'awaiting_review',
			status: 'received'
		},
		lpaQuestionnaire: {
			dueDate: fullPlanningAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
			status: 'received',
			receivedAt: fullPlanningAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
		},
		ipComments: {
			status: 'received',
			counts: {
				awaiting_review: 5,
				valid: 4,
				invalid: 1
			},
			isRedacted: false,
			receivedAt: '2024-11-27T15:08:55.670Z'
		},
		lpaFinalComments: {
			receivedAt: '2024-11-27T15:08:55.711Z',
			representationStatus: 'awaiting_review',
			status: 'received'
		},
		lpaStatement: {
			status: 'not_received',
			receivedAt: null,
			representationStatus: null,
			isRedacted: false
		},
		appellantProofOfEvidence: {
			status: 'received',
			receivedAt: '2024-11-27T15:08:55.704Z',
			representationStatus: 'awaiting_review'
		},
		lpaProofOfEvidence: {
			status: 'received',
			receivedAt: '2024-11-27T15:08:55.711Z',
			representationStatus: 'awaiting_review'
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
	lpaEmailAddress: fullPlanningAppeal.lpa.email,
	lpaQuestionnaireId: fullPlanningAppeal.lpaQuestionnaire.id,
	planningApplicationReference: fullPlanningAppeal.applicationReference,
	procedureType: 'Written',
	createdAt: fullPlanningAppeal.caseCreatedDate.toISOString(),
	startedAt: fullPlanningAppeal.caseStartedDate?.toISOString(),
	validAt: fullPlanningAppeal.caseValidDate?.toISOString(),
	enforcementNotice: { appellantCase: {} }
};

const folders = [
	{
		...savedFolder,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	}
];

describe('Appeal detail routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.FRONT_OFFICE_URL =
			'https://appeal-planning-decision.service.gov.uk/appeals/1345264';
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/appeals/:appealId', () => {
		describe('GET', () => {
			test('gets a single household appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...mocks.householdAppeal,
					folders
				});

				const response = await request
					.get(`/appeals/${mocks.householdAppeal.id}?include=all`)
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
					.get(`/appeals/${fullPlanningAppeal.id}?include=all`)
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

				const response = await request
					.get('/appeals/3?include=all')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
				});
			});

			test('gets an appeal with a hearing', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					folders,
					hearing: {
						id: '123',
						hearingStartTime: new Date('2025-05-15T12:00:00.000Z'),
						address: {
							id: '123',
							addressLine1: '123 Main St',
							addressLine2: 'Apt 1',
							addressTown: 'Anytown',
							addressCounty: 'Anycounty',
							postcode: 'AA1 1AA'
						}
					}
				});

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}?include=all`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					...s78AppealDto,
					hearing: {
						hearingId: '123',
						hearingStartTime: '2025-05-15T12:00:00.000Z',
						hearingEndTime: '',
						address: {
							addressLine1: '123 Main St',
							addressLine2: 'Apt 1',
							town: 'Anytown',
							county: 'Anycounty',
							postcode: 'AA1 1AA'
						}
					}
				});
			});

			test('gets an appeal with a hearing with no address', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					folders,
					hearing: {
						id: '123',
						hearingStartTime: new Date('2025-05-15T12:00:00.000Z'),
						address: null
					}
				});

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}?include=all`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					...s78AppealDto,
					hearing: {
						hearingId: '123',
						hearingStartTime: '2025-05-15T12:00:00.000Z',
						hearingEndTime: ''
					}
				});
			});

			test('gets an appeal with rule 6 parties', async () => {
				const rule6Party = {
					id: '123',
					appealId: fullPlanningAppeal.id,
					serviceUserId: '123',
					serviceUser: {
						id: '123',
						organisationName: 'Test Organisation',
						email: 'test@example.com'
					}
				};

				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...fullPlanningAppeal,
					folders,
					appealRule6Parties: [rule6Party]
				});

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}?include=all`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					...s78AppealDto,
					appealRule6Parties: [rule6Party]
				});
			});
		});

		describe('PATCH', () => {
			test('updates an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						startedAt: '2023-05-05T00:00:00.000Z',
						validAt: '2023-05-25T00:00:00.000Z'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						caseStartedDate: '2023-05-05T00:00:00.000Z',
						caseValidDate: '2023-05-25T00:00:00.000Z',
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					startedAt: '2023-05-05T00:00:00.000Z',
					validAt: '2023-05-25T00:00:00.000Z'
				});
			});

			test('updates the planning application reference', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						planningApplicationReference: '1234/A/567890'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						applicationReference: '1234/A/567890',
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					planningApplicationReference: '1234/A/567890'
				});
			});

			test('assigns a case officer to an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					caseOfficerId: null,
					caseOfficer: undefined
				});
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.caseOfficer);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						caseOfficerId: householdAppeal.caseOfficer.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						caseOfficerUserId: householdAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: householdAppeal.id
					}
				});

				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							householdAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					caseOfficerId: householdAppeal.caseOfficer.azureAdUserId
				});
			});

			test('replace a case officer in an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.caseOfficer);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						caseOfficerId: householdAppeal.caseOfficer.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						caseOfficerUserId: householdAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							householdAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					caseOfficerId: householdAppeal.caseOfficer.azureAdUserId
				});
			});

			test('assigns an inspector to an appeal', async () => {
				const inspectorId = '37b537ee-8a4e-42c3-8b97-089ddb8949e7';
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({ id: 10, azureAdUserId: inspectorId });

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspectorId: inspectorId,
						inspectorName: 'Tom Harry',
						padsInspectorId: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: 10,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: householdAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

				const site_address =
					householdAppeal.address.addressLine1 +
					', ' +
					(householdAppeal.address.addressLine2
						? householdAppeal.address.addressLine2 + ', '
						: '') +
					householdAppeal.address.addressTown +
					', ' +
					householdAppeal.address.postcode;

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.appellant.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.lpa.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.agent.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledTimes(3);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspectorId]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspectorId,
					padsInspectorId: null
				});
			});

			test('unassigns an inspector from an appeal', async () => {
				const inspector = azureAdUserId;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					inspector: { azureAdUserId: inspector }
				});
				databaseConnector.user.upsert.mockResolvedValue({ id: 10, azureAdUserId: inspector });

				// @ts-ignore
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspectorId: null,
						inspectorName: null,
						padsInspectorId: null,
						prevUserName: 'Tom Harry'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: null,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: householdAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

				const site_address =
					householdAppeal.address.addressLine1 +
					', ' +
					(householdAppeal.address.addressLine2
						? householdAppeal.address.addressLine2 + ', '
						: '') +
					householdAppeal.address.addressTown +
					', ' +
					householdAppeal.address.postcode;

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.appellant.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.lpa.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.agent.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledTimes(3);
				expect(notifySend).toHaveBeenCalledTimes(3);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_UNASSIGNED_INSPECTOR, [inspector]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspectorId: null,
					padsInspectorId: null
				});
			});

			test('assigns a PADS inspector to an appeal', async () => {
				const padsInspectorId = '123345';
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspectorId: null,
						inspectorName: 'Tom Harry',
						padsInspectorId: padsInspectorId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: null,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: padsInspectorId
					},
					where: {
						id: householdAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);

				const site_address =
					householdAppeal.address.addressLine1 +
					', ' +
					(householdAppeal.address.addressLine2
						? householdAppeal.address.addressLine2 + ', '
						: '') +
					householdAppeal.address.addressTown +
					', ' +
					householdAppeal.address.postcode;

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.appellant.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.lpa.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-assign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.agent.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledTimes(3);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [padsInspectorId]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					padsInspectorId,
					inspectorId: null
				});
			});

			test('unassigns a PADS inspector from an appeal', async () => {
				const padsInspector = azureAdUserId;
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					padsInspector: { azureAdUserId: padsInspector }
				});

				// @ts-ignore
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspectorId: null,
						inspectorName: null,
						padsInspectorId: null,
						prevUserName: 'Tom Harry'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: null,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: householdAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});

				const site_address =
					householdAppeal.address.addressLine1 +
					', ' +
					(householdAppeal.address.addressLine2
						? householdAppeal.address.addressLine2 + ', '
						: '') +
					householdAppeal.address.addressTown +
					', ' +
					householdAppeal.address.postcode;

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.appellant.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.lpa.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});

				expect(notifySend).toHaveBeenCalledWith({
					azureAdUserId: azureAdUserId,
					templateName: 'appeal-unassign-inspector',
					notifyClient: expect.any(Object),
					recipientEmail: householdAppeal.agent.email,
					personalisation: {
						appeal_reference_number: householdAppeal.reference,
						site_address: site_address,
						lpa_reference: householdAppeal.applicationReference,
						team_email_address: 'caseofficers@planninginspectorate.gov.uk',
						inspector_name: 'Tom Harry'
					}
				});
				expect(notifySend).toHaveBeenCalledTimes(3);
				expect(notifySend).toHaveBeenCalledTimes(3);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspectorId: null,
					padsInspectorId: null
				});
			});

			test('assigns a case officer to linked appeals', async () => {
				const leadAppeal = structuredClone(householdAppeal);
				leadAppeal.childAppeals = [
					{ child: { id: 10 }, childId: 10, type: CASE_RELATIONSHIP_LINKED },
					{ child: { id: 20 }, childId: 20, type: CASE_RELATIONSHIP_RELATED },
					{ child: { id: 30 }, childId: 30, type: CASE_RELATIONSHIP_LINKED }
				];
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...leadAppeal,
					caseOfficerId: null,
					caseOfficer: undefined
				});
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(leadAppeal.caseOfficer);
				const response = await request
					.patch(`/appeals/${leadAppeal.id}`)
					.send({
						caseOfficerId: leadAppeal.caseOfficer.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);
				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(3);
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(1, {
					data: {
						caseOfficerUserId: leadAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: leadAppeal.id
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(2, {
					data: {
						caseOfficerUserId: leadAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: leadAppeal.childAppeals[0].childId
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(3, {
					data: {
						caseOfficerUserId: leadAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					include: {
						appealStatus: true,
						appealType: true
					},
					where: {
						id: leadAppeal.childAppeals[2].childId
					}
				});

				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(3);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: leadAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: leadAppeal.childAppeals[0].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
					data: {
						appealId: leadAppeal.childAppeals[2].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					caseOfficerId: leadAppeal.caseOfficer.azureAdUserId
				});
			});

			test('replace a case officer to linked appeals', async () => {
				const leadAppeal = structuredClone(householdAppeal);
				leadAppeal.childAppeals = [
					{ child: { id: 10 }, childId: 10, type: CASE_RELATIONSHIP_LINKED },
					{ child: { id: 20 }, childId: 20, type: CASE_RELATIONSHIP_RELATED },
					{ child: { id: 30 }, childId: 30, type: CASE_RELATIONSHIP_LINKED }
				];
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(leadAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(leadAppeal.caseOfficer);

				const response = await request
					.patch(`/appeals/${leadAppeal.id}`)
					.send({
						caseOfficerId: leadAppeal.caseOfficer.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(3);
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(1, {
					data: {
						caseOfficerUserId: 1,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: leadAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(2, {
					data: {
						caseOfficerUserId: 1,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: leadAppeal.childAppeals[0].childId
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(3, {
					data: {
						caseOfficerUserId: 1,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: leadAppeal.childAppeals[2].childId
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});

				expect(databaseConnector.appealStatus.create).not.toHaveBeenCalled();

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(3);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: leadAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: leadAppeal.childAppeals[0].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
					data: {
						appealId: leadAppeal.childAppeals[2].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [
							leadAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: leadAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					caseOfficerId: leadAppeal.caseOfficer.azureAdUserId
				});
			});

			test('assigns an inspector to linked appeals', async () => {
				const leadAppeal = structuredClone(householdAppeal);
				leadAppeal.childAppeals = [
					{ child: { id: 10 }, childId: 10, type: CASE_RELATIONSHIP_LINKED },
					{ child: { id: 20 }, childId: 20, type: CASE_RELATIONSHIP_RELATED },
					{ child: { id: 30 }, childId: 30, type: CASE_RELATIONSHIP_LINKED }
				];
				const inspector = '37b537ee-8a4e-42c3-8b97-089ddb8949e7';
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(leadAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue({ id: 10, azureAdUserId: inspector });

				const response = await request
					.patch(`/appeals/${leadAppeal.id}`)
					.send({
						inspectorId: inspector
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(3);
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(1, {
					data: {
						inspectorUserId: 10,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: leadAppeal.id
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(2, {
					data: {
						inspectorUserId: 10,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: leadAppeal.childAppeals[0].childId
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});
				expect(databaseConnector.appeal.update).toHaveBeenNthCalledWith(3, {
					data: {
						inspectorUserId: 10,
						caseUpdatedDate: expect.any(Date),
						padsInspectorUserId: null
					},
					where: {
						id: leadAppeal.childAppeals[2].childId
					},
					include: {
						appealStatus: true,
						appealType: true
					}
				});

				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(3);
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
					data: {
						appealId: leadAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
					data: {
						appealId: leadAppeal.childAppeals[0].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(3, {
					data: {
						appealId: leadAppeal.childAppeals[2].childId,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]),
						loggedAt: expect.any(Date),
						userId: 10
					}
				});

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspectorId: inspector
				});
			});

			test('returns an error if startedAt is not in the correct format', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						startedAt: '05/05/2023'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						startedAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if startedAt does not contain leading zeros', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						startedAt: '2023-5-5'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						startedAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if startedAt is not a valid date', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						startedAt: '2023-02-30'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						startedAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if validAt is not in the correct format', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						validAt: '05/05/2023'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if validAt does not contain leading zeros', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						validAt: '2023-5-5'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if validAt is not a valid date', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						validAt: '2023-02-30'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validAt: ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT
					}
				});
			});

			test('returns an error if validAt is in the future', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						validAt: '3000-02-02T00:00:00.000Z'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						validAt: ERROR_MUST_NOT_BE_IN_FUTURE
					}
				});
			});

			test('returns an error if caseOfficer is not a valid uuid', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						caseOfficerId: '1'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						caseOfficerId: ERROR_MUST_BE_UUID
					}
				});
			});

			test('returns an error if inspector is not a valid uuid', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspectorId: '1'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inspectorId: ERROR_MUST_BE_UUID
					}
				});
			});

			test('returns an error if given an incorrect field name', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				// @ts-ignore
				databaseConnector.appeal.update.mockImplementationOnce(() => {
					throw new Error(ERROR_FAILED_TO_SAVE_DATA);
				});

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						startedAtDate: '2023-02-10'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({
					errors: {
						body: ERROR_FAILED_TO_SAVE_DATA
					}
				});
			});

			test('returns an error if the planning application reference is not a string', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						planningApplicationReference: 123
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						planningApplicationReference: ERROR_MUST_BE_STRING
					}
				});
			});

			test('returns an error if the planning application reference is empty', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						planningApplicationReference: ''
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						planningApplicationReference: ERROR_CANNOT_BE_EMPTY_STRING
					}
				});
			});

			test('returns an error if the planning application reference null', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						planningApplicationReference: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						planningApplicationReference: ERROR_MUST_BE_STRING
					}
				});
			});

			test('does not throw an error if given an empty body', async () => {
				// @ts-ignore
				databaseConnector.appeal.update.mockResolvedValue(true);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});
		});
	});
});

describe('appeals/case-reference/:caseReference', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
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
