// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage.js';

const caseDetailsPage = new CaseDetailsPage();
const inquirySectionPage = new InquirySectionPage();

let caseRef;

const createTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W' }).then((ref) => {
		caseRef = ref;
		cy.addLpaqSubmissionToCase(caseRef);
	});
};

const setupTestCase = () => {
	happyPathHelper.assignCaseOfficer(caseRef);
	caseDetailsPage.checkStatusOfCase('Validation', 0);
	happyPathHelper.reviewAppellantCase(caseRef);
	caseDetailsPage.checkStatusOfCase('Ready to start', 0);
	happyPathHelper.startS78InquiryCase(caseRef, 'inquiry');
};

describe('Date Validation', () => {
	before(() => {
		createTestCase();
	});

	beforeEach(() => {
		setupTestCase();
		inquirySectionPage.clearInquiryDateAndTime();
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

	it('Day contains invalid characters - empty space', () => {
		inquirySectionPage.setUpInquiry(' ', '18', '2025', '10', '00');

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
			messages: ['Inquiry date month must be a number'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month contains invalid characters - symbolic characters', () => {
		inquirySectionPage.setUpInquiry('08', '%^&', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date month must be a number'],
			fields: ['inquiry-date-month']
		});
	});

	it('Month contains invalid characters - aplhanumeric', () => {
		inquirySectionPage.setUpInquiry('08', 'abc123', '2025', '10', '00');

		inquirySectionPage.verifyErrorMessages({
			messages: ['Inquiry date month must be a number'],
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
});
