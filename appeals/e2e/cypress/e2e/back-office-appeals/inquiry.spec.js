// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { ContactsSectionPage } from '../../page_objects/caseDetails/contactsSectionPage.js';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ContactDetailsPage } from '../../page_objects/contactDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';
import { formatDateAndTime, formatObjectAsString } from '../../support/utils/format.js';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const listCasesPage = new ListCasesPage();
const inquirySectionPage = new InquirySectionPage();
const overviewSectionPage = new OverviewSectionPage();
const cyaSection = new CYASection();
const documentationSectionPage = new DocumentationSectionPage();
const contactsSectionPage = new ContactsSectionPage();
const contactDetailsPage = new ContactDetailsPage();
const currentDate = new Date();

const previousInquiryAddress = {
	line1: '1 Grove Cottage',
	line2: 'Shotesham Road',
	town: 'Woodton',
	county: 'Devon',
	postcode: 'NR35 2ND'
};

const inquiryAddress = {
	line1: 'e2e Inquiry Test Address',
	line2: 'Inquiry Street',
	town: 'Inquiry Town',
	county: 'Somewhere',
	postcode: 'BS20 1BS'
};

const rule6Details = {
	partyName: 'TestRule6Party',
	partyEmailAddress: 'testrule6party@test.com',
	partyNameUpdated: 'TestRule6PartyUpdated',
	partyEmailAddressUpdated: 'testrule6partyupdated@test.com'
};

const initialEstimates = { preparationTime: 0.5, sittingTime: 1.0, reportingTime: 89.5 };
const updatedEstimates = { preparationTime: 5.5, sittingTime: 1.5, reportingTime: 99 };

const headers = {
	inquiryEstimate: {
		checkDetails: 'Check details and add inquiry estimates',
		estimateForm: 'Inquiry estimates'
	}
};

// generate a random whole number for estimated enquiry days from 1 - 99
const estimatedInquiryDays = Math.floor(Math.random() * 99) + 1;

const safeAddedDays = 7;

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

const overviewDetails = {
	appealType: 'Planning appeal',
	applicationReference: '123',
	appealProcedure: 'Inquiry',
	allocationLevel: 'No allocation level for this appeal',
	linkedAppeals: 'No linked appeals',
	relatedAppeals: '1000000',
	netGainResidential: 'Not provided'
};

const expectedCaseDetailsSections = [
	'Overview',
	'Timetable',
	'Inquiry',
	'Documentation',
	'Costs',
	'Contacts',
	'Team',
	'Case management'
];

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

let caseObj;

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		caseObj = ref;
		appeal = caseObj;
		happyPathHelper.viewCaseDetails(caseObj);

		// Assign Case Officer Via API
		cy.assignCaseOfficerViaApi(caseObj);

		// Validate Appeal Via API
		cy.getBusinessActualDate(new Date(), 0).then((date) => {
			cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
		});

		cy.reload();

		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');
		dateTimeSection.clearInquiryDateAndTime();
	});
};
beforeEach(() => {
	setupTestCase();
});

let appeal;

afterEach(() => {
	cy.deleteAppeals(appeal);
});

it('Can start case as inquiry with address and estimated days', () => {
	cy.addLpaqSubmissionToCase(caseObj);
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
		dateTimeSection.enterInquiryTime('12', '00');
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);

	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('Yes');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.addInquiryAddress(inquiryAddress);
	caseDetailsPage.clickButtonByText('Continue');

	// enter timetable dates
	cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
		inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
	});

	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.clickButtonByText('Start case');
	caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
	caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

	// Verify timetable rows
	caseDetailsPage.verifyTimeTableRows(timeTableRows);
	// Verify order of sections
	caseDetailsPage.verifyCaseDetailsSection(expectedCaseDetailsSections);
	//review and accept lpaq
	happyPathHelper.reviewS78Lpaq(caseObj);

	// verify case overview details
	overviewSectionPage.verifyCaseOverviewDetails(overviewDetails);
});

it('Can start case as inquiry without address or estimated days', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
		dateTimeSection.enterInquiryTime('12', '00');
	});
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.selectRadioButtonByValue('No');
	caseDetailsPage.clickButtonByText('Continue');

	// enter timetable dates
	cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
		inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
	});

	caseDetailsPage.clickButtonByText('Continue');
	caseDetailsPage.clickButtonByText('Start case');
	caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
	caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
});

