// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { FileUploaderSection } from '../../page_objects/fileUploadSection.js';
import { RedactionStatusPage } from '../../page_objects/redactionStatusPage.js';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();
const documentationSectionPage = new DocumentationSectionPage();
const caseHistoryPage = new CaseHistoryPage();
const redactionStatusPage = new RedactionStatusPage();
const cyaSection = new CYASection();
const fileUploaderSection = new FileUploaderSection();
const dateTimeSection = new DateTimeSection();

let sampleFiles = caseDetailsPage.sampleFiles;

['F', 'C'].forEach((caseType) => {
	describe(`Appellant Statement for case type ${caseType}`, () => {
		const statementPrefix =
			'Hello, not about cheese but still a rep of some kind (Appellant statement).';

		const setupCaseToStatementsStage = (caseObj) => {
			cy.addAllocationLevelAndSpecialisms(caseObj);
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
			caseDetailsPage.checkStatusOfCase('Statements', 0);
		};

		const createEnforcementCase = () => {
			const now = new Date();
			const enforcementEffectiveDate = new Date(
				now.getTime() - 7 * 24 * 60 * 60 * 1000
			).toISOString();
			const enforcementIssueDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

			return cy.createCase({
				caseType,
				enforcementEffectiveDate,
				enforcementIssueDate,
				enforcementNotice: true,
				enforcementReference: 'abcd1234'
			});
		};

		const verifyAppellantStatementStatus = (status) => {
			caseDetailsPage.verifyDocumentationValue(
				'documentation',
				'Status',
				'Appellant statement',
				status
			);
		};

		const addAppellantStatementAndVerify = (caseObj) => {
			cy.addAppellantStatementToCase(caseObj);
			caseDetailsPage.validateBannerMessage('Important', 'Appellant statement awaiting review');
		};

		const reviewAppellantStatement = (decision, stepsCallback) => {
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.selectRadioButtonByValue(decision);
			caseDetailsPage.clickButtonByText('Continue');
			if (stepsCallback) {
				stepsCallback();
			}
		};

		beforeEach(() => {
			cy.login(users.appeals.caseAdmin);
		});

		let appeal;

		afterEach(() => {
			cy.deleteAppeals(appeal);
		});

		it('should update allocation level and specialisms', () => {
			createEnforcementCase().then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);

				addAppellantStatementAndVerify(caseObj);

				reviewAppellantStatement('Accept statement', () => {
					caseDetailsPage.selectRadioButtonByValue('No');
					caseDetailsPage.clickButtonByText('Continue');
					cyaSection.verifyCheckYourAnswers(
						'Do you need to update the allocation level and specialisms?',
						'No'
					);
					cyaSection.changeAnswer('Do you need to update the allocation level and specialisms?');
				});

				caseDetailsPage.validateSectionHeader('Allocation level');
			});
		});

		it('should accept Appellant statement', () => {
			createEnforcementCase().then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);

				verifyAppellantStatementStatus('Awaiting statement');

				addAppellantStatementAndVerify(caseObj);

				reviewAppellantStatement('Accept statement', () => {
					caseDetailsPage.selectRadioButtonByValue('No');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Confirm');
				});

				caseDetailsPage.validateBannerMessage('Success', 'Appellant statement accepted');

				verifyAppellantStatementStatus('Accepted');

				// Verify Case History
				caseDetailsPage.clickViewCaseHistory();
				caseHistoryPage.verifyCaseHistoryValue('Appellant statement accepted');
			});
		});

		it('should redact and accept Appellant statement', () => {
			createEnforcementCase().then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);

				verifyAppellantStatementStatus('Awaiting statement');

				addAppellantStatementAndVerify(caseObj);

				reviewAppellantStatement('Redact and accept statement', () => {
					redactionStatusPage.highlightAndRedact('cheese');
					caseDetailsPage.clickButtonByText('Continue');

					caseDetailsPage.selectRadioButtonByValue('No');
					caseDetailsPage.clickButtonByText('Continue');

					cyaSection.verifyRedactedText('Redacted statement', 'cheese');

					caseDetailsPage.clickButtonByText('Redact and accept statement');
				});

				caseDetailsPage.validateBannerMessage(
					'Success',
					'Appellant statement redacted and accepted'
				);

				verifyAppellantStatementStatus('Accepted');

				// Verify Case History
				caseDetailsPage.clickViewCaseHistory();
				caseHistoryPage.verifyCaseHistoryValue('Appellant statement redacted and accepted');
			});
		});

		it('should mark Appellant statement as incomplete', () => {
			createEnforcementCase().then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);

				verifyAppellantStatementStatus('Awaiting statement');

				addAppellantStatementAndVerify(caseObj);

				reviewAppellantStatement('Statement incomplete', () => {
					caseDetailsPage.chooseCheckboxByText('No list of suggested conditions');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue('No');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Confirm statement is incomplete');
				});

				caseDetailsPage.validateBannerMessage('Success', 'Appellant statement incomplete');

				caseDetailsPage.validateBannerMessage('Important', 'Appellant statement incomplete');

				verifyAppellantStatementStatus('Incomplete');

				// Verify Case History
				caseDetailsPage.clickViewCaseHistory();
				caseHistoryPage.verifyCaseHistoryValue('Appellant statement incomplete');
			});
		});

		it('should add statement for overdue Appellant statement submission', () => {
			createEnforcementCase().then((caseObj) => {
				appeal = caseObj;
				setupCaseToStatementsStage(caseObj);

				verifyAppellantStatementStatus('Awaiting statement');

				// Elapsed statements deadline
				cy.simulateStatementsDeadlineElapsed(caseObj);

				verifyAppellantStatementStatus('Overdue');

				documentationSectionPage.selectAddDocument('appellant-statement');

				// navigate to file upload view, upload file and verify uploaded
				fileUploaderSection.uploadFile(sampleFiles.document);
				fileUploaderSection.verifyFilesUploaded([sampleFiles.document]);

				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue('Redacted');
				caseDetailsPage.clickButtonByText('Continue');

				caseDetailsPage.checkHeading('When was the supporting document submitted?');
				dateTimeSection.checkDateIsPrefilled();
				caseDetailsPage.clickButtonByText('Continue');

				caseDetailsPage.checkHeading('Check details and add document');
				cyaSection.verifyCheckYourAnswers('Redaction status', 'Redacted');

				caseDetailsPage.clickButtonByText('Add document');

				caseDetailsPage.validateBannerMessage('Success', 'Appellant statement added');
			});
		});
	});
});
