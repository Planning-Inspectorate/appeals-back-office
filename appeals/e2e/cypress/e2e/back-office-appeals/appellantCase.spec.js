/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();

const caseTypes = {
	D: 'householder',
	W: 'planning appeal'
};

const { users: apiUsers, casedata } = appealsApiRequests.caseSubmission;

describe('Managing Appellant Case Details', () => {

	const fieldId = 'planning-application-reference';
	const testReference = 'TEST-REF-123!.#@,/|:;?()_';
	const maxLengthReference = testReference.repeat(10).substring(0, 100);
	const exceededLengthReference = testReference.repeat(10).substring(0, 101);

	const appealTypes = {
		D: 'householder',
		W: 'planning appeal',
		Y: 'S20 appeal'
	};


	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('should display expected fields for householder (D) case', () => {
		cy.createCase({ caseType: 'D' }).then((caseRef) => {
			appellantCasePage.navigateToAppellantCase(caseRef);

			// ✅ Appellant section
			appellantCasePage.assertAppellantDetails({
				firstName: apiUsers[0].firstName,
				lastName: apiUsers[0].lastName,
				organisation: apiUsers[0].organisation,
				email: apiUsers[0].emailAddress,
				phone: apiUsers[0].telephoneNumber
			});

			// ✅ Agent section
			appellantCasePage.assertAgentDetails({
				firstName: apiUsers[1].firstName,
				lastName: apiUsers[1].lastName,
				organisation: apiUsers[1].organisation,
				email: apiUsers[1].emailAddress,
				phone: apiUsers[1].telephoneNumber
			});

			// ✅ Individual field assertions
			appellantCasePage.assertFieldLabelAndValue(
				'What is the address of the appeal site?',
				`${casedata.siteAddressLine1}, ${casedata.siteAddressLine2}, ${casedata.siteAddressTown}, ${casedata.siteAddressCounty}, ${casedata.siteAddressPostcode}`
			);

			appellantCasePage.assertFieldLabelAndValue(
				'Site ownership',
				casedata.ownsAllLand ? 'Fully owned' : 'Partially owned'
			);

			appellantCasePage.assertFieldLabelAndValue('Inspector access', casedata.siteAccessDetails[0]);

			appellantCasePage.assertFieldLabelAndValue(
				'Health and safety',
				casedata.siteSafetyDetails[0]
			);

			appellantCasePage.assertFieldLabelAndValue(
				'Application reference',
				casedata.applicationReference
			);

			appellantCasePage.assertFieldLabelAndValue(
				'LPA name',
				'K+C' // This may be hardcoded in your system
			);
		});
	});
});

// it('should reject empty value for the LPA application number', () => {
// 	cy.createCase({ caseType: 'D' }).then((caseRef) => {
// 		navigateToReferenceUpdate(caseRef);
// 		caseDetailsPage.updatePlanningApplicationReference(' ');
// 		verifyError('Enter the application reference number');
// 	});
// });

// it('should reject reference exceeding 100 characters for the LPA application number', () => {
// 	cy.createCase({ caseType: 'W' }).then((caseRef) => {
// 		navigateToReferenceUpdate(caseRef);
// 		caseDetailsPage.updatePlanningApplicationReference(exceededLengthReference);
// 		verifyError('Application reference number must be 100 characters or less');
// 	});
// });

// Object.entries(appealTypes).forEach(([caseType, description]) => {
// 	it(`should update ${description} LPA application reference`, () => {
// 		cy.createCase({ caseType }).then((caseRef) => {
// 			navigateToReferenceUpdate(caseRef);
// 			caseDetailsPage.updatePlanningApplicationReference(maxLengthReference);

// 			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal updated');
// 			cy.loadAppealDetails(caseRef)
// 				.its('planningApplicationReference')
// 				.should('eq', maxLengthReference);
// 		});
// 	});
// });

// const verifyError = (message) => {
// 	caseDetailsPage.checkErrorMessageDisplays(message);
// 	caseDetailsPage.verifyInlineErrorMessage(`${fieldId}-error`);
// 	caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
// };
