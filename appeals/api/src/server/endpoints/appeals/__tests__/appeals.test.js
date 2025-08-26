// @ts-nocheck
import { jest } from '@jest/globals';
import { request } from '../../../app-test.js';
import {
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	CASE_RELATIONSHIP_LINKED,
	ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS,
	ERROR_MUST_BE_BOOLEAN,
	ERROR_MUST_BE_GREATER_THAN_ZERO,
	ERROR_MUST_BE_NUMBER,
	ERROR_MUST_BE_SET_AS_HEADER,
	ERROR_MUST_BE_VALID_APPEAL_STATE,
	ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
} from '@pins/appeals/constants/support.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal, fullPlanningAppeal, appealS78 } from '#tests/appeals/mocks.js';
import { getIdsOfReferencedAppeals, mapAppealToDueDate } from '../appeals.formatter.js';
import { mapAppealStatuses } from '../appeals.service.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { cloneDeep, omit } from 'lodash-es';
import stringTokenReplacement from '#utils/string-token-replacement.js';
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

const statusesInNationalList = [
	'assign_case_officer',
	'validation',
	'ready_to_start',
	'lpa_questionnaire',
	'statements',
	'final_comments',
	'issue_determination'
];

const allAppeals = [householdAppeal, fullPlanningAppeal].map((appeal) => ({
	...appeal,
	inspectorUserId: inspectors[0].id,
	caseOfficerUserId: caseOfficers[0].id
}));

