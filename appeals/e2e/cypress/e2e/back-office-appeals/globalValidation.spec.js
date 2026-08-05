// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { FileDetailsPage } from '../../page_objects/fileDetailsPage.js';
import {
	ERROR_MESSAGES,
	invalidFileNameVariants,
	validFileNameVariants
} from '../../support/consts.js';
import { happyPathHelper } from '../../support/happyPathHelper';
import { getDateAndTimeValues } from '../../support/utils/format.js';

const caseDetailsPage = new CaseDetailsPage();
const inquirySectionPage = new InquirySectionPage();
const fileDetailsPage = new FileDetailsPage();

let caseObj;
let appeal;

const setupTestCaseForDateAndTimeValidation = () => {
	cy.login(users.appeals.caseAdmin);

	cy.createCase({ caseType: 'W' }).then((refObj) => {
		caseObj = refObj;
		appeal = caseObj;
		cy.addLpaqSubmissionToCase(caseObj);
		happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'READY_TO_START', 'S78', 'INQUIRY');
		happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');
	});
};

const setupTestCaseForFileNameValidation = (startWithSelectFilename = false) => {
	cy.createCase().then((caseObj) => {
		appeal = caseObj;
		happyPathHelper.uploadDocAppellantCase(caseObj);
		caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();

		// Simulate the completion of the documents scan
		cy.simulateDocumentsScanComplete(caseObj);

		caseDetailsPage.clickLinkByText('View and edit');

		if (startWithSelectFilename) {
			fileDetailsPage.changeFileName();
		}
	});
};

