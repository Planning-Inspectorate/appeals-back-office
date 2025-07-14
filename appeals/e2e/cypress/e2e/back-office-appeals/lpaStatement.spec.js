/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();

['W', 'Y'].forEach((caseType) => {
	describe(`S78 - LPA Statement for case type ${caseType}`, () => {
		const statementPrefix = 'Hello, not about cheese but still a rep of some kind (LPA statement).';

		const setupCaseToStatementsStage = (caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			cy.addAllocationLevelAndSpecialisms(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);

			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);

			if (caseType === 'W') {
				happyPathHelper.startS78Case(caseRef, 'written');
			} else {
				happyPathHelper.startCase(caseRef);
			}
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

			happyPathHelper.reviewS78Lpaq(caseRef);
			caseDetailsPage.checkStatusOfCase('Statements', 0);
		};

		beforeEach(() => {
			cy.login(users.appeals.caseAdmin);
		});

		it('should show more/close functionality on check your answers page', () => {
			const representation = Cypress._.repeat(statementPrefix, 5).substring(0, 301);
			const isToggleDisplayed = true;

			cy.createCase({ caseType }).then((caseRef) => {
				setupCaseToStatementsStage(caseRef);
				caseDetailsPage.acceptLpaStatement(caseRef, 'No', representation);
				caseDetailsPage.verifyStatementIsDisplayed(representation, isToggleDisplayed);
			});
		});

		it('should review decision before accepting LPA statement', () => {
			const isToggleDisplayed = false;

			cy.createCase({ caseType }).then((caseRef) => {
				setupCaseToStatementsStage(caseRef);
				caseDetailsPage.acceptLpaStatement(caseRef, 'No', statementPrefix);
				caseDetailsPage.verifyStatementIsDisplayed(statementPrefix, isToggleDisplayed);
			});
			caseDetailsPage.clickLpaStatementChangeLink('Review decision');
			caseDetailsPage.validateSectionHeader('Review LPA statement');
		});

		it('should update allocation level and specialisms', () => {
			const isToggleDisplayed = false;

			cy.createCase({ caseType }).then((caseRef) => {
				setupCaseToStatementsStage(caseRef);
				caseDetailsPage.acceptLpaStatement(caseRef, 'No', statementPrefix);
				caseDetailsPage.verifyStatementIsDisplayed(statementPrefix, isToggleDisplayed);
			});
			caseDetailsPage.clickLpaStatementChangeLink(
				'Do you need to update the allocation level and specialisms?'
			);
			caseDetailsPage.validateSectionHeader('Allocation level');
		});

		it('should accept LPA statement', () => {
			const representation = Cypress._.repeat(statementPrefix, 5).substring(0, 300);
			const isToggleDisplayed = false;

			cy.createCase({ caseType }).then((caseRef) => {
				setupCaseToStatementsStage(caseRef);
				caseDetailsPage.acceptLpaStatement(caseRef, 'No', representation);
				caseDetailsPage.verifyStatementIsDisplayed(representation, isToggleDisplayed);
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'LPA statement accepted');
				cy.loadAppealDetails(caseRef).then((appealDetails) => {
					const lpaStatement = appealDetails?.documentationSummary?.lpaStatement;
					expect(lpaStatement.status).to.eq('received');
					expect(lpaStatement.representationStatus).to.eq('valid');
				});
			});
		});
	});
});
