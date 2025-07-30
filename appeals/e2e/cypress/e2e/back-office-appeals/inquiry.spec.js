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

let inquiryDate = (new Date(), 28);

const getRandomNum = () => Math.floor(Math.random() * 100);

const timetableItems = [
	{
		row: 'lpa-questionnaire-due-date',
		editable: true
	},
	{
		row: 'lpa-statement-due-date',
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
	dateTimeSection.enterInquiryDate(inquiryDate);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.inputEstimatedInquiryDays(getRandomNum);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.addInquiryAddress(inquiryAddress);
	caseDetailsPage.clickButtonByText('Continue');
	dateTimeSection.caseDetailsPage.clickButtonByText('Continue');
});
