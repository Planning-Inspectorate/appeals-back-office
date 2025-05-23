// @ts-nocheck
import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';

const dateTimeSection = new DateTimeSection();
export class HearingSectionPage extends CaseDetailsPage {
	hearingSectionElements = {
		...this.elements, // Inherit parent elements
		estimatedPreparationTime: () => cy.get('#preparation-time'),
		estimatedSittingTime: () => cy.get('#sitting-time'),
		estimatedReportingTime: () => cy.get('#reporting-time'),

		address: {
			line1: () => cy.get('#address-line-1'),
			line2: () => cy.get('#address-line-2'),
			town: () => cy.get('#town'),
			county: () => cy.get('#county'),
			postcode: () => cy.get('#post-code')
		},

		hearingValues: () => cy.get('.govuk-summary-list__key'),
		changeHearing: () => cy.get('.govuk-summary-list__actions > .govuk-link').last(),
		hearingSectionHeader: () => cy.get('h1')
	};

	clickChangeHearing() {
		this.hearingSectionElements.changeHearing().click();
	}
	setUpHearing(date, hour, minute) {
		dateTimeSection.enterHearingDate(date);
		dateTimeSection.enterHearingTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	addHearingEstimates(preparationTime, sittingTime, reportingTime) {
		this.hearingSectionElements.estimatedPreparationTime().clear().type(preparationTime);
		this.hearingSectionElements.estimatedSittingTime().clear().type(sittingTime);
		this.hearingSectionElements.estimatedReportingTime().clear().type(reportingTime);
		this.clickButtonByText('Continue');
	}

	verifyHearingEstimatedValue(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.hearingSectionElements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}

	addHearingLocationAddress(address) {
		this.hearingSectionElements.address.line1().clear().type(address.line1);
		this.hearingSectionElements.address.line2().clear().type(address.line2);
		this.hearingSectionElements.address.town().clear().type(address.town);
		this.hearingSectionElements.address.county().clear().type(address.county);
		this.hearingSectionElements.address.postcode().clear().type(address.postcode);
		this.clickButtonByText('Continue');
	}

	verifyHearingValues(date, time, isAddressKnown, address = []) {
		this.hearingSectionElements.hearingValues().then(($hearingValues) => {
			const verifyLabelValue = (label, expectedValue) => {
				cy.wrap($hearingValues)
					.contains(label)
					.siblings('dd')
					.eq(0)
					.should('contain.text', expectedValue);
			};

			verifyLabelValue('Date', date);
			verifyLabelValue('Time', time);

			cy.wrap($hearingValues)
				.contains('Do you know the address')
				.siblings('dd')
				.eq(0)
				.then(($answer) => {
					const answerText = $answer.text().trim();
					const expectedAnswer = isAddressKnown ? 'Yes' : 'No';

					expect(answerText).to.equal(expectedAnswer);

					// Verify address details if known
					if (isAddressKnown) {
						cy.wrap($hearingValues).should('have.length', 4);
						address.forEach((addressLine) => {
							verifyLabelValue('Address', addressLine);
						});
					} else {
						cy.wrap($hearingValues).should('have.length', 3);
					}
				});
		});
	}

	verifyHearingHeader(sectionHeader) {
		this.hearingSectionElements.hearingSectionHeader().should('contain.text', sectionHeader);
	}
}
