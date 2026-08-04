// @ts-nocheck
import { Page } from '../basePage';
import { CaseDetailsPage } from '../caseDetailsPage.js';
import { CASE_HISTORY_STATES } from './caseHistoryStates';

let caseRef;
let states;
const caseDetailsPage = new CaseDetailsPage();

export class CaseHistoryPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	fixturesPath = 'cypress/fixtures/';
	states = CASE_HISTORY_STATES;

	/********************************************************
	 ************************ Methods ***********************
	 *********************************************************/

	verifyCaseHistory(groupArray, caseRef) {
		caseDetailsPage.clickViewCaseHistory();
		const state = this.states[groupArray];

		state.forEach((status, index) => {
			let found = false;
			let expectedText = status.detail.trim().toLowerCase().replace('{caseref}', caseRef);
			cy.get('.govuk-table__body')
				.children()
				.each(($row) => {
					const rowText = $row.text().trim().toLowerCase();
					if (rowText.includes(expectedText)) {
						found = true;

						['detail', 'emailSubject', 'emailBody'].forEach((key) => {
							const expectedKey = status[key].trim().toLowerCase().replace('{caseref}', caseRef);
							expect(rowText).to.contain(expectedKey);
						});
						if (status.emailLink === 'yes') {
							cy.wrap($row)
								.find('.govuk-details__summary-text')
								.contains('View email')
								.should('exist')
								.click();
						}
					}
				})
				.then(() => {
					expect(found, `Expected at least one row to contain "${expectedText}"`).to.be.true;
				});
		});
		caseDetailsPage.clickBackLink();
	}

	verifyCaseHistoryValue(value, checkIncluded = true) {
		const expectedText = value.toLocaleLowerCase();
		cy.writeLog(`Verifying case history value: ${expectedText}`); // Log the expected text for debugging

		let found = false;
		cy.get('.govuk-table__body')
			.children()
			.each(($row) => {
				const rowText = $row.text().trim().toLowerCase();
				cy.writeLog(`Row text: ${rowText}`); // Log the row text for debugging
				if (rowText.includes(expectedText)) {
					found = true;
				}
			})
			.then(() => {
				expect(found, `Expected at least one row to contain "${expectedText}"`).to.be.true;
			});
	}

	verifyCaseHistoryValues(values) {
		values.forEach((value) => {
			this.verifyCaseHistoryValue(value);
		});
	}
}