it('Displays error if inquiry estimated days not entered', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
		dateTimeSection.enterInquiryTime('12', '00');
	});
	caseDetailsPage.clickButtonByText('Continue');
	inquirySectionPage.selectEstimatedDaysOption('Yes');
	inquirySectionPage.clearEstimatedDays();
	caseDetailsPage.clickButtonByText('Continue');

	// verify error message
	inquirySectionPage.verifyErrorMessages({
		messages: ['Enter the expected number of days to carry out the inquiry'],
		fields: ['inquiry-estimation-days']
	});
});

it('Displays error if invalid input entered for inquiry estimated days', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		dateTimeSection.enterInquiryDate(inquiryDate);
		dateTimeSection.enterInquiryTime('12', '00');
	});
	caseDetailsPage.clickButtonByText('Continue');
	inquirySectionPage.selectEstimatedDaysOption('Yes');
	inquirySectionPage.enterEstimatedDays('abc');
	caseDetailsPage.clickButtonByText('Continue');

	// verify error message
	inquirySectionPage.verifyErrorMessages({
		messages: ['Enter the number of days using numbers 0 to 99'],
		fields: ['inquiry-estimation-days']
	});
});

it('Can update inquiry date', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		inquiryDate.setHours(14);
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// generate new date and update it in inquiry
		cy.getBusinessActualDate(new Date(), 25).then((newInquiryDate) => {
			// change inquiry date
			inquirySectionPage.clickChangeLink(inquirySectionPage.inquirySectionLinks.date);
			inquirySectionPage.changeInquiryDate(inquiryDate, newInquiryDate);

			inquirySectionPage.updateInquiry();

			const { date } = formatDateAndTime(newInquiryDate);
			cy.log(`** new date - `, date);

			// check success banner
			caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

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
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// generate new date with updated time value and update it in inquiry
		const newInquiryDate = new Date(inquiryDate);
		newInquiryDate.setTime(inquiryDate.getTime() + 2 * 60 * 60 * 1000);

		// change inquiry time
		inquirySectionPage.clickChangeLink(inquirySectionPage.inquirySectionLinks.time);
		inquirySectionPage.changeInquiryTime(inquiryDate, newInquiryDate);

		inquirySectionPage.updateInquiry();

		const { time } = formatDateAndTime(newInquiryDate);

		// check success banner
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

		// check date has updated
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.time, value: time }
		]);
	});
});

it('Can update inquiry estimated days when already set - using do you know link', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.clickChangeLink(
			inquirySectionPage.inquirySectionLinks.whetherEstimatedDaysKnown
		);
		inquirySectionPage.changeInquiryEstimatedDays(newEstimatedDays, '5');

		inquirySectionPage.updateInquiry();

		// check success banner
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

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
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.clickChangeLink(inquirySectionPage.inquirySectionLinks.estimatedDays);
		inquirySectionPage.changeInquiryEstimatedDays(newEstimatedDays, '5');

		inquirySectionPage.updateInquiry();

		// check success banner
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

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
		// setting estimate days to '0' has effect of 'No' in inquiry UI
		cy.addInquiryViaApi(caseObj, inquiryDate, { estimatedDays: '0' });

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// change inquiry estimated days
		const newEstimatedDays = estimatedInquiryDays;
		cy.log(`** newEstimatedDays - `, newEstimatedDays);
		inquirySectionPage.clickChangeLink(
			inquirySectionPage.inquirySectionLinks.whetherEstimatedDaysKnown
		);
		inquirySectionPage.changeInquiryEstimatedDays(newEstimatedDays);

		inquirySectionPage.updateInquiry();

		// check success banner
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

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
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// change inquiry address
		inquirySectionPage.clickChangeLink(inquirySectionPage.inquirySectionLinks.address);
		inquirySectionPage.changeAddress(inquiryAddress, previousInquiryAddress, true);
		inquirySectionPage.updateInquiry();

		const expectedAddress = formatObjectAsString(inquiryAddress, '\n');

		// check success banner
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');

		// check address is correct
		inquirySectionPage.verifyFieldsUpdated([
			{ field: inquirySectionPage.inquirySectionFields.doKnowAddress, value: 'Yes' },
			{ field: inquirySectionPage.inquirySectionFields.address, value: expectedAddress }
		]);
	});
});

