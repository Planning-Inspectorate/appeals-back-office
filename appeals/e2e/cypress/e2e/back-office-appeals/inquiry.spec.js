// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const listCasesPage = new ListCasesPage();
const inquirySectionPage = new InquirySectionPage();

const inquiryAddress = {
	line1: 'e2e Inquiry Test Address',
	line2: 'Inquiry Street',
	town: 'Inquiry Town',
	county: 'Somewhere',
	postcode: 'BS20 1BS'
};

const initialEstimates = { preparationTime: 0.5, sittingTime: 1.0, reportingTime: 89.5 };
const updatedEstimates = { preparationTime: 5.5, sittingTime: 1.5, reportingTime: 99 };

const headers = {
	inquiryEstimate: {
		checkDetails: 'Check details and add inquiry estimates',
		estimateForm: 'Inquiry estimates'
	}
};

//generate a number between 0.5 & 99.5
const estimatedInquiryDays = (Math.floor(Math.random() * 199) + 1) / 2;

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
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
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

	// Verify timetable row
	const timeTableRows = [
		'Valid date',
		'Start date',
		'LPA questionnaire due',
		'LPA statement due',
		'Interested party comments due',
		'Statement of common ground due',
		'Planning obligation due',
		'Proof of evidence and witness due',
		'Inquiry'
	];
	caseDetailsPage.verifyTimeTableRows(timeTableRows);

	// Verify order of sections
	const expectedSections = [
		'Overview',
		'Timetable',
		'Inquiry',
		'Documentation',
		'Costs',
		'Contacts',
		'Team',
		'Case management'
	];
	caseDetailsPage.verifyCaseDetailsSection(expectedSections);
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

it('Change Inquiry date from check your answers page', () => {
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
	caseDetailsPage.clickChangeInquiryDate();
	cy.getBusinessActualDate(new Date(), 25).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	verifyDateChanges(7);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.clickChangeInquiryEstimatedDays();
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	verifyDateChanges(7);
	caseDetailsPage.clickButtonByText('Continue');
});

it('should not accept invalid input - inquiry Estimate', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);
	});

	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseRef);
	caseDetailsPage.clickInquiryEstimateLink();

	// Test empty fields
	caseDetailsPage.addEstimates(' ', ' ', ' ');
	caseDetailsPage.verifyErrorMessages({
		messages: [
			'Enter estimated preparation time',
			'Enter estimated sitting',
			'Enter estimated reporting time'
		],
		fields: ['preparation-time', 'sitting-time', 'reporting-time'],
		verifyInlineErrors: true
	});

	// Test invalid values
	caseDetailsPage.addEstimates('0.25', 'sittingTime', '99.5');
	caseDetailsPage.verifyErrorMessages({
		messages: [
			'Estimated preparation time must be in increments of 0.5',
			'Estimated sitting time must be a number',
			'Estimated reporting time must be between 0 and 99'
		],
		fields: ['preparation-time', 'sitting-time', 'reporting-time'],
		verifyInlineErrors: true
	});
});

it('should add inquiry Estimates', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);
	});

	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseRef);
	caseDetailsPage.clickInquiryEstimateLink();

	// Add initial estimates and verify
	caseDetailsPage.addEstimates(
		initialEstimates.preparationTime,
		initialEstimates.sittingTime,
		initialEstimates.reportingTime
	);
	inquirySectionPage.verifyInquiryHeader(headers.inquiryEstimate.checkDetails);

	// Verify initial estimates on check details page
	['preparation', 'sitting', 'reporting'].forEach((type) => {
		inquirySectionPage.verifyInquiryEstimate(
			`estimated-${type}-time`,
			initialEstimates[`${type}Time`]
		);
	});

	// Update estimates and verify changes
	caseDetailsPage.clickRowChangeLink('estimated-preparation-time');
	caseDetailsPage.addEstimates(
		updatedEstimates.preparationTime,
		updatedEstimates.sittingTime,
		updatedEstimates.reportingTime
	);

	['preparation', 'sitting', 'reporting'].forEach((type) => {
		inquirySectionPage.verifyInquiryEstimate(
			`estimated-${type}-time`,
			updatedEstimates[`${type}Time`]
		);
	});

	// Submit and verify successful addition
	caseDetailsPage.clickButtonByText('Add inquiry estimates');
	caseDetailsPage.validateBannerMessage('Success', 'Inquiry estimates added');

	// Verify final estimates in UI and API response
	['preparation', 'sitting', 'reporting'].forEach((type) => {
		inquirySectionPage.verifyInquiryEstimate(`${type}-time`, updatedEstimates[`${type}Time`]);
	});

	cy.loadAppealDetails(caseRef).then((appealDetails) => {
		const { preparationTime, sittingTime, reportingTime } = appealDetails?.inquiryEstimate || {};
		expect(preparationTime).to.eq(updatedEstimates.preparationTime);
		expect(sittingTime).to.eq(updatedEstimates.sittingTime);
		expect(reportingTime).to.eq(updatedEstimates.reportingTime);
	});
});

const verifyDateChanges = (addedDays) => {
	const safeAddedDays = Math.max(addedDays, 1);

	// Get the future business date using Cypress task/helper
	cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
		caseDetailsPage.enterTimeTableDueDatesCaseStart(timetableItems, startDate, 7);
	});
};
