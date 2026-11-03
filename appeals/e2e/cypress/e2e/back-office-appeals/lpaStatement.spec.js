// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();

['W', 'Y'].forEach((caseType) => {
	describe(`S78 - LPA Statement for case type ${caseType}`, () => {
		const statementPrefix = 'Hello, not about cheese but still a rep of some kind (LPA statement).';

		const setupCaseToStatementsStage = (caseObj) => {
			cy.addAllocationLevelAndSpecialisms(caseObj);
			if (caseType === 'W') {
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
			} else {
				happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S20');
			}
			caseDetailsPage.checkStatusOfCase('Statements', 0);
		};

		beforeEach(() => {
			cy.login(users.appeals.caseAdmin);
		});

		let appeal;

		afterEach(() => {
			cy.deleteAppeals(appeal);
		});
		it('should show more/close functionality on check your answers page', () => {
			const representation = Cypress._.repeat(statementPrefix, 5).substring(0, 301);
			const isToggleDisplayed = true;

			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				caseDetailsPage.acceptLpaStatement(caseObj, 'No', representation);
				caseDetailsPage.verifyStatementIsDisplayed(representation, isToggleDisplayed);
			});
		});

		it('should review decision before accepting LPA statement', () => {
			const isToggleDisplayed = false;

			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				caseDetailsPage.acceptLpaStatement(caseObj, 'No', statementPrefix);
				caseDetailsPage.verifyStatementIsDisplayed(statementPrefix, isToggleDisplayed);
			});
			caseDetailsPage.clickLpaStatementChangeLink('Review decision');
			caseDetailsPage.validateSectionHeader('Review LPA statement');
		});

		it('should update allocation level and specialisms', () => {
			const isToggleDisplayed = false;

			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				caseDetailsPage.acceptLpaStatement(caseObj, 'No', statementPrefix);
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

			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				caseDetailsPage.acceptLpaStatement(caseObj, 'No', representation);
				caseDetailsPage.verifyStatementIsDisplayed(representation, isToggleDisplayed);
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'LPA statement accepted');
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					const lpaStatement = appealDetails?.documentationSummary?.lpaStatement;
					expect(lpaStatement.status).to.eq('received');
					expect(lpaStatement.representationStatus).to.eq('valid');
				});
			});
		});

		it('should update redaction status of LPA statement supporting document', () => {
			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				cy.addRepresentation(caseObj, 'lpaStatement', null, statementPrefix);
				cy.simulateDocumentsScanComplete(caseObj);
				caseDetailsPage.validateBannerMessage('Important', 'LPA statement awaiting review');
				caseDetailsPage.elements.lpaStatementReviewLink().click();
				caseDetailsPage.validateSectionHeader('Review LPA statement');
				caseDetailsPage.verifyCheckYourAnswers('Supporting documents', 'lpaStatement-');

				caseDetailsPage.updateSupportingDocumentRedactionStatus('No redaction required');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader('Supporting documents');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader('Review LPA statement');
				caseDetailsPage.selectRadioButtonByValue('Accept statement');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('A');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectCheckbox();
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'LPA statement accepted');

				['Redacted', 'Unredacted'].forEach((redactionStatus) => {
					caseDetailsPage.elements.viewLpaStatement().click();
					caseDetailsPage.validateSectionHeader('LPA statement');
					caseDetailsPage.updateSupportingDocumentRedactionStatus(redactionStatus);
					happyPathHelper.viewCaseDetails(caseObj);
				});
			});
		});

		it('should update redaction status of IP comment supporting document', () => {
			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);
				cy.addRepresentation(caseObj, 'interestedPartyComment', null);
				cy.simulateDocumentsScanComplete(caseObj);
				caseDetailsPage.validateBannerMessage(
					'Important',
					'Interested party comments awaiting review'
				);
				caseDetailsPage.elements.ipCommentsReviewLink().click();
				caseDetailsPage.validateSectionHeader('Interested party comments');
				caseDetailsPage.clickLinkByText('Review');
				caseDetailsPage.validateSectionHeader('Review comment');
				caseDetailsPage.verifyCheckYourAnswers('Supporting documents', 'interestedPartyComment-');
				caseDetailsPage.updateSupportingDocumentRedactionStatus('No redaction required');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader('Supporting documents');
				caseDetailsPage.clickBackLink();
				caseDetailsPage.validateSectionHeader('Review comment');
				caseDetailsPage.selectRadioButtonByValue('Accept comment');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateBannerMessage('Success', 'Comment accepted');

				['Redacted', 'Unredacted'].forEach((redactionStatus) => {
					happyPathHelper.viewCaseDetails(caseObj);
					caseDetailsPage.elements.addIpComments().click();
					caseDetailsPage.validateSectionHeader('Interested party comments');
					caseDetailsPage.clickTabByText('Accepted');
					caseDetailsPage.clickLinkByText('View');
					caseDetailsPage.updateSupportingDocumentRedactionStatus(redactionStatus);
				});
			});
		});
	});
});