it('Can update answer from CYA page - change address', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// change inquiry address to reach cya page
		const newAddress = {
			...inquiryAddress,
			line1: 'A new address line 1'
		};
		inquirySectionPage.clickChangeLink(inquirySectionPage.inquirySectionLinks.address);
		inquirySectionPage.changeAddress(previousInquiryAddress, previousInquiryAddress, true);

		// edit address from cya page
		cyaSection.selectChangeAnswer('inquiry-address');
		inquirySectionPage.changeAddress(newAddress, previousInquiryAddress);

		const expectedAddress = formatObjectAsString(newAddress);

		// check address is correct
		cyaSection.verifyAnswerUpdated({
			field: cyaSection.cyaSectionFields.address,
			value: expectedAddress
		});
	});
});

it('Can add rule 6 party', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// select to add rule 6 contact
		contactsSectionPage.selectAddContact('rule-6-party-contact-details');

		// check page caption and input party name
		contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
		contactDetailsPage.inputOrganisationName(rule6Details.partyName);
		contactDetailsPage.clickButtonByText('Continue');

		// check page caption and enter party email address
		contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
		contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddress);
		contactDetailsPage.clickButtonByText('Continue');

		// verify details on cya page
		cyaSection.verifyAnswerUpdated({
			field: cyaSection.cyaSectionFields.rule6PartyName,
			value: rule6Details.partyName
		});
		cyaSection.verifyAnswerUpdated({
			field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
			value: rule6Details.partyEmailAddress
		});

		// update party name
		cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyName);
		contactDetailsPage.verifyValuePrepopulated(
			contactDetailsPage.contactSelectors.organisationName,
			rule6Details.partyName
		);
		contactDetailsPage.inputOrganisationName(rule6Details.partyNameUpdated);
		contactDetailsPage.clickButtonByText('Continue');
		contactDetailsPage.clickButtonByText('Continue');

		// verify party name updated on cya page
		cyaSection.verifyAnswerUpdated({
			field: cyaSection.cyaSectionFields.rule6PartyName,
			value: rule6Details.partyNameUpdated
		});

		// update party email
		cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyEmailAddress);
		contactDetailsPage.verifyValuePrepopulated(
			contactDetailsPage.contactSelectors.organisationEmail,
			rule6Details.partyEmailAddress
		);
		contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddressUpdated);
		contactDetailsPage.clickButtonByText('Continue');

		// verify party email address updated on cya page
		cyaSection.verifyAnswerUpdated({
			field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
			value: rule6Details.partyEmailAddressUpdated
		});
	});
});

it('Validates rule 6 party name and email address', () => {
	// Setup: Add inquiry via API
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseObj, inquiryDate);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		// select to add rule 6 contact
		contactsSectionPage.selectAddContact('rule-6-party-contact-details');

		// proceeed without entering name
		contactDetailsPage.clickButtonByText('Continue');

		// check erorr messge displayed
		contactDetailsPage.verifyErrorMessages({
			messages: ['Enter a name'],
			fields: ['organisation-name']
		});

		// proceed without entering party email address
		contactDetailsPage.inputOrganisationName(rule6Details.partyName);
		contactDetailsPage.clickButtonByText('Continue');
		contactDetailsPage.clickButtonByText('Continue');

		// check erorr messge displayed
		contactDetailsPage.verifyErrorMessages({
			messages: ['Enter an email address'],
			fields: ['email']
		});
	});
});

it('should not accept invalid input - inquiry Estimate', () => {
	cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
		cy.addInquiryViaApi(caseObj, inquiryDate);
	});

	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseObj);
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
		cy.addInquiryViaApi(caseObj, inquiryDate);
	});

	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseObj);
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

	cy.loadAppealDetails(caseObj).then((appealDetails) => {
		const { preparationTime, sittingTime, reportingTime } = appealDetails?.inquiryEstimate || {};
		expect(preparationTime).to.eq(updatedEstimates.preparationTime);
		expect(sittingTime).to.eq(updatedEstimates.sittingTime);
		expect(reportingTime).to.eq(updatedEstimates.reportingTime);
	});
});

