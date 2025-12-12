// @ts-nocheck
import { appealS78, fullPlanningAppeal, householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
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
import { APPEAL_CASE_STATUS, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { omit } from 'lodash-es';
import { request } from '../../../app-test.js';
import { mapAppealStatuses } from '../appeals.service.js';
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
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/appeals', () => {
		beforeEach(() => {
			databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
			databaseConnector.appealStatus.findMany.mockResolvedValue(
				statusesInNationalList.map((status) => ({ status }))
			);
			databaseConnector.lPA.findMany.mockResolvedValue(lpas);
			databaseConnector.user.findMany.mockResolvedValue(inspectors.concat(caseOfficers));
			databaseConnector.pADSUser.findMany.mockResolvedValue([]);
		});
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
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
							completedStateList: fullPlanningAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: fullPlanningAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
						appealType: {
							key: {
								in: [
									APPEAL_CASE_TYPE.D,
									APPEAL_CASE_TYPE.W,
									APPEAL_CASE_TYPE.Y,
									APPEAL_CASE_TYPE.ZP,
									APPEAL_CASE_TYPE.ZA,
									APPEAL_CASE_TYPE.H,
									APPEAL_CASE_TYPE.C
								]
							}
						}
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
						padsInspector: true,
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
							completedStateList: fullPlanningAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: fullPlanningAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							OR: [
								{
									inspectorUserId: {
										not: null
									}
								},
								{
									padsInspectorUserId: {
										not: null
									}
								}
							]
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
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
							AND: [
								{
									inspectorUserId: null
								},
								{
									padsInspectorUserId: null
								}
							]
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
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
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a appealTypeId param', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);
				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				databaseConnector.appealStatus.findMany.mockResolvedValue(
					statusesInNationalList.map((status) => ({ status }))
				);
				databaseConnector.lPA.findMany.mockResolvedValue(lpas);
				databaseConnector.user.findMany.mockResolvedValue(inspectors.concat(caseOfficers));
				databaseConnector.appeal.count.mockResolvedValue(1);

				const response = await request
					.get('/appeals?appealTypeId=1')
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a procedure type id param', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);

				databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
				databaseConnector.appealStatus.findMany.mockResolvedValue(
					statusesInNationalList.map((status) => ({ status }))
				);
				databaseConnector.lPA.findMany.mockResolvedValue(lpas);
				databaseConnector.user.findMany.mockResolvedValue(inspectors.concat(caseOfficers));
				databaseConnector.appeal.count.mockResolvedValue(1);

				const response = await request
					.get('/appeals?procedureTypeId=1')
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
							procedureTypeId: 1
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets appeals when given a assignedTeamId param', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);

				const response = await request
					.get('/appeals?assignedTeamId=1')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: expect.objectContaining({
							assignedTeamId: 1
						})
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
							completedStateList: householdAppeal.completedStateList,
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
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: false,
							planningApplicationReference: householdAppeal.applicationReference,
							procedureType: 'Written',
							hasHearingAddress: true,
							isHearingSetup: true,
							numberOfResidencesNetChange: 5,
							isInquirySetup: true,
							hasInquiryAddress: true
						}
					],
					lpas,
					caseOfficers,
					inspectors,
					padsInspectors: [],
					page: 1,
					pageCount: 1,
					pageSize: 30,
					statuses: ['assign_case_officer'],
					statusesInNationalList
				});
			});

			test('gets unassigned teams when assignedTeamId param is -1', async () => {
				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([householdAppeal])
					.mockResolvedValueOnce(allAppeals);

				const response = await request
					.get('/appeals?assignedTeamId=-1')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: expect.objectContaining({
							assignedTeamId: null
						})
					})
				);
				expect(response.status).toEqual(200);
			});

			test('gets hearing request appeals when given an appellantProcedurePreference param as hearing', async () => {
				const hearingRequestAppeal = structuredClone(householdAppeal);
				hearingRequestAppeal.appellantCase.appellantProcedurePreference = 'hearing';

				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([hearingRequestAppeal])
					.mockResolvedValueOnce(allAppeals);

				const response = await request
					.get('/appeals?appellantProcedurePreference=hearing')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: expect.objectContaining({
							appellantCase: {
								appellantProcedurePreference: 'hearing'
							}
						})
					})
				);
				expect(response.status).toEqual(200);
			});

			test('gets inquiry request appeals when given an appellantProcedurePreference param as inquiry', async () => {
				const inquiryRequestAppeal = structuredClone(householdAppeal);
				inquiryRequestAppeal.appellantCase.appellantProcedurePreference = 'inquiry';

				databaseConnector.appeal.findMany
					.mockResolvedValueOnce([inquiryRequestAppeal])
					.mockResolvedValueOnce(allAppeals);

				const response = await request
					.get('/appeals?appellantProcedurePreference=inquiry')
					.set('azureAdUserId', azureAdUserId);

				expect(databaseConnector.appeal.findMany).toHaveBeenCalledWith(
					expect.objectContaining({
						where: expect.objectContaining({
							appellantCase: {
								appellantProcedurePreference: 'inquiry'
							}
						})
					})
				);
				expect(response.status).toEqual(200);
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

	describe('/appeals/personal-list', () => {
		const appealTimetable = {
			appellantStatementDueDate: new Date('2025-11-01T00:00:00.000Z'),
			caseResubmissionDueDate: new Date('2025-11-02T00:00:00.000Z'),
			finalCommentsDueDate: new Date('2025-11-03T00:00:00.000Z'),
			ipCommentsDueDate: new Date('2025-11-04T00:00:00.000Z'),
			issueDeterminationDate: new Date('2025-11-05T00:00:00.000Z'),
			lpaQuestionnaireDueDate: new Date('2025-11-06T00:00:00.000Z'),
			lpaStatementDueDate: new Date('2025-11-07T00:00:00.000Z'),
			proofOfEvidenceAndWitnessesDueDate: new Date('2025-11-08T00:00:00.000Z'),
			s106ObligationDueDate: new Date('2025-11-09T00:00:00.000Z')
		};
		const appeal = { id: 1, appealTimetable, appealType: { key: APPEAL_CASE_TYPE.W } };

		beforeEach(() => {
			databaseConnector.personalList.findMany
				.mockResolvedValueOnce([
					{ appealId: 3, leadAppealId: 1, linkType: 'child', appeal: { ...appeal, id: 3 } },
					{ appealId: 4, leadAppealId: 1, linkType: 'child', appeal: { ...appeal, id: 4 } }
				])
				.mockResolvedValueOnce([
					{ appeal: { appealStatus: [{ status: 'assign_case_officer', valid: true }] } },
					{ appeal: { appealStatus: [{ status: 'complete', valid: true }] } }
				])
				.mockResolvedValueOnce([
					{ appealId: 1, leadAppealId: 1, linkType: 'parent', appeal: { ...appeal, id: 1 } },
					{ appealId: 2, leadAppealId: 1, linkType: 'child', appeal: { ...appeal, id: 2 } },
					{ appealId: 3, leadAppealId: 1, linkType: 'child', appeal: { ...appeal, id: 3 } },
					{ appealId: 4, leadAppealId: 1, linkType: 'child', appeal: { ...appeal, id: 4 } }
				]);
			databaseConnector.personalList.count.mockResolvedValue(4);
		});
		describe('GET', () => {
			test('returns a list of appeals for the user', async () => {
				const response = await request
					.get('/appeals/personal-list')
					.set('azureAdUserId', azureAdUserId);
				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					itemCount: 4,
					items: [
						{
							appealId: 3,
							appealSite: {
								addressLine1: '',
								postCode: ''
							},
							appealStatus: '',
							completedStateList: householdAppeal.completedStateList,
							localPlanningDepartment: '',
							lpaQuestionnaireId: null,
							documentationSummary: {
								appellantCase: {
									status: 'not_received'
								},
								lpaQuestionnaire: {
									dueDate: '2025-11-06T00:00:00.000Z',
									status: 'not_received'
								},
								ipComments: {
									status: 'not_received',
									counts: {},
									isRedacted: false
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									status: 'not_received',
									receivedAt: null,
									representationStatus: null,
									isRedacted: false
								},
								appellantFinalComments: {
									status: 'not_received',
									receivedAt: null,
									representationStatus: null,
									isRedacted: false
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: true,
							isHearingSetup: false,
							hasHearingAddress: false,
							awaitingLinkedAppeal: true,
							costsDecision: null,
							numberOfResidencesNetChange: null,
							isInquirySetup: false,
							hasInquiryAddress: false,
							appealTimetable: {
								appellantStatementDueDate: '2025-11-01T00:00:00.000Z',
								caseResubmissionDueDate: '2025-11-02T00:00:00.000Z',
								finalCommentsDueDate: '2025-11-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-11-04T00:00:00.000Z',
								issueDeterminationDate: '2025-11-05T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-11-06T00:00:00.000Z',
								lpaStatementDueDate: '2025-11-07T00:00:00.000Z',
								proofOfEvidenceAndWitnessesDueDate: '2025-11-08T00:00:00.000Z',
								s106ObligationDueDate: '2025-11-09T00:00:00.000Z'
							}
						},
						{
							appealId: 4,
							appealSite: {
								addressLine1: '',
								postCode: ''
							},
							appealStatus: '',
							completedStateList: householdAppeal.completedStateList,
							localPlanningDepartment: '',
							lpaQuestionnaireId: null,
							documentationSummary: {
								appellantCase: {
									status: 'not_received'
								},
								lpaQuestionnaire: {
									dueDate: '2025-11-06T00:00:00.000Z',
									status: 'not_received'
								},
								ipComments: {
									status: 'not_received',
									counts: {},
									isRedacted: false
								},
								lpaStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								lpaFinalComments: {
									status: 'not_received',
									receivedAt: null,
									representationStatus: null,
									isRedacted: false
								},
								appellantFinalComments: {
									status: 'not_received',
									receivedAt: null,
									representationStatus: null,
									isRedacted: false
								},
								lpaProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantProofOfEvidence: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								},
								appellantStatement: {
									status: 'not_received',
									representationStatus: null,
									isRedacted: false
								}
							},
							isParentAppeal: false,
							isChildAppeal: true,
							isHearingSetup: false,
							hasHearingAddress: false,
							awaitingLinkedAppeal: true,
							costsDecision: null,
							numberOfResidencesNetChange: null,
							isInquirySetup: false,
							hasInquiryAddress: false,
							appealTimetable: {
								appellantStatementDueDate: '2025-11-01T00:00:00.000Z',
								caseResubmissionDueDate: '2025-11-02T00:00:00.000Z',
								finalCommentsDueDate: '2025-11-03T00:00:00.000Z',
								ipCommentsDueDate: '2025-11-04T00:00:00.000Z',
								issueDeterminationDate: '2025-11-05T00:00:00.000Z',
								lpaQuestionnaireDueDate: '2025-11-06T00:00:00.000Z',
								lpaStatementDueDate: '2025-11-07T00:00:00.000Z',
								proofOfEvidenceAndWitnessesDueDate: '2025-11-08T00:00:00.000Z',
								s106ObligationDueDate: '2025-11-09T00:00:00.000Z'
							}
						}
					],
					statuses: ['assign_case_officer', 'complete'],
					page: 1,
					pageCount: 1,
					pageSize: 30
				});
			});
		});
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

describe('updateCompletedEvents', () => {
	test('updates completed events', async () => {
		const siteVisit = structuredClone({ ...householdAppeal.siteVisit, appealId: appealS78.id });
		const appealStatus = [{ status: 'awaiting_event', valid: true }];
		const childAppeals = [
			{
				childId: 100,
				type: CASE_RELATIONSHIP_LINKED,
				child: { appealStatus }
			}
		];
		const linkedLeadAppeal = structuredClone({
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
				appealId: childAppeals[0].childId,
				details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['issue_determination']),
				loggedAt: expect.any(Date),
				userId: linkedLeadAppeal.caseOfficer.id
			}
		});

		expect(databaseConnector.auditTrail.create).toHaveBeenNthCalledWith(2, {
			data: {
				appealId: linkedLeadAppeal.id,
				details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, ['issue_determination']),
				loggedAt: expect.any(Date),
				userId: linkedLeadAppeal.caseOfficer.id
			}
		});

		expect(response.status).toEqual(204);
	});
});