describe('appeals list routes', () => {
	beforeEach(() => {
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
		databaseConnector.appealStatus.findMany.mockResolvedValue(
			statusesInNationalList.map((status) => ({ status }))
		);
		databaseConnector.lPA.findMany.mockResolvedValue(lpas);
		databaseConnector.user.findMany.mockResolvedValue(inspectors.concat(caseOfficers));
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/appeals', () => {
		describe('GET', () => {
			test('gets appeals when not given pagination params or a search term', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal, fullPlanningAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(2);

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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: fullPlanningAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given pagination params', async () => {
				const expectedQuery = {
					where: {
						appealStatus: { some: { valid: true } },
						appealType: { key: { in: ['D', 'W', 'Y', 'ZP', 'ZA'] } }
					},
					include: {
						address: true,
						appealStatus: { where: { valid: true } },
						appealType: true,
						procedureType: true,
						lpa: true,
						appellantCase: { include: { appellantCaseValidationOutcome: true } },
						inspector: true,
						caseOfficer: true,
						appealTimetable: true,
						representations: true,
						lpaQuestionnaire: { include: { lpaQuestionnaireValidationOutcome: true } },
						siteVisit: true,
						hearing: true,
						inquiry: true
					},
					orderBy: { caseUpdatedDate: 'desc' },
					skip: 1,
					take: 1
				};

				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([fullPlanningAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(2);

				const response = await request
					.get('/appeals?pageNumber=2&pageSize=1')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledTimes(2);
				expect(databaseConnector.appeal.findMany).toHaveBeenNthCalledWith(1, expectedQuery);
				expect(databaseConnector.appeal.findMany).toHaveBeenNthCalledWith(
					2,
					omit(expectedQuery, 'include', 'orderBy', 'skip', 'take')
				);
				expect(databaseConnector.appeal.count).toHaveBeenCalledTimes(1);
				expect(databaseConnector.appeal.count).toHaveBeenNthCalledWith(1, {
					where: expectedQuery.where
				});

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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: fullPlanningAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 2,
					pageCount: 2,
					pageSize: 1,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given an uppercase search term', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
								},
								{
									applicationReference: {
										contains: 'MD21'
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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a lowercase search term', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
								},
								{
									applicationReference: {
										contains: 'md21'
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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a search term with a space', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
								},
								{
									applicationReference: {
										contains: 'MD21 5XY'
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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a valid status', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a true hasInspector param', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
							awaitingLinkedAppeal: null,
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
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a false hasInspector param', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appeal.count.mockResolvedValue(1);

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
							awaitingLinkedAppeal: null,
							createdAt: householdAppeal.caseCreatedDate.toISOString(),
							localPlanningDepartment: householdAppeal.lpa.name,
							documentationSummary: {
								appellantCase: {
									receivedAt: '2024-03-25T23:59:59.999Z',
									status: 'received'
								},
								ipComments: {
									status: 'not_received',
									counts: {},
									isRedacted: false
								},
								lpaQuestionnaire: {
									receivedAt: '2024-06-24T00:00:00.000Z',
									status: 'received'
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								},
								appellantFinalComments: {
									receivedAt: null,
									representationStatus: null,
									status: 'not_received',
									isRedacted: false
								}
							},
							dueDate: null,
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
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
						searchTerm: ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS('2', '50')
					}
				});
			});

			test('returns an error if searchTerm is more than 50 characters', async () => {
				const response = await request
					.get(`/appeals?searchTerm=${'a'.repeat(51)}`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					errors: {
						searchTerm: ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS('2', '50')
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

test('gets appeals when given a appealTypeId param', async () => {
	databaseConnector.appeal.findMany
		.mockResolvedValueOnce([householdAppeal])
		.mockResolvedValueOnce(allAppeals);

	const response = await request.get('/appeals?appealTypeId=1').set('azureAdUserId', azureAdUserId);

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
				appealTypeId: 1
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
				awaitingLinkedAppeal: null,
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
						counts: {},
						isRedacted: false
					},
					lpaQuestionnaire: {
						receivedAt: '2024-06-24T00:00:00.000Z',
						status: 'received'
					},
					lpaStatement: {
						status: 'not_received',
						representationStatus: null,
						isRedacted: false
					},
					lpaFinalComments: {
						receivedAt: null,
						representationStatus: null,
						status: 'not_received',
						isRedacted: false
					},
					appellantFinalComments: {
						receivedAt: null,
						representationStatus: null,
						status: 'not_received',
						isRedacted: false
					}
				},
				isParentAppeal: false,
				isChildAppeal: false,
				planningApplicationReference: householdAppeal.applicationReference,
				procedureType: 'Written',
				hasHearingAddress: true,
				isHearingSetup: true,
				numberOfResidencesNetChange: 5
			}
		],
		lpas,
		caseOfficers,
		inspectors,
		page: 1,
		pageCount: 1,
		pageSize: 30,
		statuses: ['assign_case_officer'],
		statusesInNationalList
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

	test('maps STATE_TARGET_READY_TO_START status', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, 'Incomplete', new Date('2023-02-01'));
		expect(dueDate).toEqual(new Date('2023-02-01'));
	});

	test('maps STATE_TARGET_READY_TO_START status with Incomplete status', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		const createdAtPlusFiveDate = new Date('2023-01-06T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFiveDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

		const createdAtPlusTenDate = new Date('2023-01-11T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusTenDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE status with appealTimetable lpaQuestionnaireDueDate', async () => {
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
		const dueDate = await mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_ASSIGN_CASE_OFFICER', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER;

		const createdAtPlusFifteenDate = new Date('2023-01-16T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFifteenDate);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit available', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;
		mockAppeal.siteVisit = { visitDate: new Date('2023-02-01T00:00:00.000Z') };
		const createdAtPlusFortyBusinessDays = new Date('2023-03-29T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFortyBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit not available', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

		const createdAtPlusThirtyBusinessDays = new Date('2025-07-04T00:00:00.000Z');
		mockAppeal.caseCreatedDate = new Date('2025-05-22T00:00:00.000Z');

		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusThirtyBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION status with appealTimetable issueDeterminationDate', async () => {
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
		mockAppealWithTimetable.caseCreatedDate = new Date('2025-05-22T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppealWithTimetable, '', null);
		// dueDate.setDate(dueDate.getDate());
		expect(dueDate).toEqual(new Date('2025-07-04T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.STATEMENTS;

		const createdAtPlusFiftyFiveDate = new Date('2023-02-25T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusFiftyFiveDate);
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW status with appealTimetable lpaStatementDueDate', async () => {
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
		const dueDate = await mapAppealToDueDate(mockAppealWithTimetable, '', null);
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_FINAL_COMMENT_REVIEW', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.FINAL_COMMENTS;

		const createdAtPlusSixtyDate = new Date('2023-03-02T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(createdAtPlusSixtyDate);
	});

	test('handles STATE_TARGET_AWAITING_SITE_VISIT', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.AWAITING_EVENT;
		mockAppeal.siteVisit = { visitDate: new Date('2023-02-01T00:00:00.000Z') };
		mockAppeal.procedureType = {
			key: APPEAL_CASE_PROCEDURE.WRITTEN
		};

		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(mockAppeal.siteVisit.visitDate);
	});

	test('handles STATE_TARGET_AWAITING_HEARING', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.AWAITING_EVENT;
		mockAppeal.hearing = { hearingStartTime: new Date('2023-02-01T00:00:00.000Z') };
		mockAppeal.procedureType = {
			key: APPEAL_CASE_PROCEDURE.HEARING
		};

		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
		expect(dueDate).toEqual(mockAppeal.hearing.hearingStartTime);
	});

	describe('handles STATE_TARGET_SITE_VISIT', () => {
		let mockAppealWithTimetable = {};

		beforeEach(() => {
			mockAppealWithTimetable = {
				...mockAppeal,
				appealTimetable: {
					id: 1262,
					appealId: 523,
					lpaQuestionnaireDueDate: new Date('2023-03-01T00:00:00.000Z')
				}
			};
			mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.EVENT;
		});

		test('when final comments due date does not exist', async () => {
			// @ts-ignore
			const dueDate = await mapAppealToDueDate(mockAppealWithTimetable, '', null);
			expect(dueDate).toEqual(mockAppealWithTimetable.appealTimetable.lpaQuestionnaireDueDate);
		});

		test('when final comments due date does exist', async () => {
			// @ts-ignore
			mockAppealWithTimetable.appealTimetable.finalCommentsDueDate = new Date(
				'2023-03-22T00:00:00.000Z'
			);
			const dueDate = await mapAppealToDueDate(mockAppealWithTimetable, '', null);
			expect(dueDate).toEqual(mockAppealWithTimetable.appealTimetable.finalCommentsDueDate);
		});
	});

	test('handles STATE_TARGET_COMPLETE', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.COMPLETE;

		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null, {});
		expect(dueDate).toBeNull();
	});

	test('handles unexpected status (default case)', async () => {
		mockAppeal.appealStatus[0].status = 'unexpected_status';

		// @ts-ignore
		const dueDate = await mapAppealToDueDate(mockAppeal, '', null);
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

describe('updateCompletedEvents', () => {
	test('updates completed events', async () => {
		const siteVisit = cloneDeep({ ...householdAppeal.siteVisit, appealId: appealS78.id });
		const appealStatus = [{ status: 'awaiting_event', valid: true }];
		const childAppeals = [{ childId: 100, type: CASE_RELATIONSHIP_LINKED }];
		const linkedLeadAppeal = cloneDeep({
			...appealS78,
			siteVisit,
			appealStatus,
			childAppeals
		});

		// @ts-ignore
		databaseConnector.appeal.findUnique.mockResolvedValue(linkedLeadAppeal);
		// @ts-ignore
		databaseConnector.appeal.findMany.mockResolvedValue([linkedLeadAppeal]);
		// @ts-ignore
		databaseConnector.user.upsert.mockResolvedValue({
			id: 1,
			azureAdUserId
		});

		const response = await request
			.post(`/appeals/update-complete-events`)
			.set('azureAdUserId', azureAdUserId);

		expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(2);

		expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(1, {
			data: {
				appealId: linkedLeadAppeal.id,
				details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['issue_determination']),
				loggedAt: expect.any(Date),
				userId: linkedLeadAppeal.caseOfficer.id
			}
		});

		expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
			data: {
				appealId: childAppeals[0].childId,
				details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['issue_determination']),
				loggedAt: expect.any(Date),
				userId: linkedLeadAppeal.caseOfficer.id
			}
		});

		expect(response.status).toEqual(204);
	});
});
