// @ts-nocheck
import { appealsApiClient } from '../appealsApiClient';

// HELPER FUNCTIONS

Cypress.Commands.add('reloadUntilVirusCheckComplete', () => {
	cy.reload();
});

Cypress.Commands.add('reloadUntilVirusCheckComplete', () => {
	cy.reload();
});

Cypress.Commands.add('getByData', (value) => {
	return cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('elementExists', (selector) => {
	return cy.get('body').then(($body) => {
		const hasElement = $body.find(selector).length > 0;
		return cy.wrap(hasElement);
	});
});

Cypress.Commands.add('selectReasonOption', (optionLabel = null) => {
	return cy.get('input[type="checkbox"]').then(($checkboxes) => {
		// Helper function to get label text for a checkbox
		const getLabelText = (checkbox) => Cypress.$(checkbox).siblings('label').text().trim();

		// Filter checkboxes based on the selection logic
		const targetCheckbox =
			optionLabel === 'Other reason'
				? $checkboxes.filter((i, elem) => getLabelText(elem) === 'Other reason')[0]
				: $checkboxes.filter((i, elem) => getLabelText(elem) !== 'Other reason')[
						Math.floor(
							Math.random() *
								$checkboxes.filter((i, elem) => getLabelText(elem) !== 'Other reason').length
						)
				  ];

		// Validate target checkbox exists
		if (!targetCheckbox) {
			throw new Error(
				optionLabel === 'Other reason'
					? 'Checkbox with label "Other reason" not found'
					: 'No eligible checkboxes available (excluding "Other reason")'
			);
		}

		// Select checkbox and return label text
		const selectedLabelText = getLabelText(targetCheckbox);
		cy.wrap(targetCheckbox).click().should('be.checked');

		return cy.wrap(selectedLabelText);
	});
});

Cypress.Commands.add('checkNotifySent', (caseObj, expectedNotifies) => {
	// ensure input is always an array
	const expected = [].concat(expectedNotifies);

	expected.forEach(({ template, recipient }) => {
		expect(
			typeof template === 'string' && template.trim() !== '',
			`notify template should be provided: "${template}"`
		).to.be.true;

		expect(
			typeof recipient === 'string' && recipient.trim() !== '',
			`notify recipient should be provided: "${recipient}"`
		).to.be.true;
	});

	return cy.wrap(null).then(async () => {
		// returns an array of email objects sent for the given appeal
		const sentNotifies = await appealsApiClient.getNotifyEmails(caseObj.reference);

		// filter for expected notifies that were NOT found in the sent notfies array
		const missingNotifies = expected.filter(
			(expectedNotify) =>
				!sentNotifies.some(
					(sentNotifies) =>
						sentNotifies.template === expectedNotify.template &&
						sentNotifies.recipient === expectedNotify.recipient
				)
		);

		// error message detail
		const missingDetails = missingNotifies
			.map((notify) => `(Template: ${notify.template}, Recipient: ${notify.recipient})`)
			.join('; ');

		expect(missingNotifies, `Missing notifies: ${missingDetails}`).to.be.empty;
	});
});
