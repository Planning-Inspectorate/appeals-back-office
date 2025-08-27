// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { getDateAndTimeValues } from '../../support/utils/dateAndTime.js';
import { EstimatedDaysSection } from '../estimatedDaysSection.js';
import { AddressSection } from '../addressSection.js';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const estimatedDaysSection = new EstimatedDaysSection();
const addressSection = new AddressSection();

export class InquirySectionPage extends CaseDetailsPage {
	timetableItems = [
		{
			row: 'lpa-questionnaire-due-date',
			editable: true
		},
		{
			row: 'statement-due-date',
			editable: true
		},
		{
			row: 'ip-comments-due-date',
			editable: true
		},
		{
			row: 'statement-of-common-ground-due-date',
			editable: true
		},
		{
			row: 'proof-of-evidence-and-witnesses-due-date',
			editable: true
		},
		{
			row: 'planning-obligation-due-date',
			editable: true
		}
	];

	inquirySectionFields = {
		date: 'Date',
		time: 'Time',
		doKnowEstimatedDays:
			'Do you know the estimated number of days needed to carry out the inquiry?',
		expectedNumberOfDays: 'Estimated number of days needed to carry out inquiry',
		doKnowAddress: 'Do you know the address of where the inquiry will take place?',
		address: 'Address'
	};

	inquirySectionLinks = {
		date: 'date',
		time: 'time',
		whetherEstimatedDaysKnown: 'whether-the-estimated-number-of-days-is-known-or-not',
		estimatedDays: 'estimated-days',
		address: 'whether-the-address-is-known-or-not'
	};

	inquirySectionElements = {
		...this.elements // Inherit parent elements
	};

	clearInquiryDateAndTime() {
		dateTimeSection.clearInquiryDateAndTime();
	}

	setUpInquiry(day, month, year, hour, minute) {
		dateTimeSection.setInquiryDate(day, month, year);
		dateTimeSection.enterInquiryTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	verifyInquiryHeader(sectionHeader) {
		this.elements.pageHeading().should('contain.text', sectionHeader);
	}

	changeInquiryDate(date, newDate) {
		this.clickRowChangeLink(this.inquirySectionLinks.date);
		cy.wait(5000);

		this.verifyPreviousDateAndTmePrepopulated(date);

		dateTimeSection.enterInquiryDate(newDate);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		//this.verifyDateChanges(7);

		caseDetailsPage.clickButtonByText('Update Inquiry');
	}

	changeInquiryTime(date, newDate) {
		this.clickRowChangeLink(this.inquirySectionLinks.time);

		this.verifyPreviousDateAndTmePrepopulated(date);

		dateTimeSection.enterInquiryTime(newDate.getHours(), newDate.getMinutes());

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		//this.verifyDateChanges(7);

		caseDetailsPage.clickButtonByText('Update Inquiry');
	}

	changeInquiryEstimatedDays(days, changeLink, currentDaysKnown = true) {
		// are potentially two different links that can choose from to update estimated days
		this.clickRowChangeLink(changeLink);

		//this.verifyPreviousDateAndTmePrepopulated(date);

		// if current days not yet known need to select 'yes' first to enter estimated days
		if (!currentDaysKnown) {
			estimatedDaysSection.selectEstimatedDaysOption('Yes');
		}

		estimatedDaysSection.enterEstimatedInquiryDays(days);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');

		caseDetailsPage.clickButtonByText('Update Inquiry');
	}

	changeAddress(address) {
		this.clickRowChangeLink(this.inquirySectionLinks.address);
		caseDetailsPage.clickButtonByText('Continue');

		// enter new address
		addressSection.enterAddress(address);

		caseDetailsPage.clickButtonByText('Continue');
		//caseDetailsPage.clickButtonByText('Update Inquiry');
	}

	verifyFieldsUpdated(fieldValues) {
		fieldValues.forEach((fieldValue) =>
			this.checkCorrectAnswerDisplays(fieldValue.field, fieldValue.value)
		);
	}

	verifyPreviousDateAndTmePrepopulated(date) {
		cy.log(`** in verifyPreviousDateAndTmePrepopulated`);
		const dateandTimeFromForm = dateTimeSection.getDateAndTime('inquiry');
		const dateAndTimeFromPrevious = getDateAndTimeValues(date);

		cy.log(`** previous date - `, JSON.stringify(dateAndTimeFromPrevious));
		cy.log(`** date from form - `, JSON.stringify(dateandTimeFromForm));

		//expect(dateandTimeFromForm).equals(dateAndTimeFromPrevious).to.be.true();
	}

	verifyInquiryEstimate(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.inquirySectionElements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}

	verifyDateChanges = (addedDays) => {
		const safeAddedDays = Math.max(addedDays, 1);

		// Get the future business date using Cypress task/helper
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			caseDetailsPage.enterTimeTableDueDatesCaseStart(this.timetableItems, startDate, 7);
		});
	};
}
