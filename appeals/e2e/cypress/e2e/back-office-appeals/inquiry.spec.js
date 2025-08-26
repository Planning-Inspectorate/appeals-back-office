// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage';
import { formatDateAndTime } from '../../support/utils/dateAndTime.js';
import { formatAddress } from '../../support/utils/address.js';

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
//const estimatedInquiryDays = (Math.floor(Math.random() * 199) + 1) / 2;

// generate a random whole number for estimated enquiry days from 1 - 99
const estimatedInquiryDays = Math.floor(Math.random() * 9) + 1;

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

/*it('Can update inquiry date', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inqiiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// generate new date and update it in inquiry
		cy.getBusinessActualDate(new Date(), 25).then((newInquiryDate) => {
			// change inquiry date
			inquirySectionPage.changeInquiryDate(inquiryDate, newInquiryDate);

			const { date } = formatDateAndTime(newInquiryDate);
			cy.log(`** new date - `, date);

			// check date has updated
			inquirySectionPage.verifyFieldsUpdated([
				{ field: inquirySectionPage.inquirySectionFields.date, value: date }
			]);
		});
	});
});

it('Can update inquiry time', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		inquiryDate.setHours(14);
		cy.log(`** inquiryDate - `, inquiryDate.toString());
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inqiiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// generate new date with upfdated time value and update it in inquiry
		const newInquiryDate = new Date(inquiryDate);
		newInquiryDate.setTime(inquiryDate.getTime() + 2 * 60 * 60 * 1000);

		// change inquiry date
		inquirySectionPage.changeInquiryTime(inquiryDate, newInquiryDate);

		const { time } = formatDateAndTime(newInquiryDate);
		cy.log(`** new time - `, time);

		// check date has updated
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.time, value: time }
		]);
	});
});

it('Can update inquiry estimated days when already set - using do you know link', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.changeInquiryEstimatedDays(
			newEstimatedDays,
			inquirySectionPage.inquirySectionLinks.whetherEstimatedDaysKnown
		);

		// check estimated days fields are correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowEstimatedDays, value: 'Yes' },
			{
				field: inquirySectionPage.inquirySectionFields.expectedNumberOfDays,
				value: newEstimatedDays + ' Days'
			}
		]);
	});
});

it('Can update inquiry estimated days when already set - using estimated days link', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.changeInquiryEstimatedDays(
			newEstimatedDays,
			inquirySectionPage.inquirySectionLinks.estimatedDays
		);

		// check estimated days fields are correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowEstimatedDays, value: 'Yes' },
			{
				field: inquirySectionPage.inquirySectionFields.expectedNumberOfDays,
				value: newEstimatedDays + ' Days'
			}
		]);
	});
});

it('Can update inquiry estimated days when not already set', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.changeInquiryEstimatedDays(
			newEstimatedDays,
			inquirySectionPage.inquirySectionLinks.whetherEstimatedDaysKnown,
			false
		);

		// check estimated days fields are correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowEstimatedDays, value: 'Yes' },
			{
				field: inquirySectionPage.inquirySectionFields.expectedNumberOfDays,
				value: newEstimatedDays + ' Days'
			}
		]);
	});
});

it('Can update inquiry address', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// change inquiry address
		inquirySectionPage.changeAddress(inquiryAddress);

		const expectedAddress = formatAddress(inquiryAddress);
		cy.log(`** expectedAddress - `, expectedAddress);

		// check address is correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowAddress, value: 'Yes' },
			{ field: inquirySectionPage.inquirySectionFields.address, value: expectedAddress }
		]);
	});
});*/

it('Can update answer from CYA page', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByButton('Inquiry');

		// change inquiry address
		inquirySectionPage.changeAddress(inquiryAddress);

		const expectedAddress = formatAddress(inquiryAddress);
		cy.log(`** expectedAddress - `, expectedAddress);

		// check address is correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowAddress, value: 'Yes' },
			{ field: inquirySectionPage.inquirySectionFields.address, value: expectedAddress }
		]);
	});
});

/*it('Start case as inquiry with address and estimated days', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	//caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);
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

/*it('Start case as inquiry without address or estimated days', () => {
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
});*/

/*it('Change Inquiry date from check your answers page', () => {
	cy.wait(1000);

	// setup date 
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
	
	// change inquiry date
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

	// change inquiry estimated days
	caseDetailsPage.clickChangeInquiryEstimatedDays();
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	verifyDateChanges(7);
	caseDetailsPage.clickButtonByText('Continue');
});

/*it('should not accept invalid input - inquiry Estimate', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseRef, inquiryDate);
	});

	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseRef);
	caseDetailsPage.clickAccordionByButton('Inquiry');
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
	caseDetailsPage.clickAccordionByButton('Inquiry');
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
});*/

const verifyDateChanges = (addedDays) => {
	const safeAddedDays = Math.max(addedDays, 1);

	// Get the future business date using Cypress task/helper
	cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
		caseDetailsPage.enterTimeTableDueDatesCaseStart(timetableItems, startDate, 7);
	});
};
