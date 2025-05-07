/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('Setup hearing and add hearing estimates', () => {
	let caseRef;

	const initialEstimates = { preparationTime: '0.50', sittingTime: '1', reportingTime: '99' };
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
		caseDetailsPage.setUpHearing(new Date(), ' ', ' ');

		verifyErrorMessages({
			messages: [
				'Hearing date must be in the future',
				'The time must include an hour',
				'The time must include a minute'
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
		caseDetailsPage.addHearingEstimates('0.25', 'sittingTime', '99.5');

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
		caseDetailsPage.validateSectionHeader('Hearing estimates');
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
	});

	it('should add and update hearing Estimates', () => {
		// Adding initial hearing estimates
		caseDetailsPage.clickHearingEstimateLink();
		caseDetailsPage.addHearingEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		caseDetailsPage.validateSectionHeader('Check details and add hearing estimates');

		// Verify initial estimates were added correctly
		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-preparation-time',
			initialEstimates.preparationTime
		);
		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-sitting-time',
			initialEstimates.sittingTime
		);
		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-reporting-time',
			initialEstimates.reportingTime
		);

		// Updating estimates from the check details page
		caseDetailsPage.clickRowChangeLink('estimated-preparation-time');
		caseDetailsPage.addHearingEstimates(
			updatedEstimates.preparationTime,
			updatedEstimates.sittingTime,
			updatedEstimates.reportingTime
		);

		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-preparation-time',
			updatedEstimates.preparationTime
		);
		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-sitting-time',
			updatedEstimates.sittingTime
		);
		caseDetailsPage.verifyHearingEstimatedValue(
			'estimated-reporting-time',
			updatedEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Add hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates added');

		// Updating estimates from the overview page
		caseDetailsPage.clickRowChangeLink('reporting-time');
		caseDetailsPage.addHearingEstimates(
			finalEstimates.preparationTime,
			finalEstimates.sittingTime,
			finalEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Change hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates changed');

		// Verify final estimates were updated correctly
		caseDetailsPage.verifyHearingEstimatedValue('preparation-time', finalEstimates.preparationTime);
		caseDetailsPage.verifyHearingEstimatedValue('sitting-time', finalEstimates.sittingTime);
		caseDetailsPage.verifyHearingEstimatedValue('reporting-time', finalEstimates.reportingTime);

		cy.getAppealDetails(caseRef).then((appealDetails) => {
			const hearingEstimates = appealDetails?.hearingEstimate;
			expect(hearingEstimates.preparationTime).to.eq(finalEstimates.preparationTime);
			expect(hearingEstimates.sittingTime).to.eq(finalEstimates.sittingTime);
			expect(hearingEstimates.reportingTime).to.eq(finalEstimates.reportingTime);
		});
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
