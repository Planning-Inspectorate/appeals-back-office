import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { findStatusDate } from '#utils/mapping/map-dates.js';
import { isCaseInvalid } from '#utils/case-invalid.js';
import { mapAppellantCaseIn } from '../commands/appellant-case.mapper.js';

describe('appeals generic mappers', () => {
	test('map case validation date on invalid appeal', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: false,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: false,
						createdAt: new Date('2025-03-20T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-21T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		expect(output).toBe('2025-03-18T09:12:33.334Z');
	});

	test('map case validation date on invalid appellant case', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		expect(output).toBe('2025-03-19T09:12:33.334Z');
	});
});

describe('map appellant case in', () => {
	test('map case validation date on invalid appeal', async () => {
		const input = `{
			"casedata": {
				"caseType": "W",
				"submissionId": "604ae231-6815-4cbc-93a0-219935723421",
				"caseProcedure": "written",
				"typeOfPlanningApplication": "full-appeal",
				"lpaCode": "Q1111",
				"caseSubmittedDate": "2025-06-19T08:52:42.521Z",
				"enforcementNotice": false,
				"applicationReference": "test-message",
				"applicationDate": "2025-04-30T23:00:00.000Z",
				"applicationDecision": "refused",
				"applicationDecisionDate": "2025-05-01T00:00:00.000Z",
				"caseSubmissionDueDate": "2025-11-01T23:59:59.999Z",
				"siteAddressLine1": "A",
				"siteAddressLine2": "",
				"siteAddressTown": "B",
				"siteAddressCounty": "",
				"siteAddressPostcode": "AA11 1AA",
				"siteAccessDetails": [],
				"siteSafetyDetails": [],
				"neighbouringSiteAddresses": null,
				"nearbyCaseReferences": [],
				"isGreenBelt": false,
				"siteAreaSquareMetres": 1,
				"floorSpaceSquareMetres": 1,
				"ownsAllLand": true,
				"ownsSomeLand": null,
				"knowsOtherOwners": null,
				"knowsAllOwners": null,
				"advertisedAppeal": null,
				"ownersInformed": null,
				"originalDevelopmentDescription": "Test",
				"changedDevelopmentDescription": false,
				"appellantCostsAppliedFor": false,
				"agriculturalHolding": false,
				"tenantAgriculturalHolding": null,
				"otherTenantsAgriculturalHolding": null,
				"informedTenantsAgriculturalHolding": null,
				"planningObligation": true,
				"statusPlanningObligation": "finalised",
				"developmentType": "minor-dwellings",
				"appellantProcedurePreference": "written",
				"appellantProcedurePreferenceDetails": null,
				"appellantProcedurePreferenceDuration": null,
				"appellantProcedurePreferenceWitnessCount": null
			},
			"documents": [
				{
					"documentId": "db7060db-63ed-4a59-bfae-a32bbbb15fc3",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"originalFilename": "community-infrastructure-levy.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/db7060db-63ed-4a59-bfae-a32bbbb15fc3/0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"dateCreated": "2025-06-19T08:51:12.000Z",
					"documentType": "applicationDecisionLetter"
				},
				{
					"documentId": "facd1e59-43b9-4bb7-b48d-a8da44c08048",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-appeal-statement-valid.pdf",
					"originalFilename": "appeal-statement-valid.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/facd1e59-43b9-4bb7-b48d-a8da44c08048/0c655dae-ca61-4686-824d-72b78e9c0849-appeal-statement-valid.pdf",
					"dateCreated": "2025-06-19T08:51:26.000Z",
					"documentType": "planningObligation"
				},
				{
					"documentId": "99bb408d-d237-4821-988a-38f17266ba42",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-decision-letter.pdf",
					"originalFilename": "decision-letter.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/99bb408d-d237-4821-988a-38f17266ba42/0c655dae-ca61-4686-824d-72b78e9c0849-decision-letter.pdf",
					"dateCreated": "2025-06-19T08:51:08.000Z",
					"documentType": "originalApplicationForm"
				},
				{
					"documentId": "3983aecb-a28b-4da7-8baf-8f7227704c0d",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"originalFilename": "community-infrastructure-levy.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/3983aecb-a28b-4da7-8baf-8f7227704c0d/0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"dateCreated": "2025-06-19T08:51:34.000Z",
					"documentType": "appellantStatement"
				},
				{
					"documentId": "3bdf2fbb-f5cf-4b2f-abca-79c8b0b3bf91",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-definitive-map-stmt.pdf",
					"originalFilename": "definitive-map-stmt.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/3bdf2fbb-f5cf-4b2f-abca-79c8b0b3bf91/0c655dae-ca61-4686-824d-72b78e9c0849-definitive-map-stmt.pdf",
					"dateCreated": "2025-06-19T08:51:44.000Z",
					"documentType": "plansDrawings"
				}
			],
			"users": [
				{
					"salutation": "Mr",
					"firstName": "Testy",
					"lastName": "McTest",
					"emailAddress": "test@test.com",
					"serviceUserType": "Appellant",
					"telephoneNumber": "0123456789",
					"organisation": ""
				}
			]
		}`;

		const data = JSON.parse(input);

		const output = mapAppellantCaseIn(data);

		expect(output.appellantProcedurePreference).toBe('written');
	});

	test('maps null values for appellantProcedurePreference fieldsl', async () => {
		const input = `{
			"casedata": {
				"caseType": "W",
				"submissionId": "604ae231-6815-4cbc-93a0-219935723421",
				"caseProcedure": "written",
				"typeOfPlanningApplication": "full-appeal",
				"lpaCode": "Q1111",
				"caseSubmittedDate": "2025-06-19T08:52:42.521Z",
				"enforcementNotice": false,
				"applicationReference": "test-message",
				"applicationDate": "2025-04-30T23:00:00.000Z",
				"applicationDecision": "refused",
				"applicationDecisionDate": "2025-05-01T00:00:00.000Z",
				"caseSubmissionDueDate": "2025-11-01T23:59:59.999Z",
				"siteAddressLine1": "A",
				"siteAddressLine2": "",
				"siteAddressTown": "B",
				"siteAddressCounty": "",
				"siteAddressPostcode": "AA11 1AA",
				"siteAccessDetails": [],
				"siteSafetyDetails": [],
				"neighbouringSiteAddresses": null,
				"nearbyCaseReferences": [],
				"isGreenBelt": false,
				"siteAreaSquareMetres": 1,
				"floorSpaceSquareMetres": 1,
				"ownsAllLand": true,
				"ownsSomeLand": null,
				"knowsOtherOwners": null,
				"knowsAllOwners": null,
				"advertisedAppeal": null,
				"ownersInformed": null,
				"originalDevelopmentDescription": "Test",
				"changedDevelopmentDescription": false,
				"appellantCostsAppliedFor": false,
				"agriculturalHolding": false,
				"tenantAgriculturalHolding": null,
				"otherTenantsAgriculturalHolding": null,
				"informedTenantsAgriculturalHolding": null,
				"planningObligation": true,
				"statusPlanningObligation": "finalised",
				"developmentType": "minor-dwellings",
				"appellantProcedurePreference": null,
				"appellantProcedurePreferenceDetails": null,
				"appellantProcedurePreferenceDuration": null,
				"appellantProcedurePreferenceWitnessCount": null
			},
			"documents": [
				{
					"documentId": "db7060db-63ed-4a59-bfae-a32bbbb15fc3",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"originalFilename": "community-infrastructure-levy.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/db7060db-63ed-4a59-bfae-a32bbbb15fc3/0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"dateCreated": "2025-06-19T08:51:12.000Z",
					"documentType": "applicationDecisionLetter"
				},
				{
					"documentId": "facd1e59-43b9-4bb7-b48d-a8da44c08048",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-appeal-statement-valid.pdf",
					"originalFilename": "appeal-statement-valid.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/facd1e59-43b9-4bb7-b48d-a8da44c08048/0c655dae-ca61-4686-824d-72b78e9c0849-appeal-statement-valid.pdf",
					"dateCreated": "2025-06-19T08:51:26.000Z",
					"documentType": "planningObligation"
				},
				{
					"documentId": "99bb408d-d237-4821-988a-38f17266ba42",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-decision-letter.pdf",
					"originalFilename": "decision-letter.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/99bb408d-d237-4821-988a-38f17266ba42/0c655dae-ca61-4686-824d-72b78e9c0849-decision-letter.pdf",
					"dateCreated": "2025-06-19T08:51:08.000Z",
					"documentType": "originalApplicationForm"
				},
				{
					"documentId": "3983aecb-a28b-4da7-8baf-8f7227704c0d",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"originalFilename": "community-infrastructure-levy.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/3983aecb-a28b-4da7-8baf-8f7227704c0d/0c655dae-ca61-4686-824d-72b78e9c0849-community-infrastructure-levy.pdf",
					"dateCreated": "2025-06-19T08:51:34.000Z",
					"documentType": "appellantStatement"
				},
				{
					"documentId": "3bdf2fbb-f5cf-4b2f-abca-79c8b0b3bf91",
					"filename": "0c655dae-ca61-4686-824d-72b78e9c0849-definitive-map-stmt.pdf",
					"originalFilename": "definitive-map-stmt.pdf",
					"size": 31189,
					"mime": "application/pdf",
					"documentURI": "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploadss/s78-appeal-form%3A0c655dae-ca61-4686-824d-72b78e9c0849/3bdf2fbb-f5cf-4b2f-abca-79c8b0b3bf91/0c655dae-ca61-4686-824d-72b78e9c0849-definitive-map-stmt.pdf",
					"dateCreated": "2025-06-19T08:51:44.000Z",
					"documentType": "plansDrawings"
				}
			],
			"users": [
				{
					"salutation": "Mr",
					"firstName": "Testy",
					"lastName": "McTest",
					"emailAddress": "test@test.com",
					"serviceUserType": "Appellant",
					"telephoneNumber": "0123456789",
					"organisation": ""
				}
			]
		}`;

		const data = JSON.parse(input);

		const output = mapAppellantCaseIn(data);

		expect(output.appellantProcedurePreference).toBeNull();
		expect(output.appellantProcedurePreferenceDetails).toBeNull();
		expect(output.appellantProcedurePreferenceDuration).toBeNull();
		expect(output.appellantProcedurePreferenceWitnessCount).toBeNull();
	});
});