it('should update inquiry timetable dates from case details page', () => {
	inquirySectionPage.setupTimetableDates().then(({ currentDate, ...timeTable }) => {
		// Setup initial timetable
		cy.addInquiryViaApi(caseObj, currentDate, timeTable);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		const timetableItemsWithNewSelector = timetableItems.map((item) => ({
			...item,
			row: item.row.replace('statement-due-date', 'lpa-statement-due-date')
		}));

		inquirySectionPage.verifyInquiryTimetableRowChangeLinkVisible(timetableItemsWithNewSelector);

		caseDetailsPage.clickRowChangeLink('lpa-questionnaire-due-date');

		// update timetable dates
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			inquirySectionPage.enterTimetableDueDates(timetableItemsWithNewSelector, startDate, 7);
		});

		// Submit changes
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Update timetable due dates');

		// Verify results
		caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');

		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			const timetable = appealDetails?.appealTimetable;
			inquirySectionPage.verifyFieldsUpdated([
				{ field: 'Valid date', value: formatDateAndTime(new Date(appealDetails.validAt)).date },
				{ field: 'Start date', value: formatDateAndTime(new Date(appealDetails.startedAt)).date },
				{
					field: 'LPA questionnaire due',
					value: formatDateAndTime(new Date(timetable.lpaQuestionnaireDueDate)).date
				},
				{
					field: 'LPA statement due',
					value: formatDateAndTime(new Date(timetable.lpaStatementDueDate)).date
				},
				{
					field: 'Interested party comments due',
					value: formatDateAndTime(new Date(timetable.ipCommentsDueDate)).date
				},
				{
					field: 'Statement of common ground due',
					value: formatDateAndTime(new Date(timetable.statementOfCommonGroundDueDate)).date
				},
				{
					field: 'Planning obligation due',
					value: formatDateAndTime(new Date(timetable.planningObligationDueDate)).date
				},
				{
					field: 'Proof of evidence and witness due',
					value: formatDateAndTime(new Date(timetable.proofOfEvidenceAndWitnessesDueDate)).date
				}
			]);
		});
	});
});

it('should validate inquiry timetable chronology', () => {
	inquirySectionPage.setupTimetableDates().then(({ currentDate, ...timeTable }) => {
		// Setup initial timetable
		cy.addInquiryViaApi(caseObj, currentDate, timeTable);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		const timetableItemsWithNewSelector = timetableItems.map((item) => ({
			...item,
			row: item.row.replace('statement-due-date', 'lpa-statement-due-date')
		}));

		caseDetailsPage.clickRowChangeLink('lpa-questionnaire-due-date');

		// update timetable dates
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((timeTableDate) => {
			inquirySectionPage.enterTimetableDueDates(timetableItemsWithNewSelector, timeTableDate, 0);

			// Submit changes
			caseDetailsPage.clickButtonByText('Continue');
			const formatDate = formatDateAndTime(timeTableDate).date;

			// verify error message
			inquirySectionPage.verifyErrorMessages({
				messages: [
					`Statements due date must be after the LPA questionnaire due date on ${formatDate}`,
					`Interested party comments due date must be after the LPA questionnaire due date on ${formatDate}`,
					`Proof of evidence and witnesses due date must be after the Interested party comments due date on ${formatDate}`
				],
				fields: [
					'lpa-statement-due-date-day',
					'ip-comments-due-date-day',
					'proof-of-evidence-and-witnesses-due-date-day'
				]
			});
		});
	});
});

