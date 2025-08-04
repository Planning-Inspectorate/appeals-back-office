// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { formatDateAndTime } from '../../support/utils/formatDateAndTime';
import { urlPaths } from '../../support/urlPaths';
import { DateTimeSection } from '../../page_objects/dateTimeSection';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const currentDate = new Date();

const inquiryAddress = {
	line1: 'e2e Hearing Test Address',
	line2: 'Hearing Street',
	town: 'Hearing Town',
	county: 'Somewhere',
	postcode: 'BS20 1BS'
};

const estimatedInquiryDays = Math.floor(Math.random() * 100);

const timetableItems = [
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
let caseRef;

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W' }).then((ref) => {
		caseRef = ref;
		cy.addLpaqSubmissionToCase(caseRef);
		happyPathHelper.assignCaseOfficer(caseRef);
		caseDetailsPage.checkStatusOfCase('Validation', 0);
		happyPathHelper.reviewAppellantCase(caseRef);
		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		happyPathHelper.startS78InquiryCase(caseRef, 'inquiry');
	});
};

beforeEach(() => {
	setupTestCase();
});

it('Start case as inquiry with address and estimated days', () => {
	cy.wait(1000);
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.addInquiryAddress(inquiryAddress);
	caseDetailsPage.clickButtonByText('Continue');
	verifyDateChanges(7);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.clickButtonByText('Start case');
	caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
	caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
});

it('Start case as inquiry without address or estimated days', () => {
	cy.wait(1000);
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	verifyDateChanges(7);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.clickButtonByText('Start case');
	caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
	caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
});

const verifyDateChanges = (addedDays) => {
	const safeAddedDays = Math.max(addedDays, 1);

	// Get the future business date using Cypress task/helper
	cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
		caseDetailsPage.enterTimeTableDueDatesCaseStart(timetableItems, startDate, 7);
	});
};
