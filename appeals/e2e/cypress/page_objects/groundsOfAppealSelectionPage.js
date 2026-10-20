// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

/**
 * This page object represents the update grounds of appeal selection page within the appellant case page
 */

export class GroundsOfAppealSelectionPage extends CaseDetailsPage {
	// define selectors for the grounds of appeal checkboxes
	groundsOfAppealSelectorsMap = {
		a: {
			selector: '#grounds-for-appeal',
			label: 'Ground (a)'
		},
		b: {
			selector: '#grounds-for-appeal-2',
			label: 'Ground (b)'
		},
		c: {
			selector: '#grounds-for-appeal-3',
			label: 'Ground (c)'
		},
		d: {
			selector: '#grounds-for-appeal-4',
			label: 'Ground (d)'
		},
		e: {
			selector: '#grounds-for-appeal-5',
			label: 'Ground (e)'
		},
		f: {
			selector: '#grounds-for-appeal-6',
			label: 'Ground (f)'
		},
		g: {
			selector: '#grounds-for-appeal-7',
			label: 'Ground (g)'
		},
		h: {
			selector: '#grounds-for-appeal-8',
			label: 'Ground (h)'
		},
		i: {
			selector: '#grounds-for-appeal-9',
			label: 'Ground (h)'
		},
		j: {
			selector: '#grounds-for-appeal-10',
			label: 'Ground (i)'
		},
		k: {
			selector: '#grounds-for-appeal-11',
			label: 'Ground (k)'
		}
	};

	getAllGroundsOfAppeal() {
		return Object.keys(this.groundsOfAppealSelectorsMap);
	}

	checkSelectedGroundsOfAppeal(grounds) {
		const expectedNNumberOfSelectedGrounds = grounds.length;

		const getLabelText = (checkbox) => Cypress.$(checkbox).siblings('label').text().trim();

		// check the number of selected grounds, and that each ground is selected
		cy.get('input[type="checkbox"]:checked')
			.should('have.length', expectedNNumberOfSelectedGrounds)
			.then(($checkboxes) => {
				cy.writeLog(`Number of selected grounds: ${$checkboxes.length}`);

				// check that each expected ground is selected
				grounds.forEach((ground, index) => {
					const labelText = this.groundsOfAppealSelectorsMap[ground.groundRef].label;

					// look for the checkbox with the specified label text
					const checkbox = $checkboxes.filter((i, elem) => getLabelText(elem) === labelText)[0];

					// if checkbox was not returned, is either not selected or not present in UI
					if (!checkbox) {
						throw new Error(
							`Checkbox with label "${labelText}" was either not found or not checked`
						);
					}
				});
			});
	}

	selectGroundsOfAppeal(grounds) {
		// select the specified grounds of appeal checkboxes
		grounds.forEach((ground) => {
			const selector = this.groundsOfAppealSelectorsMap[ground].selector;
			cy.writeLog(`Selecting ground of appeal: ${this.groundsOfAppealSelectorsMap[ground].label}`);
			cy.get(selector).click();
		});

		// click the continue button to confirm the selection
		this.clickButtonByText('Continue');
	}
}