describe('Date and Time Validation', { testIsolation: false }, () => {
	// global setup and cleanup as are using same case across date and time tests
	before(() => {
		setupTestCaseForDateAndTimeValidation();
	});
	beforeEach(() => {
		inquirySectionPage.clearInquiryDateAndTime();
	});
	after(() => {
		cy.deleteAppeals(appeal);
	});

	it('All fields are blank', () => {
		inquirySectionPage.setUpInquiry('', '', '', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Enter the inquiry date'],
			fields: ['inquiry-date-day']
		});
	});

	it('Only day entered - month and year are blank', () => {
		inquirySectionPage.setUpInquiry('08', '', '', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a month and a year'],
			fields: ['inquiry-date-month']
		});
	});

	it('Only month entered - day and year are blank', () => {
		inquirySectionPage.setUpInquiry('', '08', '', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a day and a year'],
			fields: ['inquiry-date-day']
		});
	});

	it('Only year entered - day and month are blank', () => {
		inquirySectionPage.setUpInquiry('', '', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a day and a month'],
			fields: ['inquiry-date-day']
		});
	});

	it('Day and month entered - year is blank', () => {
		inquirySectionPage.setUpInquiry('08', '08', '', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a year'],
			fields: ['inquiry-date-year']
		});
	});

	it('Year and day entered - month is blank', () => {
		inquirySectionPage.setUpInquiry('08', '', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a month'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month and year entered - day is blank', () => {
		inquirySectionPage.setUpInquiry('', '08', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must include a day'],
			fields: ['inquiry-date-day']
		});
	});

	it('Year has too few digits', () => {
		inquirySectionPage.setUpInquiry('08', '08', '202', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date year must be 4 digits'],
			fields: ['inquiry-date-year']
		});
	});

	it('Day has too many digits', () => {
		inquirySectionPage.setUpInquiry('808', '08', '202', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be 1 or 2 digits'],
			fields: ['inquiry-date-day']
		});
	});

	it('Month has too many digits', () => {
		inquirySectionPage.setUpInquiry('08', '808', '202', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date month must be 1 or 2 digits'],
			fields: ['inquiry-date-month']
		});
	});

	it('Year has too many digits', () => {
		inquirySectionPage.setUpInquiry('08', '08', '20258', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date year must be 4 digits'],
			fields: ['inquiry-date-year']
		});
	});

	it('Day is not in valid range - < 1', () => {
		inquirySectionPage.setUpInquiry('0', '08', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be between 1 and 31'],
			fields: ['inquiry-date-day']
		});
	});

	it('Day is not in valid range - > 31', () => {
		inquirySectionPage.setUpInquiry('32', '08', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be between 1 and 31'],
			fields: ['inquiry-date-day']
		});
	});

	it('Month is not in valid range - < 1', () => {
		inquirySectionPage.setUpInquiry('08', '0', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date month must be between 1 and 12'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month is not in valid range - > 12', () => {
		inquirySectionPage.setUpInquiry('08', '18', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date month must be between 1 and 12'],
			fields: ['inquiry-date-month']
		});
	});

	it('Day contains invalid characters - alphabetical', () => {
		inquirySectionPage.setUpInquiry('abc', '18', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be a number'],
			fields: ['inquiry-date-day']
		});
	});

	it('Day contains invalid characters - symbolic characters', () => {
		inquirySectionPage.setUpInquiry('%^&', '18', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be a number'],
			fields: ['inquiry-date-day']
		});
	});

	it('Day contains invalid characters - aplhanumeric', () => {
		inquirySectionPage.setUpInquiry('abc123', '18', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date day must be a number'],
			fields: ['inquiry-date-day']
		});
	});

	it('Month contains invalid characters - alphabetical', () => {
		inquirySectionPage.setUpInquiry('08', 'abc', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must be a real date'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month contains invalid characters - symbolic characters', () => {
		inquirySectionPage.setUpInquiry('08', '%^&', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must be a real date'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month contains invalid characters - aplhanumeric', () => {
		inquirySectionPage.setUpInquiry('08', 'abc123', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date must be a real date'],
			fields: ['inquiry-date-month']
		});
	});

	it('Year contains invalid characters - alphabetical', () => {
		inquirySectionPage.setUpInquiry('08', '08', 'abc', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date year must be a number'],
			fields: ['inquiry-date-year']
		});
	});

	it('Year contains invalid characters - symbolic characters', () => {
		inquirySectionPage.setUpInquiry('08', '08', '%^&', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date year must be a number'],
			fields: ['inquiry-date-year']
		});
	});

	it('Year contains invalid characters - aplhanumeric', () => {
		inquirySectionPage.setUpInquiry('08', '08', 'abc123', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date year must be a number'],
			fields: ['inquiry-date-year']
		});
	});

	it('Date is in the past', () => {
		inquirySectionPage.setUpInquiry('08', '08', '2024', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['The inquiry date must be in the future'],
			fields: ['inquiry-date-day']
		});
	});

	it('All fields are blank', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'',
				''
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Enter the inquiry time'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Hour is blank', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'',
				'30'
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Inquiry time must include an hour'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Minute is blank', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'23',
				''
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Inquiry time must include a minute'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Hour is outside upper range', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'24',
				'30'
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Inquiry time hour must be 23 or less'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Minute is outside upper range', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'23',
				'60'
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Inquiry time minute must be 59 or less'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Hour contains invalid characters', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'abc',
				'30'
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Enter a inquiry time using numbers 0 to 9'],
				fields: ['inquiry-time-hour']
			});
		});
	});

	it('Minute contains invalid characters', () => {
		// make sure date part is valid
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			const dateTimeValues = getDateAndTimeValues(inquiryDate);

			inquirySectionPage.setUpInquiry(
				dateTimeValues.day,
				dateTimeValues.month,
				dateTimeValues.year,
				'23',
				'abc'
			);

			inquirySectionPage.verifyErrorMessages({
				messages: ['Enter a inquiry time using numbers 0 to 9'],
				fields: ['inquiry-time-hour']
			});
		});
	});
});

describe('Rename file with valid name', { testIsolation: false }, () => {
	before(() => {
		setupTestCaseForFileNameValidation();
	});
	after(() => {
		cy.deleteAppeals(appeal);
	});

	validFileNameVariants.forEach((fileVariant) => {
		it(`can rename a file with valid name: ${fileVariant.type}`, () => {
			fileDetailsPage.changeFileName();
			fileDetailsPage.enterFileName(fileVariant.name);
			fileDetailsPage.clickButtonByText('Confirm');
			fileDetailsPage.confirmFileRenamed(fileVariant.name);
		});
	});
});

describe('Rename file with invalid name', { testIsolation: false }, () => {
	before(() => {
		setupTestCaseForFileNameValidation(true);
	});
	after(() => {
		cy.deleteAppeals(appeal);
	});

	invalidFileNameVariants.forEach((invalidFileVariant) => {
		it(`cannot rename a file with invalid name: ${invalidFileVariant.type}`, () => {
			fileDetailsPage.enterFileName(invalidFileVariant.name);
			fileDetailsPage.clickButtonByText('Confirm');
			fileDetailsPage.verifyErrorMessages({
				messages: [ERROR_MESSAGES.invalidFileName],
				fields: ['file-name']
			});
		});
	});
});
