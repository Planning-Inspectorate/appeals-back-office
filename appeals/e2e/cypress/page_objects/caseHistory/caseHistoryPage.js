// @ts-nocheck
import { formatCamelCaseToWords } from '../../support/utils/format.js';
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

	verifyCaseHistory(groupArray, caseRef = '', appealDetails) {
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

	verifyCaseHistoryEmail(detail, subject, appealDetails = {}) {
		let found = false;
		const expectedDetails = detail.trim().toLowerCase();
		const expectedSubject = `Subject: ${subject}`;

		cy.get('.govuk-table__body')
			.children()
			.each(($row) => {
				const rowText = $row.text().trim().toLowerCase();
				if (rowText.includes(expectedDetails)) {
					found = true;

					cy.wrap($row)
						.find('.govuk-details__summary-text')
						.contains('View email')
						.should('exist')
						.click();

					cy.wrap($row).find('.govuk-details__text').should('be.visible');

					cy.wrap($row).find('.govuk-details__text').should('contain', expectedSubject);

					// are there appeal details to check (e.g. for inquiry or hearing)
					if (appealDetails) {
						Object.keys(appealDetails).forEach((key) => {
							const appealValue = `${formatCamelCaseToWords(key)}: ${appealDetails[key]}`;
							cy.wrap($row).find('.govuk-details__text').should('contain', appealValue);
						});
					}
				}
			})
			.then(() => {
				expect(found, `Expected at least one row to contain "${expectedDetails}"`).to.be.true;
			});
	}

	verifyNumberOfCaseHistoryMessages(expectedMessage, expectedMessageCount) {
		let messageCount = 0;
		cy.get('.govuk-table__body')
			.children()
			.each(($row) => {
				const rowText = $row.text().trim().toLowerCase();
				if (rowText.includes(expectedMessage.toLowerCase())) {
					messageCount++;
				}
			})
			.then(() => {
				expect(
					messageCount,
					`Expected to find "${expectedMessageCount}" messages with ${expectedMessage}`
				).to.equal(expectedMessageCount);
			});
	}

	verifyCaseHistoryValue(value, checkIncluded = true) {
		const expectedText = value.toLocaleLowerCase();

		this.basePageElements.tableCell(value).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((t) => {
					const text = t.trim().toLocaleLowerCase();
					const assertionBase = checkIncluded ? expect(text).to : expect(text).to.not;
					const errorMessage = checkIncluded
						? `${value} is not included`
						: `${value} should not be included`;
					assertionBase.include(expectedText, errorMessage);
				});
		});
	}
}
