// @ts-nocheck

import { Page } from './basePage';
import { DateTimeSection } from './dateTimeSection.js';
import { formatDateAndTime } from '../support/utils/formatDateAndTime';
import { forEach } from 'lodash';
import { string } from 'joi';

let caseRef;
let states;
// states = {
// 	completedState: [
// 		{
// 			detail: 'Appeal decision: ' + caseRef + ' sent to agent',
// 			emailLink: 'yes',
// 			emailSubject: 'Subject: Appeal decision: ' + caseRef,
// 			emailBody: 'We have also informed the local planning authority of the decision.'
// 		},
// 		{
// 			detail: 'Appeal decision: ' + caseRef + ' sent to LPA',
// 			emailLink: 'yes',
// 			emailSubject: 'Subject: Appeal decision: ' + caseRef,
// 			emailBody: 'We have made a decision on this appeal.'
// 		},
// 		{
// 			detail: 'The case has progressed to Complete',
// 			emailLink: 'no',
// 			emailSubject: '',
// 			emailBody: ''
// 		},
// 		{ detail: 'Decision issued: Allowed', emailLink: 'no', emailSubject: '', emailBody: '' }
// 	]
// };

const dateTimeSection = new DateTimeSection();
export class CaseHistoryPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	fixturesPath = 'cypress/fixtures/';

	states = {
		completedState: [
			{
				detail: 'Appeal decision: {caseRef} sent to agent',
				emailLink: 'yes',
				emailSubject: 'Subject: Appeal decision: {caseRef}',
				emailBody: 'We have also informed the local planning authority of the decision.'
			},
			{
				detail: 'Appeal decision: {caseRef} sent to LPA',
				emailLink: 'yes',
				emailSubject: 'Subject: Appeal decision: {caseRef}',
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

	getEmailPart = (index) => {
		let text;
		cy.get('.govuk-details__text')
			.children()
			.eq(index)
			.then((e) => {
				text = e.text();
			});

		return text;
	};

	verifyCaseHistory(groupArray, caseRef) {
		const state = this.states[groupArray];
		cy.log(`** in verifyCaseHistory - state is `, JSON.stringify(state));

		state.forEach((status, index) => {
			cy.log(`** in verifyCaseHistory - state is `, JSON.stringify(status));
			//error here is 'Cannot read properties of undefined (reading 'completedState')'
			let expectedText = status.detail.trim().toLowerCase().replace('{caseref}', caseRef);
			//expectedText = new String(expectedText).replace('{caseref}', caseRef);
			//const expectedTextWithCaseRef = expectedText.replace('{caseRef}', caseRef);
			cy.log(`** in verifyCaseHistory - expectedText is `, expectedText);

			cy.log(`** in verifyCaseHistory - status.emailLink is `, status.emailLink);
			if (status.emailLink === 'yes') {
				cy.log(`** in verifyCaseHistory emailLink is yes in if block`);
				cy.get('.govuk-table__body')
					.children()
					.each(($row) => {
						const rowText = $row.text().trim().toLowerCase();
						if (rowText.includes(expectedText)) {
							cy.wrap($row).find('.govuk-details__summary-text').contains('View email').click();
						}
						$row
							.find('.govuk-details__text')
							.children()
							.each((index, $child) => {
								const rowText = $child.innerText().trim().toLowerCase();
								const expectedSubject = status.emailSubject
									.trim()
									.toLowerCase()
									.replace('{caseref}', caseRef);
								cy.log(`** in verifyCaseHistory emailDetails is `, rowText);
								cy.log(`** in verifyCaseHistory expectedSubject is `, expectedSubject);

								if (index === 0) {
									expect(rowText).to.equal(expectedSubject);
								}

								if (index === 1) {
									expect(rowText).to.contain(status.emailBody);
								}
							});
					});
			}

			/*['detail', 'emailSubject', 'emailBody'].forEach((key) => {
				this.basePageElements.tableCell(status[key]).then(($elem) => {
					cy.get('.govuk-table__body')
						.children()
						.each(($row) => {
							const rowText = $row.text().trim().toLowerCase();
							cy.log(`** in verifyCaseHistory - rowtext is `, rowText);
							if (rowText.includes(expectedText)) {
								cy.wrap($row)
									.invoke('text')
									.then((text) =>
										expect(text.trim().toLocaleLowerCase()).to.include(
											status[key].toLocaleLowerCase(),
											`${status[key]} is not included`
										)
									);
							}
						});
				});
			});*/
			// cy.get('.govuk-details__text')
			// 	.children()
			// 	.each(($row, index) => {
			// 		const rowText = $row.text().trim().toLowerCase();
			// 		const expectedSubject = status.emailSubject.trim().toLowerCase().replace('{caseref}', caseRef);
			// 		cy.log(`** in verifyCaseHistory emailDetails is `, rowText);
			// 		cy.log(`** in verifyCaseHistory expectedSubject is `, expectedSubject);

			// 		if (index === 0){
			// 			expect(rowText).to.equal(expectedSubject);
			// 		}

			// 		if (index === 1){
			// 			expect(rowText).to.contain(status.emailBody);
			// 		}
			// 	})

			//const emailParts = cy.get('.govuk-details__text').children();
			/*const subject = cy.getChildElementText('.govuk-details__text', 0) //.text().trim().toLowerCase();
			const body = cy.getChildElementText('.govuk-details__text', 1) //this.getEmailPart(1);

			cy.get('.govuk-details__text').children().eq(0)

			cy.log(`** in verifyCaseHistory subject is `, subject);
			cy.log(`** in verifyCaseHistory body is `, body);
			expect(subject).to.equal(status.emailSubject);*/
			//expect(body).to.contain(status.body);
		});
	}
}
