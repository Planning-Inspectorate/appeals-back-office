import { CaseDetailsPage } from './caseDetailsPage.js';

export class RedactionStatusPage extends CaseDetailsPage {
	redactionPageSelectors = {
		redacted: '#redactionStatus-2',
		unredacted: '#redactionStatus',
		noRedactionRequired: '#redactionStatus-3'
	};

	selectRedactionOption(optionToSelect) {
		cy.get(this.redactionPageSelectors[optionToSelect]).click();
	}

	/**
	 * Highlights text in the textarea and clicks the redact button
	 * @param {string} textToHighlight
	 */
	highlightAndRedact(textToHighlight) {
		cy.get('#redact-textarea').then(($textarea) => {
			const text = $textarea.val();

			if (typeof text !== 'string') {
				throw new Error('Textarea value is not a string');
			}

			const startIndex = text.indexOf(textToHighlight);
			const endIndex = startIndex + textToHighlight.length;

			if (startIndex === -1) {
				throw new Error(`Text "${textToHighlight}" not found in textarea`);
			}

			const textareaEl = /** @type {HTMLTextAreaElement} */ ($textarea[0]);
			textareaEl.setSelectionRange(startIndex, endIndex);
			cy.wrap($textarea).trigger('select');
		});

		cy.get('#redact-button').click();

		const redactedText = '█'.repeat(textToHighlight.length);
		cy.get('#redact-textarea').invoke('val').should('contain', redactedText);
	}
}
