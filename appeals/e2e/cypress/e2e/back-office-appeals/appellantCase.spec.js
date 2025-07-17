/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
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

	it('should reject empty value for the LPA application number', () => {
		cy.createCase({ caseType: 'D' }).then((caseRef) => {
			navigateToReferenceUpdate(caseRef);
			caseDetailsPage.updatePlanningApplicationReference(' ');
			verifyError('Enter the application reference number');
		});
	});

	it('should reject reference exceeding 100 characters for the LPA application number', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			navigateToReferenceUpdate(caseRef);
			caseDetailsPage.updatePlanningApplicationReference(exceededLengthReference);
			verifyError('Application reference number must be 100 characters or less');
		});
	});

	Object.entries(appealTypes).forEach(([caseType, description]) => {
		it(`should update ${description} LPA application reference`, () => {
			cy.createCase({ caseType }).then((caseRef) => {
				navigateToReferenceUpdate(caseRef);
				caseDetailsPage.updatePlanningApplicationReference(maxLengthReference);

				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal updated');
				cy.loadAppealDetails(caseRef)
					.its('planningApplicationReference')
					.should('eq', maxLengthReference);
			});
		});
	});

	const navigateToReferenceUpdate = (caseRef) => {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.clickChangeApplicationReferenceLink();
	};

	const verifyError = (message) => {
		caseDetailsPage.checkErrorMessageDisplays(message);
		caseDetailsPage.verifyInlineErrorMessage(`${fieldId}-error`);
		caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
	};
});
