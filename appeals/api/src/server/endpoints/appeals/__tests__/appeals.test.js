import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	ERROR_LENGTH_BETWEEN_2_AND_8_CHARACTERS,
	ERROR_MUST_BE_BOOLEAN,
	ERROR_MUST_BE_GREATER_THAN_ZERO,
	ERROR_MUST_BE_NUMBER,
	ERROR_MUST_BE_SET_AS_HEADER,
	ERROR_MUST_BE_VALID_APPEAL_STATE,
	ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
} from '../../constants.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, fullPlanningAppeal } from '#tests/appeals/mocks.js';
import { getIdsOfReferencedAppeals, mapAppealToDueDate } from '../appeals.formatter.js';
import { mapAppealStatuses } from '../appeals.service.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const lpas = [
	{
		lpaCode: householdAppeal.lpa.lpaCode,
		name: householdAppeal.lpa.name
	}
];

const inspectors = [
	{
		azureAdUserId: 'e8f89175-d02c-4a60-870e-dc954d5b530a',
		id: 2
	}
];

const caseOfficers = [
	{
		azureAdUserId: 'a8973f33-4d2e-486b-87b0-d068343ad9eb',
		id: 1
	}
];

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
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal, fullPlanningAppeal]);

				const response = await request.get('/appeals').set('azureAdUserId', azureAdUserId);

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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given pagination params', async () => {
				// @ts-ignore
				databaseConnector.appeal.findMany.mockResolvedValue([householdAppeal, fullPlanningAppeal]);

				const response = await request
					.get('/appeals?pageNumber=2&pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 2,
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 2,
					pageCount: 2,
					pageSize: 1,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given an uppercase search term', async () => {
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a lowercase search term', async () => {
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a search term with a space', async () => {
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a valid status', async () => {
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a true hasInspector param', async () => {
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
							dueDate: null,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer']
				});
			});

			test('gets appeals when given a false hasInspector param', async () => {
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
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received'
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								}
							},
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false
						}
					],
					lpas,
					caseOfficers,
					inspectors,
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

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit available', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;
		mockAppeal.siteVisit = { visitDate: new Date('2023-02-01T00:00:00.000Z') };

		const createdAtPlusTenBusinessDays = new Date('2023-02-15T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusTenBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit not available', () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

		const createdAtPlusThirtyBusinessDays = new Date('2023-02-10T00:00:00.000Z');
		// @ts-ignore
		const dueDate = mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusThirtyBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION status with appealTimetable issueDeterminationDate', () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
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
