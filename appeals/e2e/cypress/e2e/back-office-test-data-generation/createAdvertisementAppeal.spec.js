// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests.js';
import { users } from '../../fixtures/users';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';

const caseDetailsPage = new CaseDetailsPage();
const inquirySectionPage = new InquirySectionPage();

let caseObj;
let appeal;

let testCaseConfig = {
	addLpaq: true,
	approveLpaq: false,
	validateAppeal: true,
	startCase: true,
	assignCaseOfficer: true,
	addAppellantPOE: false,
	addLPAPOE: false
};

before(() => {});

after(() => {});

describe('Create advertisement application', () => {
	it('Create advertisement appeal according to specified values ', () => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({ ...appealsApiRequests.advertsSubmission.casedata }).then((refObj) => {
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
