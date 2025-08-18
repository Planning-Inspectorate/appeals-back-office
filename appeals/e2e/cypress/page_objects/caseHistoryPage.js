// @ts-nocheck

import { Page } from './basePage';
import { DateTimeSection } from './dateTimeSection.js';
import { formatDateAndTime } from '../support/utils/formatDateAndTime';
import { forEach } from 'lodash';

let caseRef;
let states;
states = {
	completedState: [
		{
			detail: 'Appeal decision: ' + caseRef + ' sent to agent',
			emailLink: 'yes',
			emailSubject: 'Subject: Appeal decision: ' + caseRef,
			emailBody: 'We have also informed the local planning authority of the decision.'
		},
		{
			detail: 'Appeal decision: ' + caseRef + ' sent to LPA',
			emailLink: 'yes',
			emailSubject: 'Subject: Appeal decision: ' + caseRef,
			emailBody: 'We have made a decision on this appeal.'
		},
		{
			detail: 'The case has progressed to Complete',
			emailLink: 'no',
			emailSubject: '',
			emailBody: ''
		},
		{ detail: 'Decision issued: Allowed', emailLink: 'no', emailSubject: '', emailBody: '' }
	]
};

const dateTimeSection = new DateTimeSection();
export class CaseHistoryPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	fixturesPath = 'cypress/fixtures/';

	verifyCaseHistory(groupArray) {
		this.states[groupArray].forEach((state, index) => {
			//error here is 'Cannot read properties of undefined (reading 'completedState')'
			const expectedText = state.detail.trim().toLowerCase();

			['detail', 'emailSubject', 'emailBody'].forEach((key) => {
				this.basePageElements.tableCell(state[key]).then(($elem) => {
					cy.get('.govuk-table__body')
						.children()
						.each(($row) => {
							const rowText = $row.text().trim().toLowerCase();
							if (rowText.includes(expectedText)) {
								cy.wrap($row)
									.invoke('text')
									.then((text) =>
										expect(text.trim().toLocaleLowerCase()).to.include(
											state[key].toLocaleLowerCase(),
											`${state[key]} is not included`
										)
									);
							}
						});
				});
			});
			if (state.emailLink === 'yes') {
				cy.get('.govuk-table__body')
					.children()
					.each(($row) => {
						const rowText = $row.text().trim().toLowerCase();
						if (rowText.includes(expectedText)) {
							cy.wrap($row).find('.govuk-details__summary-text').contains('View Email').click();
						}
					});
			}
		});
	}
}
