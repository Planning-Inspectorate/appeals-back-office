/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { HearingSection } from '../../page_objects/hearingSection';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const hearingSection = new HearingSection();

describe('Setup hearing and add hearing estimates', () => {
	let caseRef;

	const initialEstimates = { preparationTime: '0.50', sittingTime: '1.00', reportingTime: '99' };
	const updatedEstimates = { preparationTime: '5.50', sittingTime: '1.50', reportingTime: '99' };
	const finalEstimates = { preparationTime: '2', sittingTime: '3', reportingTime: '4.5' };

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		navigateToHearingSection();
	});

	it('should not accept current date with no time - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		hearingSection.setUpHearing(new Date(), ' ', ' ');

		verifyErrorMessages({
			messages: [
				'Hearing date must be in the future',
				'Hearing time must include an hour',
				'Hearing time must include a minute'
			],
			fields: ['hearing-time-hour', 'hearing-time-minute']
		});
	});

	it('should navigate back to overview page - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef} - set up hearing`);
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
	});

	it('should not accept invalid input - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		hearingSection.addHearingEstimates('0.25', 'sittingTime', '99.5');

		verifyErrorMessages({
			messages: [
				'Estimated preparation time must be in increments of 0.5',
				'Estimated sitting time must be a number',
				'Estimated reporting time must be between 0 and 99'
			],
			fields: ['preparation-time', 'sitting-time', 'reporting-time'],
			verifyInlineErrors: true
		});
	});

	it('should navigate back to overview page - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		hearingSection.addHearingEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		caseDetailsPage.validateSectionHeader('Check details and add hearing estimates');
		caseDetailsPage.clickBackLink();
		caseDetailsPage.validateSectionHeader('Hearing estimates');
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
	});

	it('should add and update hearing Estimates', () => {
		// Adding initial hearing estimates
		caseDetailsPage.clickHearingEstimateLink();
		hearingSection.addHearingEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		caseDetailsPage.validateSectionHeader('Check details and add hearing estimates');

		// Verify initial estimates were added correctly
		hearingSection.verifyHearingEstimatedValue(
			'estimated-preparation-time',
			initialEstimates.preparationTime
		);
		hearingSection.verifyHearingEstimatedValue(
			'estimated-sitting-time',
			initialEstimates.sittingTime
		);
		hearingSection.verifyHearingEstimatedValue(
			'estimated-reporting-time',
			initialEstimates.reportingTime
		);

		// Updating estimates from the check details page
		caseDetailsPage.clickRowChangeLink('estimated-preparation-time');
		hearingSection.addHearingEstimates(
			updatedEstimates.preparationTime,
			updatedEstimates.sittingTime,
			updatedEstimates.reportingTime
		);

		hearingSection.verifyHearingEstimatedValue(
			'estimated-preparation-time',
			updatedEstimates.preparationTime
		);
		hearingSection.verifyHearingEstimatedValue(
			'estimated-sitting-time',
			updatedEstimates.sittingTime
		);
		hearingSection.verifyHearingEstimatedValue(
			'estimated-reporting-time',
			updatedEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Add hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates added');

		// Updating estimates from the overview page
		caseDetailsPage.clickRowChangeLink('reporting-time');
		hearingSection.addHearingEstimates(
			finalEstimates.preparationTime,
			finalEstimates.sittingTime,
			finalEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Update hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates updated');

		// Verify final estimates were updated correctly
		hearingSection.verifyHearingEstimatedValue('preparation-time', finalEstimates.preparationTime);
		hearingSection.verifyHearingEstimatedValue('sitting-time', finalEstimates.sittingTime);
		hearingSection.verifyHearingEstimatedValue('reporting-time', finalEstimates.reportingTime);

		cy.getAppealDetails(caseRef).then((appealDetails) => {
			const hearingEstimates = appealDetails?.hearingEstimate;
			expect(hearingEstimates.preparationTime).to.eq(finalEstimates.preparationTime);
			expect(hearingEstimates.sittingTime).to.eq(finalEstimates.sittingTime);
			expect(hearingEstimates.reportingTime).to.eq(finalEstimates.reportingTime);
		});
	});

	// it('should handle missing yes/no selection', () => {
	// 	caseDetailsPage.clickHearingButton();
	// 	cy.getBusinessActualDate(new Date(), 2).then((date) => {
	// 		hearingSection.setUpHearing(date, '10', '30');
	// 	});
	//
	// 	caseDetailsPage.clickButtonByText('Continue');
	//
	// 	verifyErrorMessages({
	// 		messages: ['Select yes if you know the address of where the hearing will take place'],
	// 		fields: ['address-known']
	// 	});
	// });

	it('should not accept invalid input - Hearing Address', () => {
		caseDetailsPage.clickHearingButton();
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			hearingSection.setUpHearing(date, '10', '30');
		});

		// Handle missing yes/no selection
		caseDetailsPage.clickButtonByText('Continue');

		verifyErrorMessages({
			messages: ['Select yes if you know the address of where the hearing will take place'],
			fields: ['address-known']
		});

		hearingSection.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');

		hearingSection.addHearingLocationAddress(' ', ' ', ' ', ' ', ' ');
		verifyErrorMessages({
			messages: ['Enter address line 1', 'Enter town or city', 'Enter postcode'],
			fields: ['address-line-1', 'town', 'post-code'],
			verifyInlineErrors: true
		});

		const address1 = 'e2e Hearing Test Address'.repeat(20).substring(0, 251);
		const address2 = 'Hearing Street';
		const town = 'Hearing Town';
		const county = 'Somewhere';
		const postcode = 'BS20';
		hearingSection.addHearingLocationAddress(address1, address2, town, county, postcode);

		verifyErrorMessages({
			messages: ['Address line 1 must be 250 characters or less', 'Enter a full UK postcode'],
			fields: ['address-line-1', 'post-code'],
			verifyInlineErrors: true
		});
	});

	it.only('should set up hearing without location', () => {
		caseDetailsPage.clickHearingButton();
		const currentDate = new Date();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			hearingSection.setUpHearing(date, currentDate.getHours(), currentDate.getMinutes());
			const newDate = new Date(date);
			const formattedDate = newDate.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
			console.log(formattedDate);
			const expectedDate = { rowIndex: 0, cellIndex: 1, textToMatch: formattedDate, strict: true };
			hearingSection.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');

			listCasesPage.verifyTableCellText(expectedDate);
		});

		// caseDetailsPage.selectRadioButtonByValue('Yes');

		// const date = new Date('Thu May 22 2025 00:00:00 GMT+0100 (British Summer Time)');
		// const formattedDate = date.toLocaleDateString('en-GB', {
		// 	day: 'numeric',
		// 	month: 'long',
		// 	year: 'numeric'
		// });

		// caseDetailsPage.clickButtonByText('Set up hearing');
		// caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');

		// hearingSection.addHearingLocationAddress(' ', ' ', ' ', ' ', ' ');
		// verifyErrorMessages({
		// 	messages: ['Enter address line 1', 'Enter town or city', 'Enter postcode'],
		// 	fields: ['address-line-1', 'town', 'post-code'],
		// 	verifyInlineErrors: true
		// });
		//
		// const address1 = 'e2e Hearing Test Address'.repeat(20).substring(0, 251);
		// const address2 = 'Hearing Street';
		// const town = 'Hearing Town';
		// const county = 'Somewhere';
		// const postcode = 'BS20';
		// hearingSection.addHearingLocationAddress(address1, address2, town, county, postcode);
		//
		// verifyErrorMessages({
		// 	messages: ['Address line 1 must be 250 characters or less', 'Enter a full UK postcode'],
		// 	fields: ['address-line-1', 'post-code'],
		// 	verifyInlineErrors: true
		// });
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseRef = ref;
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'hearing');
		});
	};

	const navigateToHearingSection = () => {
		cy.clearAllSessionStorage();
		cy.clearAllCookies();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByText('Hearing');
	};

	const verifyErrorMessages = (options) => {
		options.messages.forEach((message) => {
			caseDetailsPage.checkErrorMessageDisplays(message);
		});

		options.fields.forEach((field) => {
			caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(field, 'id', field);
			if (options.verifyInlineErrors) {
				caseDetailsPage.verifyInlineErrorMessage(`${field}-error`);
			}
		});
	};
});