it('should show business day validation errors for all timetable fields', () => {
	inquirySectionPage.setupTimetableDates().then(({ currentDate, ...timeTable }) => {
		// Setup initial timetable
		cy.addInquiryViaApi(caseObj, currentDate, timeTable);

		// find case and open inquiry section
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);

		const timetableItemsWithNewSelector = timetableItems.map((item) => ({
			...item,
			row: item.row.replace('statement-due-date', 'lpa-statement-due-date')
		}));

		caseDetailsPage.clickRowChangeLink('lpa-questionnaire-due-date');

		// update timetable dates
		const nextYear = new Date().getFullYear() + 2;
		const nonBusinessDate = new Date(nextYear, 0, 1);
		inquirySectionPage.changeTimetableDates(timetableItemsWithNewSelector, nonBusinessDate, 0);

		// Submit changes
		caseDetailsPage.clickButtonByText('Continue');
		const formatDate = formatDateAndTime(nonBusinessDate).date;

		// verify error message
		inquirySectionPage.verifyErrorMessages({
			messages: [
				'The lpa questionnaire due date must be a business day',
				'The statements due date must be a business day',
				'The interested party comments due date must be a business day',
				'The statement of common ground due date must be a business day',
				'The planning obligation due date must be a business day',
				'The proof of evidence and witnesses due date must be a business day'
			],
			fields: [
				'lpa-statement-due-date-day',
				'lpa-statement-due-date-day',
				'ip-comments-due-date-day',
				'statement-of-common-ground-due-date-day',
				'planning-obligation-due-date-day',
				'proof-of-evidence-and-witnesses-due-date-day'
			]
		});
	});
});

it('should accept LPA POE for inquiry', () => {
	inquirySectionPage.setupTimetableDates().then(({ currentDate, ...timeTable }) => {
		// Set up inquiry case with LPA questionnaire
		cy.addInquiryViaApi(caseObj, currentDate, timeTable);
		cy.addLpaqSubmissionToCase(caseObj);

		// Navigate to case details and verify initial state
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
		cy.reload();

		// Process LPAQ review and move to statements phase
		happyPathHelper.reviewS78Lpaq(caseObj);
		caseDetailsPage.checkStatusOfCase('Statements', 0);

		// Submit third-party representations
		happyPathHelper.addThirdPartyComment(caseObj, true);
		caseDetailsPage.clickBackLink();
		happyPathHelper.addThirdPartyComment(caseObj, false);
		caseDetailsPage.clickBackLink();

		// Complete LPA statement and advance past deadline
		happyPathHelper.addLpaStatement(caseObj);
		cy.simulateStatementsDeadlineElapsed(caseObj);
		cy.reload();

		// Finalise statements and transition to evidence stage
		caseDetailsPage.basePageElements.bannerLink().click();
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.checkStatusOfCase('Evidence', 0);

		// Process LPA proof of evidence submission (FO) via Api
		inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'lpaProofOfEvidence');

		// TODO: verify review banner is displayed Bug: A2-4859

		// Complete the evidence review workflow
		documentationSectionPage.navigateToAddProofOfEvidenceReview('lpa-proofs-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept LPA proof of evidence and witnesses');

		// Verify successful acceptance
		caseDetailsPage.validateBannerMessage(
			'Success',
			'LPA proof of evidence and witnesses accepted'
		);
	});
});

it('should display the correct status tags when removing inquiry address', () => {
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		// Set up a new case
		caseObj = ref;
		appeal = caseObj;
		cy.addLpaqSubmissionToCase(caseObj);
		happyPathHelper.assignCaseOfficer(caseObj);
		caseDetailsPage.checkStatusOfCase('Validation', 0);
		happyPathHelper.reviewAppellantCase(caseObj);
		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');

		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			dateTimeSection.enterInquiryDate(inquiryDate);
			dateTimeSection.enterInquiryTime('12', '00');
		});
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.addInquiryAddress(inquiryAddress);
		caseDetailsPage.clickButtonByText('Continue');

		// enter timetable dates
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
		});

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Start case');
		caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
		caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

		happyPathHelper.reviewLPaStatement(caseObj);

		// Verify evidence tag
		caseDetailsPage.checkStatusOfCase('Evidence', 0);

		// Process LPA proof of evidence submission (FO) via Api
		inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'lpaProofOfEvidence');

		// Complete the evidence review workflow
		documentationSectionPage.navigateToAddProofOfEvidenceReview('lpa-proofs-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept LPA proof of evidence and witnesses');

		// Verify successful acceptance
		caseDetailsPage.validateBannerMessage(
			'Success',
			'LPA proof of evidence and witnesses accepted'
		);

		// Process appellant proof of evidence submission (FO) via Api
		inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'appellantProofOfEvidence');

		// Complete the evidence review workflow
		documentationSectionPage.navigateToAddProofOfEvidenceReview('appellant-proofs-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept appellant proof of evidence and witnesses');

		// Verify successful acceptance
		caseDetailsPage.validateBannerMessage(
			'Success',
			'Appellant proof of evidence and witnesses accepted'
		);

		cy.get('a:contains("Progress to inquiry")').click();
		caseDetailsPage.clickButtonByText('Share proof of evidence and witnesses');
		caseDetailsPage.validateBannerMessage('Success', 'Progressed to inquiry');

		// Verify Awaiting inquiry tag - all cases page
		cy.visit(urlPaths.appealsList);
		inquirySectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Awaiting inquiry');

		// navigate to details page
		caseDetailsPage.clickLinkByText(caseObj.reference);

		caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
		inquirySectionPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Update inquiry');
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry updated');
		caseDetailsPage.validateBannerMessage('Important', 'Add inquiry address');

		// Verify Inquiry ready to set up tag - all cases page
		cy.visit(urlPaths.appealsList);
		inquirySectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Inquiry ready to set up');

		// Verify Inquiry ready to set up tag - personal list page
		cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
		inquirySectionPage.verifyTagOnPersonalListPage(caseObj.reference, 'Inquiry ready to set up');
	});
});

