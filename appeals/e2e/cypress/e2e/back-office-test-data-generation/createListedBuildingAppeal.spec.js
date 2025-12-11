// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';

const caseDetailsPage = new CaseDetailsPage();
const inquirySectionPage = new InquirySectionPage();

let caseObj;
let appeal;

let testCaseConfig = {
	addLpaq: true,
	approveLpaq: true,
	validateAppeal: true,
	startCase: true,
	addInquiry: true,
	addHearing: false,
	assignCaseOfficer: true,
	addAppellantPOE: false,
	addLPAPOE: false
};

before(() => {});

after(() => {});

describe('Create listed building application', () => {
	it('Create listed building appeal according to specified values ', () => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({ caseType: 'Y' }).then((refObj) => {
			caseObj = refObj;
			appeal = caseObj;

			// Assign Case Officer Via API
			if (testCaseConfig.assignCaseOfficer) {
				cy.assignCaseOfficer(caseObj);
			}

			// Validate Appeal Via API
			if (testCaseConfig.validateAppeal) {
				cy.getBusinessActualDate(new Date(), 0).then((date) => {
					cy.updateAppealDetails(caseObj, { validationOutcome: 'valid', validAt: date });
				});
			}

			// add inquiry
			if (testCaseConfig.addInquiry) {
				inquirySectionPage.setupTimetableDates().then(({ currentDate, ...timeTable }) => {
					// Set up inquiry case with LPA questionnaire
					cy.addInquiry(caseObj, currentDate, timeTable);
				});
			}

			// add hearing
			if (testCaseConfig.addHearing) {
				cy.getBusinessActualDate(new Date(), 0).then((date) => {
					// Set up hearing case
					cy.addHearingDetails(caseObj, date);
				});
				cy.setupHearing(caseObj);
			}

			// add lpaq
			if (testCaseConfig.addLpaq) {
				cy.addLpaqSubmissionToCase(caseObj);
			}

			// approve lpaq
			if (testCaseConfig.approveLpaq) {
				cy.reviewLpaqSubmission(caseObj);
			}

			// add appellant POE
			if (testCaseConfig.addAppellantPOE) {
				cy.simulateStatementsDeadlineElapsed(caseObj);
				// Process proof of evidence submission (FO) via Api
				inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'appellantProofOfEvidence');
			}

			// add LPA POE
			if (testCaseConfig.addLPAPOE) {
				cy.simulateStatementsDeadlineElapsed(caseObj);
				// Process proof of evidence submission (FO) via Api
				inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'lpaProofOfEvidence');
			}

			// start case
			if (testCaseConfig.startCase) {
				cy.startAppeal(caseObj);
			}

			cy.log(`*** Created test case for ${caseObj.reference}`);
			cy.log(
				'📋 Test case Details:',
				JSON.stringify(
					{
						reference: caseObj.reference,
						id: caseObj.id,
						...testCaseConfig,
						caseDetailsUrl: `${Cypress.config('baseUrl')}appeals-service/appeal-details/${
							caseObj.id
						}`
					},
					'',
					2
				)
			);
			console.log(`
                📋 Test case Details:
                ----------------
                reference: ${caseObj.referecne}
                Id: ${caseObj.id}
                ${JSON.stringify(
									{
										reference: caseObj.reference,
										id: caseObj.id,
										...testCaseConfig,
										caseDetailsUrl: `${Cypress.config('baseUrl')}appeals-service/appeal-details/${
											caseObj.id
										}`
									},
									'',
									2
								)};
            `);
		});
	});
});
