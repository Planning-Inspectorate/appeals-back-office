// @ts-nocheck

import { getDateAndTimeValues } from '../../support/utils/format.js';
import { AddressSection } from '../addressSection.js';
import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { EstimatedDaysSection } from '../estimatedDaysSection.js';

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

	clearEstimatedDays() {
		estimatedDaysSection.clearEstimatedDays();
	}

	enterEstimatedDays(estimatedDays) {
		estimatedDaysSection.enterEstimatedInquiryDays(estimatedDays);
	}

	selectEstimatedDaysOption(option) {
		estimatedDaysSection.selectEstimatedDaysOption(option);
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
		cy.wait(5000);

		// verify previous values are prepopulated
		const dateAndTimeFromPrevious = getDateAndTimeValues(date);
		dateTimeSection.verifyPrepopulatedInquiryValues(dateAndTimeFromPrevious);

		dateTimeSection.enterInquiryDate(newDate);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
	}

	changeInquiryTime(date, newDate) {
		// verify previous values are prepopulated
		const dateAndTimeFromPrevious = getDateAndTimeValues(date);
		dateTimeSection.verifyPrepopulatedInquiryValues(dateAndTimeFromPrevious);

		dateTimeSection.enterInquiryTime(newDate.getHours(), newDate.getMinutes());

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
	}

	changeInquiryEstimatedDays(days, previousDays = 0) {
		const hasPreviousDays = previousDays > 0;

		// if a previous value was set check that is prepopulated
		if (hasPreviousDays) {
			estimatedDaysSection.verifyPrepopulatedValue(previousDays);
		}

		// if current days not yet set need to select 'yes' first to enter estimated days
		if (!hasPreviousDays) {
			estimatedDaysSection.selectEstimatedDaysOption('Yes');
		}

		estimatedDaysSection.enterEstimatedInquiryDays(days);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
	}

	changeAddress(address, previousAddress, doYouKnow = false) {
		// if required pass through do you know address screen
		if (doYouKnow) {
			caseDetailsPage.clickButtonByText('Continue');
		}

		// verify that previous address is populated
		addressSection.verifyPrepopulatedValues(previousAddress);

		// enter new address
		addressSection.enterAddress(address);

		caseDetailsPage.clickButtonByText('Continue');
	}

	verifyFieldsUpdated(fieldValues) {
		fieldValues.forEach((fieldValue) =>
			this.checkCorrectAnswerDisplays(fieldValue.field, fieldValue.value)
		);
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

	enterTimetableDueDates(timetableItems, startDate) {
		caseDetailsPage.enterTimeTableDueDatesCaseStart(timetableItems, startDate, 7);
	}

	clickChangeLink(link) {
		this.clickRowChangeLink(link);
	}

	updateInquiry() {
		caseDetailsPage.clickButtonByText('Update Inquiry');
	}
}
