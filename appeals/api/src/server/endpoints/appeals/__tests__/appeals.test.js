import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_REMOVED_CASE_OFFICER,
	AUDIT_TRAIL_REMOVED_INSPECTOR,
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_LENGTH_BETWEEN_2_AND_8_CHARACTERS,
	ERROR_MUST_BE_BOOLEAN,
	ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT,
	ERROR_MUST_BE_GREATER_THAN_ZERO,
	ERROR_MUST_BE_NUMBER,
	ERROR_MUST_BE_SET_AS_HEADER,
	ERROR_MUST_BE_STRING,
	ERROR_MUST_BE_UUID,
	ERROR_MUST_BE_VALID_APPEAL_STATE,
	ERROR_MUST_NOT_BE_IN_FUTURE,
	ERROR_NOT_FOUND,
	ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
} from '../../constants.js';
import { savedFolder, decisionFolder } from '#tests/documents/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, fullPlanningAppeal, linkedAppeals } from '#tests/appeals/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { getIdsOfReferencedAppeals, mapAppealToDueDate } from '../appeals.formatter.js';
import { mapAppealStatuses } from '../appeals.controller.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('appeals list routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/appeals', () => {
		describe('GET', () => {
			test('gets appeals when not given pagination params or a search term', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(2);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal, fullPlanningAppeal]);

				const response = await request.get('/appeals').set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						skip: 0,
						take: 30
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 2,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						},
						{
							appealId: fullPlanningAppeal.id,
							appealReference: fullPlanningAppeal.reference,
							appealSite: {
								addressLine1: fullPlanningAppeal.address.addressLine1,
								addressLine2: fullPlanningAppeal.address.addressLine2,
								town: fullPlanningAppeal.address.addressTown,
								county: fullPlanningAppeal.address.addressCounty,
								postCode: fullPlanningAppeal.address.postcode
							},
							appealStatus: fullPlanningAppeal.appealStatus[0].status,
							appealType: fullPlanningAppeal.appealType.type,
							createdAt: fullPlanningAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: fullPlanningAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given pagination params', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([fullPlanningAppeal]);

				const response = await request
					.get('/appeals?pageNumber=2&pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						skip: 1,
						take: 1
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: fullPlanningAppeal.id,
							appealReference: fullPlanningAppeal.reference,
							appealSite: {
								addressLine1: fullPlanningAppeal.address.addressLine1,
								addressLine2: fullPlanningAppeal.address.addressLine2,
								town: fullPlanningAppeal.address.addressTown,
								county: fullPlanningAppeal.address.addressCounty,
								postCode: fullPlanningAppeal.address.postcode
							},
							appealStatus: fullPlanningAppeal.appealStatus[0].status,
							appealType: fullPlanningAppeal.appealType.type,
							createdAt: fullPlanningAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: fullPlanningAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 2,
					pageCount: 1,
					pageSize: 1,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given an uppercase search term', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?searchTerm=MD21')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							OR: [
								{
									reference: {
										contains: 'MD21'
									}
								},
								{
									address: {
										postcode: {
											contains: 'MD21'
										}
									}
								}
							],
							appealStatus: {
								some: {
									valid: true
								}
							}
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a lowercase search term', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?searchTerm=md21')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							OR: [
								{
									reference: {
										contains: 'md21'
									}
								},
								{
									address: {
										postcode: {
											contains: 'md21'
										}
									}
								}
							],
							appealStatus: {
								some: {
									valid: true
								}
							}
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a search term with a space', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?searchTerm=MD21 5XY')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							OR: [
								{
									reference: {
										contains: 'MD21 5XY'
									}
								},
								{
									address: {
										postcode: {
											contains: 'MD21 5XY'
										}
									}
								}
							],
							appealStatus: {
								some: {
									valid: true
								}
							}
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a valid status', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?status=assign_case_officer')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							appealStatus: {
								some: {
									status: 'assign_case_officer',
									valid: true
								}
							}
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a true hasInspector param', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?hasInspector=true')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							appealStatus: {
								some: {
									valid: true
								}
							},
							inspectorUserId: {
								not: null
							}
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a false hasInspector param', async () => {
				// @ts-ignore
				databaseConnector.appeal.count.mockResolvedValue(1);
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal]);

				const response = await request
					.get('/appeals?hasInspector=false')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: {
							appealType: {
								key: { in: getEnabledAppealTypes() }
							},
							appealStatus: {
								some: {
									valid: true
								}
							},
							inspectorUserId: null
						}
					})
				);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 1,
					items: [
						{
							appealId: householdAppeal.id,
							appealReference: householdAppeal.reference,
							appealSite: {
								addressLine1: householdAppeal.address.addressLine1,
								addressLine2: householdAppeal.address.addressLine2,
								town: householdAppeal.address.addressTown,
								county: householdAppeal.address.addressCounty,
								postCode: householdAppeal.address.postcode
							},
							appealStatus: householdAppeal.appealStatus[0].status,
							appealType: householdAppeal.appealType.type,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							appellantCaseStatus: '',
							lpaQuestionnaireStatus: '',
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							commentCounts: {}
						}
					],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('returns an error if pageNumber is given and pageSize is not given', async () => {
				const response = await request
					.get('/appeals?pageNumber=1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageNumber: ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
					}
				});
			});

			test('returns an error if pageSize is given and pageNumber is not given', async () => {
				const response = await request
					.get('/appeals?pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageSize: ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
					}
				});
			});

			test('returns an error if pageNumber is not numeric', async () => {
				const response = await request
					.get('/appeals?pageNumber=one&pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageNumber: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if pageNumber is less than 1', async () => {
				const response = await request
					.get('/appeals?pageNumber=-1&pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageNumber: ERROR_MUST_BE_GREATER_THAN_ZERO
					}
				});
			});

			test('returns an error if pageSize is not numeric', async () => {
				const response = await request
					.get('/appeals?pageNumber=1&pageSize=one')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageSize: ERROR_MUST_BE_NUMBER
					}
				});
			});

			test('returns an error if pageSize is less than 1', async () => {
				const response = await request
					.get('/appeals?pageNumber=1&pageSize=-1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						pageSize: ERROR_MUST_BE_GREATER_THAN_ZERO
					}
				});
			});

			test('returns an error if searchTerm is less than 2 characters', async () => {
				const response = await request
					.get('/appeals?searchTerm=a')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						searchTerm: ERROR_LENGTH_BETWEEN_2_AND_8_CHARACTERS
					}
				});
			});

			test('returns an error if searchTerm is more than 8 characters', async () => {
				const response = await request
					.get('/appeals?searchTerm=aaaaaaaaa')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						searchTerm: ERROR_LENGTH_BETWEEN_2_AND_8_CHARACTERS
					}
				});
			});

			test('returns an error if azureAdUserId is not set as a header', async () => {
				const response = await request.get('/appeals');

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						azureAdUserId: ERROR_MUST_BE_SET_AS_HEADER
					}
				});
			});

			test('returns an error if status is provided and is not a valid status', async () => {
				const response = await request
					.get('/appeals?status=aaaaaaaaa')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						status: ERROR_MUST_BE_VALID_APPEAL_STATE
					}
				});
			});

			test('returns an error if hasInspector is provided and not true or false', async () => {
				const response = await request
					.get('/appeals?hasInspector=aaaaaaaaa')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						hasInspector: ERROR_MUST_BE_BOOLEAN
					}
				});
			});
		});
	});
});

