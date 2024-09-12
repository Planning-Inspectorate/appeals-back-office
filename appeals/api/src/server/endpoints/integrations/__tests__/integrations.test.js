import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import {
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA
} from '#endpoints/constants.js';
import { validAppellantCase, validLpaQuestionnaire } from '#tests/integrations/mocks.js';
import { APPEAL_CASE_TYPE } from 'pins-data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('/appeals/case-submission', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST invalid appellant case submission', () => {
		test('invalid appellant case payload: no appeal', async () => {
			const { casedata, ...invalidPayload } = validAppellantCase;
			const response = await request.post('/appeals/case-submission').send(invalidPayload);

			expect(casedata).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/: must have required property 'casedata'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no LPA', async () => {
			const { lpaCode, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(lpaCode).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'lpaCode'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no appeal type', async () => {
			const { caseType, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(caseType).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'caseType'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: unsupported appeal type', async () => {
			// eslint-disable-next-line no-unused-vars
			const { caseType, ...validPayload } = validAppellantCase.casedata;
			const payload = {
				casedata: {
					...validPayload,
					caseType: APPEAL_CASE_TYPE.Y
				},
				users: validAppellantCase.users,
				documents: []
			};

			const response = await request.post('/appeals/case-submission').send(payload);

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: `Error validating case types: ${APPEAL_CASE_TYPE.Y} not currently supported`,
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST invalid appellant case payload: no application reference', async () => {
			const { applicationReference, ...invalidPayload } = validAppellantCase.casedata;
			const payload = { casedata: { ...invalidPayload }, users: [], documents: [] };
			const response = await request.post('/appeals/case-submission').send(payload);

			expect(applicationReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'applicationReference'"],
					integration: ERROR_INVALID_APPELLANT_CASE_DATA
				}
			});
		});

		test('POST valid appellant case payload and create appeal', async () => {
			// @ts-ignore
			databaseConnector.appeal.create.mockResolvedValue({});

			const payload = validAppellantCase;
			await request.post('/appeals/case-submission').send(payload);

			expect(databaseConnector.appeal.create).toHaveBeenCalledWith({
				data: {
					reference: expect.any(String),
					submissionId: expect.any(String),
					appealType: {
						connect: {
							key: 'D'
						}
					},
					appellant: {
						create: {
							organisationName: 'A company',
							salutation: 'Mr',
							firstName: 'Testy',
							lastName: 'McTest',
							email: 'test@test.com',
							webAddress: undefined,
							phoneNumber: '0123456789',
							otherPhoneNumber: undefined,
							faxNumber: undefined
						}
					},
					agent: {
						create: undefined
					},
					lpa: {
						connect: {
							lpaCode: 'Q9999'
						}
					},
					applicationReference: '123',
					address: {
						create: {
							addressLine1: 'Somewhere',
							addressLine2: 'Somewhere St',
							addressCounty: 'Somewhere',
							postcode: 'SOM3 W3R',
							addressTown: 'Somewhereville'
						}
					},
					appellantCase: {
						create: {
							applicationDate: '2024-01-01T00:00:00.000Z',
							applicationDecision: 'refused',
							applicationDecisionDate: '2024-01-01T00:00:00.000Z',
							caseSubmittedDate: '2024-03-25T23:59:59.999Z',
							caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
							siteAccessDetails: 'Come and see',
							siteSafetyDetails: "It's dangerous",
							siteAreaSquareMetres: 22,
							floorSpaceSquareMetres: 22,
							ownsAllLand: true,
							ownsSomeLand: true,
							hasAdvertisedAppeal: true,
							appellantCostsAppliedFor: false,
							originalDevelopmentDescription: 'A test description',
							changedDevelopmentDescription: false,
							ownersInformed: true,
							knowsAllOwners: {
								connect: {
									key: 'Some'
								}
							},
							knowsOtherOwners: {
								connect: {
									key: 'Some'
								}
							},
							isGreenBelt: false,
							appellantProcedurePreference: undefined,
							appellantProcedurePreferenceDetails: undefined,
							appellantProcedurePreferenceDuration: undefined,
							inquiryHowManyWitnesses: undefined
						}
					},
					neighbouringSites: {
						create: []
					},
					folders: {
						create: [
							{
								path: 'appellant-case/appellantStatement'
							},
							{
								path: 'appellant-case/originalApplicationForm'
							},
							{
								path: 'appellant-case/applicationDecisionLetter'
							},
							{
								path: 'appellant-case/changedDescription'
							},
							{
								path: 'appellant-case/appellantCaseWithdrawalLetter'
							},
							{
								path: 'appellant-case/appellantCaseCorrespondence'
							},
							{
								path: 'appellant-case/designAccessStatement'
							},
							{
								path: 'appellant-case/plansDrawings'
							},
							{
								path: 'appellant-case/newPlansDrawings'
							},
							{
								path: 'appellant-case/planningObligation'
							},
							{
								path: 'appellant-case/ownershipCertificate'
							},
							{
								path: 'appellant-case/otherNewDocuments'
							},
							{
								path: 'lpa-questionnaire/whoNotified'
							},
							{
								path: 'lpa-questionnaire/whoNotifiedSiteNotice'
							},
							{
								path: 'lpa-questionnaire/whoNotifiedLetterToNeighbours'
							},
							{
								path: 'lpa-questionnaire/whoNotifiedPressAdvert'
							},
							{
								path: 'lpa-questionnaire/conservationMap'
							},
							{
								path: 'lpa-questionnaire/otherPartyRepresentations'
							},
							{
								path: 'lpa-questionnaire/planningOfficerReport'
							},
							{
								path: 'lpa-questionnaire/lpaCaseCorrespondence'
							},
							{
								path: 'costs/appellantCostsApplication'
							},
							{
								path: 'costs/appellantCostsWithdrawal'
							},
							{
								path: 'costs/appellantCostsCorrespondence'
							},
							{
								path: 'costs/lpaCostsApplication'
							},
							{
								path: 'costs/lpaCostsWithdrawal'
							},
							{
								path: 'costs/lpaCostsCorrespondence'
							},
							{
								path: 'costs/costsDecisionLetter'
							},
							{
								path: 'internal/crossTeamCorrespondence'
							},
							{
								path: 'internal/inspectorCorrespondence'
							},
							{
								path: 'internal/uncategorised'
							},
							{
								path: 'appeal-decision/caseDecisionLetter'
							}
						]
					}
				}
			});
			expect(databaseConnector.appeal.update).toHaveBeenCalled();
			expect(databaseConnector.documentRedactionStatus.findMany).toHaveBeenCalled();
		});
	});
});

describe('/appeals/lpaq-submission', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('POST invalid LPA submission', () => {
		test('invalid LPA response payload: no appeal', async () => {
			const { casedata, ...invalidPayload } = validLpaQuestionnaire;
			const response = await request.post('/appeals/lpaq-submission').send(invalidPayload);

			expect(casedata).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/: must have required property 'casedata'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no caseReference', async () => {
			const { caseReference, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(caseReference).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'caseReference'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no lpaCostsAppliedFor', async () => {
			const { lpaCostsAppliedFor, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(lpaCostsAppliedFor).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'lpaCostsAppliedFor'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});

		test('invalid LPA response payload: no isGreenBelt', async () => {
			const { isGreenBelt, ...invalidPayload } = validLpaQuestionnaire.casedata;
			const payload = { casedata: { ...invalidPayload }, documents: [] };
			const response = await request.post('/appeals/lpaq-submission').send(payload);

			expect(isGreenBelt).not.toBeUndefined();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					details: ["/casedata: must have required property 'isGreenBelt'"],
					integration: ERROR_INVALID_LPAQ_DATA
				}
			});
		});
	});
});
