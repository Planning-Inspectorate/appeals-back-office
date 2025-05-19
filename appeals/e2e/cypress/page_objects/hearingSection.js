// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage';
import { DateTimeSection } from './dateTimeSection.js';

const dateTimeSection = new DateTimeSection();
export class HearingSection extends CaseDetailsPage {
	elements = {
		...this.elements, // Inherit parent elements
		// Time Estimation Fields
		estimatedPreparationTime: () => cy.get('#preparation-time'),
		estimatedSittingTime: () => cy.get('#sitting-time'),
		estimatedReportingTime: () => cy.get('#reporting-time'),

		// Address Radio Buttons
		isAddressKnown: () => cy.get('input[name="addressKnown"]'),

		// Address Fields
		address: {
			line1: () => cy.get('#address-line-1'),
			line2: () => cy.get('#address-line-2'),
			town: () => cy.get('#town'),
			county: () => cy.get('#county'),
			postcode: () => cy.get('#post-code')
		}
	};

	setUpHearing(date, hour, minute) {
		dateTimeSection.enterHearingDate(date);
		dateTimeSection.enterHearingTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	addHearingEstimates(preparationTime, sittingTime, reportingTime) {
		this.elements.estimatedPreparationTime().clear().type(preparationTime);
		this.elements.estimatedSittingTime().clear().type(sittingTime);
		this.elements.estimatedReportingTime().clear().type(reportingTime);
		this.clickButtonByText('Continue');
	}

	verifyHearingEstimatedValue(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.elements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}

	isHearingAddressKnown(answer, verifyInitialState = false) {
		const addressKnownRadioButtons = this.elements.isAddressKnown();

		if (verifyInitialState) {
			addressKnownRadioButtons.should('not.be.checked');
		}

		addressKnownRadioButtons.check(answer.toLowerCase()).should('be.checked');
	}

	addHearingLocationAddress(addressLine1, addressLine2, town, county, postcode) {
		this.elements.address.line1().clear().type(addressLine1);
		this.elements.address.line2().clear().type(addressLine2);
		this.elements.address.town().clear().type(town);
		this.elements.address.county().clear().type(county);
		this.elements.address.postcode().clear().type(postcode);
		this.clickButtonByText('Continue');
	}
}