it('should display the correct status tags when cancelling inquiry', () => {
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		// Set up a new case
		caseObj = ref;
		appeal = caseObj;
		cy.addLpaqSubmissionToCase(caseObj);
		happyPathHelper.assignCaseOfficer(caseObj);
		caseDetailsPage.checkStatusOfCase('Validation', 0);
		happyPathHelper.reviewAppellantCase(caseObj);
		caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');

		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			dateTimeSection.enterInquiryDate(inquiryDate);
			dateTimeSection.enterInquiryTime('12', '00');
		});
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.inputEstimatedInquiryDays(estimatedInquiryDays);

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.addInquiryAddress(inquiryAddress);
		caseDetailsPage.clickButtonByText('Continue');

		// enter timetable dates
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
		});

		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Start case');
		caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
		caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

		happyPathHelper.reviewLPaStatement(caseObj);

		// Verify evidence tag
		caseDetailsPage.checkStatusOfCase('Evidence', 0);

		// Process LPA proof of evidence submission (FO) via Api
		inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'lpaProofOfEvidence');

		// Complete the evidence review workflow
		documentationSectionPage.navigateToAddProofOfEvidenceReview('lpa-proofs-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept LPA proof of evidence and witnesses');

		// Verify successful acceptance
		caseDetailsPage.validateBannerMessage(
			'Success',
			'LPA proof of evidence and witnesses accepted'
		);

		// Process appellant proof of evidence submission (FO) via Api
		inquirySectionPage.addProofOfEvidenceViaApi(caseObj, 'appellantProofOfEvidence');

		// Complete the evidence review workflow
		documentationSectionPage.navigateToAddProofOfEvidenceReview('appellant-proofs-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept appellant proof of evidence and witnesses');

		// Verify successful acceptance
		caseDetailsPage.validateBannerMessage(
			'Success',
			'Appellant proof of evidence and witnesses accepted'
		);

		cy.get('a:contains("Progress to inquiry")').click();
		caseDetailsPage.clickButtonByText('Share proof of evidence and witnesses');
		caseDetailsPage.validateBannerMessage('Success', 'Progressed to inquiry');

		// Verify Awaiting inquiry tag - all cases page
		cy.visit(urlPaths.appealsList);
		inquirySectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Awaiting inquiry');

		// navigate to details page
		caseDetailsPage.clickLinkByText(caseObj.reference);

		caseDetailsPage.clickLinkByText('Cancel inquiry');
		caseDetailsPage.clickButtonByText('Cancel inquiry');
		caseDetailsPage.validateBannerMessage('Success', 'Inquiry cancelled');
		caseDetailsPage.validateBannerMessage('Important', 'Set up inquiry');

		// Verify Inquiry ready to set up tag - all cases page
		cy.visit(urlPaths.appealsList);
		inquirySectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Inquiry ready to set up');

		// Verify Inquiry ready to set up tag - personal list page
		cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
		inquirySectionPage.verifyTagOnPersonalListPage(caseObj.reference, 'Inquiry ready to set up');
	});
});
