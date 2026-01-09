// @ts-nocheck
import { formatCamelCaseToWords } from '../support/utils/format.js';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class CYASection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {
		previewEmailAppellant: 'preview-email-to-appellant',
		previewEmailLpa: 'preview-email-to-lpa'
	};

	// E L E M E N T S

	cyaSectionFields = {
		address: 'Address of where the inquiry will take place',
		reasonForRejectAppellantPOE:
			'Reason for rejecting the appellant proof of evidence and witnesses',
		reasonForRejectLPAPOE: 'Reason for rejecting the LPA proof of evidence and witnesses',
		rule6PartyName: 'Rule 6 party name',
		rule6PartyEmailAddress: 'Rule 6 party email address'
	};

	previewEmailSummary = {
		appellant: 'Preview email to appellant',
		lpa: 'Preview email to LPA'
	};

	previewEmails = {
		appellant: () => cy.getByData(this.selectors.previewEmailAppellant),
		lpa: () => cy.getByData(this.selectors.previewEmailLpa)
	};

	fileUploaderElements = {
		uploadFile: () => cy.getByData(this.selectors.uploadFile),
		uploadedFiles: () => cy.get(this.selectors.uploadedFileRows)
	};

	// A C T I O N S
	selectChangeAnswer(answer) {
		cy.getByData('change-' + answer).click();
	}

	changeAnswer(answer) {
		this.clickChangeLinkByLabel(answer);
	}

	verifyAnswerUpdated(fieldValue) {
		this.verifyCheckYourAnswers(fieldValue.field, fieldValue.value);
	}

	verifyPreviewEmail(emailType, isDateAndTime = false, appealDetails = null) {
		if (!this.previewEmails[emailType]) {
			throw new Error(`Invalid email type: ${emailType}. Use 'appellant' or 'lpa'.`);
		}

		const expectedText = this.previewEmailSummary[emailType];

		// Store the element with alias for reuse
		this.previewEmails[emailType]().as('emailDetails');

		cy.get('@emailDetails').then(($el) => {
			// Initial state - collapsed
			cy.wrap($el).should('not.have.attr', 'open');

			// Expand and verify
			cy.wrap($el).find('span').click();
			cy.wrap($el).should('have.attr', 'open');
			cy.wrap($el).find('.govuk-details__text').should('be.visible');
			cy.wrap($el).find('.govuk-details__summary-text').should('contain', expectedText);

			// are there appeal details to check (e.g. for inquiry or hearing)
			if (appealDetails) {
				Object.keys(appealDetails).forEach((key) => {
					const appealValue = `${formatCamelCaseToWords(key)}: ${appealDetails[key]}`;
					cy.wrap($el).find('.govuk-details__text').should('contain', appealValue);
				});
			}

			// Collapse and verify
			cy.wrap($el).find('span').click();
			cy.wrap($el).should('not.have.attr', 'open');
		});
	}
}