describe('appeals routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('/appeals/:appealId', () => {
		describe('GET', () => {
			test('gets a single household appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([decisionFolder]);
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue({
					...householdAppeal,
					childAppeals: linkedAppeals,
					representations: []
				});

				const response = await request
					.get(`/appeals/${householdAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					neighbouringSites: [],
					agent: {
						serviceUserId: householdAppeal.agent.id,
						firstName: householdAppeal.agent.firstName,
						lastName: householdAppeal.agent.lastName,
						email: householdAppeal.agent.email,
						phoneNumber: householdAppeal.agent.phoneNumber,
						organisationName: householdAppeal.agent.organisationName
					},
					appellant: {
						serviceUserId: householdAppeal.appellant.id,
						firstName: householdAppeal.appellant.firstName,
						lastName: householdAppeal.appellant.lastName,
						email: householdAppeal.appellant.email,
						phoneNumber: householdAppeal.appellant.phoneNumber,
						organisationName: householdAppeal.appellant.organisationName
					},
					allocationDetails: null,
					appealId: householdAppeal.id,
					appealReference: householdAppeal.reference,
					appealSite: {
						addressId: householdAppeal.address.id,
						addressLine1: householdAppeal.address.addressLine1,
						addressLine2: householdAppeal.address.addressLine2,
						town: householdAppeal.address.addressTown,
						county: householdAppeal.address.addressCounty,
						postCode: householdAppeal.address.postcode
					},
					appealStatus: householdAppeal.appealStatus[0].status,
					appealType: householdAppeal.appealType.type,
					appealTimetable: null,
					appellantCaseId: 1,
					caseOfficer: householdAppeal.caseOfficer.azureAdUserId,
					costs: {},
					internalCorrespondence: {},
					withdrawal: {},
					decision: {
						folderId: savedFolder.id
					},
					documentationSummary: {
						appellantCase: {
							status: 'received',
							receivedAt: householdAppeal.caseCreatedDate.toISOString()
						},
						lpaQuestionnaire: {
							status: 'received',
							receivedAt: householdAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
						},
						ipComments: {
							status: 'not_received'
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
					inspector: householdAppeal.inspector.azureAdUserId,
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
					isParentAppeal: true,
					isChildAppeal: false,
					linkedAppeals: linkedAppeals.map((a) => {
						return {
							appealReference: a.childRef,
							isParentAppeal: false,
							linkingDate: a.linkingDate.toISOString(),
							appealType: null,
							externalSource: true
						};
					}),
					otherAppeals: [],
					localPlanningDepartment: householdAppeal.lpa.name,
					lpaQuestionnaireId: householdAppeal.lpaQuestionnaire.id,
					planningApplicationReference: householdAppeal.applicationReference,
					procedureType: householdAppeal.procedureType.name,
					appellantProcedurePreference: 'Hearing',
					appellantProcedurePreferenceDetails: 'Reason for preference',
					appellantProcedurePreferenceDuration: 5,
					inquiryHowManyWitnesses: 1,
					siteVisit: {
						siteVisitId: householdAppeal.siteVisit.id,
						visitDate: householdAppeal.siteVisit.visitDate.toISOString(),
						visitStartTime: householdAppeal.siteVisit.visitStartTime.toISOString(),
						visitEndTime: householdAppeal.siteVisit.visitEndTime.toISOString(),
						visitType: householdAppeal.siteVisit.siteVisitType.name
					},
					createdAt: householdAppeal.caseCreatedDate.toISOString()
				});
			});

			test('gets a single full planning appeal', async () => {
				// @ts-ignore
				databaseConnector.folder.findMany.mockResolvedValue([decisionFolder]);
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

				const response = await request
					.get(`/appeals/${fullPlanningAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					neighbouringSites: [],
					agent: {
						serviceUserId: fullPlanningAppeal.agent.id,
						firstName: fullPlanningAppeal.agent.firstName,
						lastName: fullPlanningAppeal.agent.lastName,
						email: fullPlanningAppeal.agent.email,
						phoneNumber: fullPlanningAppeal.agent.phoneNumber,
						organisationName: fullPlanningAppeal.agent.organisationName
					},
					appellant: {
						serviceUserId: fullPlanningAppeal.appellant.id,
						firstName: fullPlanningAppeal.appellant.firstName,
						lastName: fullPlanningAppeal.appellant.lastName,
						email: fullPlanningAppeal.appellant.email,
						phoneNumber: fullPlanningAppeal.appellant.phoneNumber,
						organisationName: fullPlanningAppeal.appellant.organisationName
					},
					allocationDetails: null,
					appealId: fullPlanningAppeal.id,
					appealReference: fullPlanningAppeal.reference,
					appealSite: {
						addressId: fullPlanningAppeal.address.id,
						addressLine1: fullPlanningAppeal.address.addressLine1,
						addressLine2: fullPlanningAppeal.address.addressLine2,
						town: fullPlanningAppeal.address.addressTown,
						county: fullPlanningAppeal.address.addressCounty,
						postCode: fullPlanningAppeal.address.postcode
					},
					appealStatus: fullPlanningAppeal.appealStatus[0].status,
					appealTimetable: null,
					appealType: fullPlanningAppeal.appealType.type,
					appellantCaseId: 1,
					caseOfficer: fullPlanningAppeal.caseOfficer.azureAdUserId,
					costs: {},
					decision: {
						folderId: savedFolder.id
					},
					internalCorrespondence: {},
					documentationSummary: {
						appellantCase: {
							status: 'received',
							receivedAt: householdAppeal.caseCreatedDate.toISOString()
						},
						lpaQuestionnaire: {
							status: 'received',
							receivedAt: householdAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
						},
						ipComments: {
							status: 'not_received'
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
					inspector: fullPlanningAppeal.inspector.azureAdUserId,
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
					procedureType: fullPlanningAppeal.procedureType.name,
					appellantProcedurePreference: 'Hearing',
					appellantProcedurePreferenceDetails: 'Reason for preference',
					appellantProcedurePreferenceDuration: 5,
					inquiryHowManyWitnesses: 1,
					siteVisit: {
						siteVisitId: fullPlanningAppeal.siteVisit.id,
						visitDate: fullPlanningAppeal.siteVisit.visitDate.toISOString(),
						visitStartTime: fullPlanningAppeal.siteVisit.visitStartTime.toISOString(),
						visitEndTime: fullPlanningAppeal.siteVisit.visitEndTime.toISOString(),
						visitType: fullPlanningAppeal.siteVisit.siteVisitType.name
					},
					createdAt: householdAppeal.caseCreatedDate.toISOString(),
					withdrawal: {}
				});
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
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.caseOfficer);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						caseOfficer: householdAppeal.caseOfficer.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						caseOfficerUserId: householdAppeal.caseOfficer.id,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: householdAppeal.id
					}
				});
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
					caseOfficer: householdAppeal.caseOfficer.azureAdUserId
				});
			});

			test('removes a case officer from an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.caseOfficer);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						caseOfficer: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						caseOfficerUserId: null,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_REMOVED_CASE_OFFICER, [
							householdAppeal.caseOfficer.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.caseOfficer.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					caseOfficer: null
				});
			});

			test('assigns an inspector to an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.inspector);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspector: householdAppeal.inspector.azureAdUserId
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: householdAppeal.inspector.id,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [
							householdAppeal.inspector.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.inspector.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspector: householdAppeal.inspector.azureAdUserId
				});
			});

			test('removes an inspector from an appeal', async () => {
				// @ts-ignore
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				// @ts-ignore
				databaseConnector.user.upsert.mockResolvedValue(householdAppeal.inspector);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspector: null
					})
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
					data: {
						inspectorUserId: null,
						caseUpdatedDate: expect.any(Date)
					},
					where: {
						id: householdAppeal.id
					}
				});
				expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
					data: {
						appealId: householdAppeal.id,
						details: stringTokenReplacement(AUDIT_TRAIL_REMOVED_INSPECTOR, [
							householdAppeal.inspector.azureAdUserId
						]),
						loggedAt: expect.any(Date),
						userId: householdAppeal.inspector.id
					}
				});
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					inspector: null
				});
			});

			test('returns an error if appealId is not numeric', async () => {
				const response = await request.patch('/appeals/one').set('azureAdUserId', azureAdUserId);

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
					.get(`/appeals/${householdAppeal.id}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({
					errors: {
						appealId: ERROR_NOT_FOUND
					}
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
						caseOfficer: '1'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						caseOfficer: ERROR_MUST_BE_UUID
					}
				});
			});

			test('returns an error if inspector is not a valid uuid', async () => {
				const response = await request
					.patch(`/appeals/${householdAppeal.id}`)
					.send({
						inspector: '1'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						inspector: ERROR_MUST_BE_UUID
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
	describe('GET', () => {
		test('gets a single household appeal', async () => {
			// @ts-ignore
			databaseConnector.folder.findMany.mockResolvedValue([decisionFolder]);
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...householdAppeal,
				childAppeals: linkedAppeals,
				representations: []
			});
			const response = await request
				.get(`/appeals/case-reference/${householdAppeal.reference}`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				neighbouringSites: [],
				agent: {
					serviceUserId: householdAppeal.agent.id,
					firstName: householdAppeal.agent.firstName,
					lastName: householdAppeal.agent.lastName,
					email: householdAppeal.agent.email,
					phoneNumber: householdAppeal.agent.phoneNumber,
					organisationName: householdAppeal.agent.organisationName
				},
				appellant: {
					serviceUserId: householdAppeal.appellant.id,
					firstName: householdAppeal.appellant.firstName,
					lastName: householdAppeal.appellant.lastName,
					email: householdAppeal.appellant.email,
					phoneNumber: householdAppeal.appellant.phoneNumber,
					organisationName: householdAppeal.appellant.organisationName
				},
				allocationDetails: null,
				appealId: householdAppeal.id,
				appealReference: householdAppeal.reference,
				appealSite: {
					addressId: householdAppeal.address.id,
					addressLine1: householdAppeal.address.addressLine1,
					addressLine2: householdAppeal.address.addressLine2,
					town: householdAppeal.address.addressTown,
					county: householdAppeal.address.addressCounty,
					postCode: householdAppeal.address.postcode
				},
				appealStatus: householdAppeal.appealStatus[0].status,
				appealType: householdAppeal.appealType.type,
				appealTimetable: null,
				appellantCaseId: 1,
				caseOfficer: householdAppeal.caseOfficer.azureAdUserId,
				costs: {},
				decision: {
					folderId: savedFolder.id
				},
				internalCorrespondence: {},
				documentationSummary: {
					appellantCase: {
						status: 'received',
						receivedAt: householdAppeal.caseCreatedDate.toISOString()
					},
					lpaQuestionnaire: {
						status: 'received',
						receivedAt: householdAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
					},
					ipComments: {
						status: 'not_received'
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
				inspector: householdAppeal.inspector.azureAdUserId,
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
				isParentAppeal: true,
				isChildAppeal: false,
				linkedAppeals: linkedAppeals.map((a) => {
					return {
						appealReference: a.childRef,
						isParentAppeal: false,
						linkingDate: a.linkingDate.toISOString(),
						appealType: null,
						externalSource: true
					};
				}),
				otherAppeals: [],
				localPlanningDepartment: householdAppeal.lpa.name,
				lpaQuestionnaireId: householdAppeal.lpaQuestionnaire.id,
				planningApplicationReference: householdAppeal.applicationReference,
				procedureType: householdAppeal.procedureType.name,
				appellantProcedurePreference: 'Hearing',
				appellantProcedurePreferenceDetails: 'Reason for preference',
				appellantProcedurePreferenceDuration: 5,
				inquiryHowManyWitnesses: 1,
				siteVisit: {
					siteVisitId: householdAppeal.siteVisit.id,
					visitDate: householdAppeal.siteVisit.visitDate.toISOString(),
					visitStartTime: householdAppeal.siteVisit.visitStartTime.toISOString(),
					visitEndTime: householdAppeal.siteVisit.visitEndTime.toISOString(),
					visitType: householdAppeal.siteVisit.siteVisitType.name
				},
				createdAt: householdAppeal.caseCreatedDate.toISOString(),
				withdrawal: {}
			});
		});

		test('gets a single full planning appeal', async () => {
			// @ts-ignore
			databaseConnector.folder.findMany.mockResolvedValue([decisionFolder]);
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(fullPlanningAppeal);

			const response = await request
				.get(`/appeals/case-reference/${fullPlanningAppeal.reference}`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				neighbouringSites: [],
				agent: {
					serviceUserId: fullPlanningAppeal.agent.id,
					firstName: fullPlanningAppeal.agent.firstName,
					lastName: fullPlanningAppeal.agent.lastName,
					email: fullPlanningAppeal.agent.email,
					phoneNumber: fullPlanningAppeal.agent.phoneNumber,
					organisationName: fullPlanningAppeal.agent.organisationName
				},
				appellant: {
					serviceUserId: fullPlanningAppeal.appellant.id,
					firstName: fullPlanningAppeal.appellant.firstName,
					lastName: fullPlanningAppeal.appellant.lastName,
					email: fullPlanningAppeal.appellant.email,
					phoneNumber: fullPlanningAppeal.appellant.phoneNumber,
					organisationName: fullPlanningAppeal.appellant.organisationName
				},
				allocationDetails: null,
				appealId: fullPlanningAppeal.id,
				appealReference: fullPlanningAppeal.reference,
				appealSite: {
					addressId: fullPlanningAppeal.address.id,
					addressLine1: fullPlanningAppeal.address.addressLine1,
					addressLine2: fullPlanningAppeal.address.addressLine2,
					town: fullPlanningAppeal.address.addressTown,
					county: fullPlanningAppeal.address.addressCounty,
					postCode: fullPlanningAppeal.address.postcode
				},
				appealStatus: fullPlanningAppeal.appealStatus[0].status,
				appealType: fullPlanningAppeal.appealType.type,
				appealTimetable: null,
				appellantCaseId: 1,
				caseOfficer: fullPlanningAppeal.caseOfficer.azureAdUserId,
				costs: {},
				decision: {
					folderId: savedFolder.id
				},
				internalCorrespondence: {},
				documentationSummary: {
					appellantCase: {
						status: 'received',
						receivedAt: householdAppeal.caseCreatedDate.toISOString()
					},
					lpaQuestionnaire: {
						status: 'received',
						receivedAt: householdAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
					},
					ipComments: {
						status: 'not_received'
					}
				},
				healthAndSafety: {
					appellantCase: {
						details: fullPlanningAppeal.appellantCase.siteSafetyDetails,
						hasIssues: true
					},
					lpaQuestionnaire: {
						details: fullPlanningAppeal.lpaQuestionnaire.siteSafetyDetails,
						hasIssues: true
					}
				},
				inspector: fullPlanningAppeal.inspector.azureAdUserId,
				inspectorAccess: {
					appellantCase: {
						details: fullPlanningAppeal.appellantCase.siteAccessDetails,
						isRequired: true
					},
					lpaQuestionnaire: {
						details: fullPlanningAppeal.lpaQuestionnaire.siteAccessDetails,
						isRequired: true
					}
				},
				isParentAppeal: false,
				isChildAppeal: false,
				linkedAppeals: [],
				otherAppeals: [],
				localPlanningDepartment: fullPlanningAppeal.lpa.name,
				lpaQuestionnaireId: fullPlanningAppeal.lpaQuestionnaire.id,
				planningApplicationReference: fullPlanningAppeal.applicationReference,
				procedureType: fullPlanningAppeal.procedureType.name,
				appellantProcedurePreference: 'Hearing',
				appellantProcedurePreferenceDetails: 'Reason for preference',
				appellantProcedurePreferenceDuration: 5,
				inquiryHowManyWitnesses: 1,
				siteVisit: {
					siteVisitId: fullPlanningAppeal.siteVisit.id,
					visitDate: fullPlanningAppeal.siteVisit.visitDate.toISOString(),
					visitStartTime: fullPlanningAppeal.siteVisit.visitStartTime.toISOString(),
					visitEndTime: fullPlanningAppeal.siteVisit.visitEndTime.toISOString(),
					visitType: fullPlanningAppeal.siteVisit.siteVisitType.name
				},
				createdAt: fullPlanningAppeal.caseCreatedDate.toISOString(),
				withdrawal: {}
			});
		});
		test('returns an error if appealId is not found', async () => {
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

describe('mapAppealToDueDate Tests', () => {
	let mockAppeal = {
		appealType: null,
		id: 1,
		address: null,
		appellant: null,
		agent: null,
		lpa: null,
		reference: 'APP/Q9999/D/21/33813',
		caseExtensionDate: null,
		caseCreatedDate: new Date('2023-01-01T00:00:00.000Z'),
		appealStatus: [
			{
				id: 2648,
				status: APPEAL_CASE_STATUS.READY_TO_START,
				createdAt: new Date('2024-01-09T16:14:31.387Z'),
				valid: true,
				appealId: 496,
				subStateMachineName: null,
				compoundStateName: null
			}
		],
		appealTimetable: null
	};

	beforeEach(() => {
		mockAppeal = {
			appellant: null,
			agent: null,
			address: null,
			appealType: null,
			id: 1,
			lpa: null,
			reference: 'APP/Q9999/D/21/33813',
			caseExtensionDate: null,
			caseCreatedDate: new Date('2023-01-01T00:00:00.000Z'),
			appealStatus: [
				{
					id: 2648,
					status: APPEAL_CASE_STATUS.READY_TO_START,
					createdAt: new Date('2024-01-09T16:14:31.387Z'),
					valid: true,
					appealId: 496,
					subStateMachineName: null,
					compoundStateName: null
				}
			],
			appealTimetable: null
		};
	});

	test('maps STATE_TARGET_READY_TO_START status', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, 'Incomplete', new Date('2023-02-01'));
		expect(dueDate).toEqual(new Date('2023-02-01'));
	});

	test('maps STATE_TARGET_READY_TO_START status with Incomplete status', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		const createdAtPlusFiveDate = new Date('2023-01-06T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFiveDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

		const createdAtPlusTenDate = new Date('2023-01-11T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusTenDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE status with appealTimetable lpaQuestionnaireDueDate', () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: new Date('2023-03-01T00:00:00.000Z'),
				lpaFinalCommentsDueDate: null,
				issueDeterminationDate: null,
				lpaStatementDueDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_ASSIGN_CASE_OFFICER', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER;

		const createdAtPlusFifteenDate = new Date('2023-01-16T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFifteenDate);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

		const createdAtPlusThirtyDate = new Date('2023-01-31T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusThirtyDate);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION status with appealTimetable issueDeterminationDate', () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
				lpaFinalCommentsDueDate: null,
				issueDeterminationDate: new Date('2023-03-01T00:00:00.000Z'),
				lpaStatementDueDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.STATEMENTS;

		const createdAtPlusFiftyFiveDate = new Date('2023-02-25T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFiftyFiveDate);
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW status with appealTimetable lpaStatementDueDate', () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
				lpaFinalCommentsDueDate: null,
				issueDeterminationDate: null,
				lpaStatementDueDate: new Date('2023-03-01T00:00:00.000Z'),
				resubmitAppealTypeDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.STATEMENTS;

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_FINAL_COMMENT_REVIEW', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.FINAL_COMMENTS;

		const createdAtPlusSixtyDate = new Date('2023-03-02T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusSixtyDate);
	});

	test('maps STATE_TARGET_FINAL_COMMENT_REVIEW status with appealTimetable lpaFinalCommentsDueDate', () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
				lpaFinalCommentsDueDate: new Date('2023-03-01T00:00:00.000Z'),
				issueDeterminationDate: null,
				lpaStatementDueDate: null,
				resubmitAppealTypeDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.FINAL_COMMENTS;

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('handles STATE_TARGET_COMPLETE', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.COMPLETE;

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toBeNull();
	});

	test('handles unexpected status (default case)', () => {
		mockAppeal.appealStatus[0].status = 'unexpected_status';

		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toBeUndefined();
	});
});

describe('mapAppealStatuses Tests', () => {
	test('correctly orders statuses personal list', () => {
		const preSortedStatuses = [
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.AWAITING_TRANSFER }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.READY_TO_START }] }
		];

		const expectedOrder = [
			APPEAL_CASE_STATUS.READY_TO_START,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
			APPEAL_CASE_STATUS.AWAITING_TRANSFER
		];

		const orderedStatuses = mapAppealStatuses(preSortedStatuses);
		expect(orderedStatuses).toEqual(expectedOrder);
	});

	test('correctly orders statuses national list', () => {
		const preSortedStatuses = [
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.AWAITING_TRANSFER }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.READY_TO_START }] },
			{ appealStatus: [{ status: APPEAL_CASE_STATUS.COMPLETE }] }
		];

		const expectedOrder = [
			APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
			APPEAL_CASE_STATUS.READY_TO_START,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
			APPEAL_CASE_STATUS.AWAITING_TRANSFER,
			APPEAL_CASE_STATUS.COMPLETE
		];

		const orderedStatuses = mapAppealStatuses(preSortedStatuses);
		expect(orderedStatuses).toEqual(expectedOrder);
	});
});

describe('getRelevantLinkedAppealIds Tests', () => {
	const moreLinkedAppeals = [
		{
			id: 101,
			parentRef: 'TEST-396994',
			childRef: 'TEST-100071',
			parentId: 1027,
			childId: 1028,
			linkingDate: new Date('2024-01-30T13:44:39.655Z'),
			type: 'linked',
			externalSource: false
		},
		{
			id: 102,
			parentRef: 'TEST-396994',
			childRef: 'TEST-123813',
			parentId: 1027,
			childId: 1029,
			linkingDate: new Date('2024-01-30T13:44:39.655Z'),
			type: 'linked',
			externalSource: false
		},
		{
			id: 103,
			parentRef: 'TEST-396994',
			childRef: 'TEST-864955',
			parentId: 1027,
			childId: 1043,
			linkingDate: new Date('2024-01-30T13:44:39.655Z'),
			type: 'linked',
			externalSource: false
		},
		{
			id: 104,
			parentRef: 'TEST-396994',
			childRef: '76215416',
			parentId: 1027,
			childId: null,
			linkingDate: new Date('2024-01-30T13:44:39.655Z'),
			type: 'linked',
			externalSource: true
		}
	];

	test('should return correct child IDs when current appeal is a parent', () => {
		const currentAppealRef = 'TEST-396994';
		// @ts-ignore
		const result = getIdsOfReferencedAppeals(moreLinkedAppeals, currentAppealRef);
		expect(result).toEqual([1028, 1029, 1043]);
	});

	test('should return correct parent ID when current appeal is a child', () => {
		const currentAppealRef = 'TEST-100071';
		// @ts-ignore
		const result = getIdsOfReferencedAppeals(moreLinkedAppeals, currentAppealRef);
		expect(result).toEqual([1027]);
	});

	test('should return an empty array when there are no linked appeals', () => {
		const currentAppealRef = 'TEST/999999';
		// @ts-ignore
		const result = getIdsOfReferencedAppeals(moreLinkedAppeals, currentAppealRef);
		expect(result).toEqual([]);
	});

	test('should exclude linked appeals with null child IDs', () => {
		const linkedAppealsWithNullChildId = [
			...moreLinkedAppeals,
			{
				id: 105,
				parentRef: 'TEST-396994',
				childRef: 'TEST-100071',
				parentId: 1027,
				childId: null,
				linkingDate: new Date('2024-01-30T13:44:39.655Z'),
				type: 'linked',
				externalSource: true
			}
		];
		const currentAppealRef = 'TEST-396994';
		// @ts-ignore
		const result = getIdsOfReferencedAppeals(linkedAppealsWithNullChildId, currentAppealRef);
		expect(result).toEqual([1028, 1029, 1043]);
	});

	test('should exclude duplicate row ids in the output', () => {
		const linkedAppealsWithDuplucate = [
			...moreLinkedAppeals,
			{
				id: 105,
				parentRef: 'TEST-396994',
				childRef: 'TEST-100071',
				parentId: 1027,
				childId: 1028,
				linkingDate: new Date('2024-01-30T13:44:39.655Z'),
				type: 'linked',
				externalSource: false
			}
		];
		const currentAppealRef = 'TEST-396994';
		// @ts-ignore
		const result = getIdsOfReferencedAppeals(linkedAppealsWithDuplucate, currentAppealRef);
		expect(result).toEqual([1028, 1029, 1043]);
	});
});
