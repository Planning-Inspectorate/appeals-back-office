/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage';
import { formatDateAndTime } from '../../support/utils/formatDateAndTime';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const hearingSectionPage = new HearingSectionPage();
const currentDate = new Date();

describe('Setup hearing and add hearing estimates', () => {
	let caseRef;

	const initialEstimates = { preparationTime: '0.50', sittingTime: '1.00', reportingTime: '99' };
	const updatedEstimates = { preparationTime: '5.50', sittingTime: '1.50', reportingTime: '99' };
	const finalEstimates = { preparationTime: '2', sittingTime: '3', reportingTime: '4.5' };

	const originalAddress = {
		line1: 'e2e Hearing Test Address',
		line2: 'Hearing Street',
		town: 'Hearing Town',
		county: 'Somewhere',
		postcode: 'BS20 1BS'
	};

	const headers = {
		hearingEstimate: {
			checkDetails: 'Check details and add hearing estimates',
			estimateForm: 'Hearing estimates'
		},
		hearing: {
			checkDetails: 'Check details and set up hearing',
			addressQuestion: 'Do you know the address of where the hearing will take place?',
			addressForm: 'Address',
			dateTime: 'Date and time',
			confirmHearingCancellation: 'Confirm that you want to cancel the hearing'
		}
	};

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		navigateToHearingSection();
	});

	it('should not accept current date with no time - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		hearingSectionPage.setUpHearing(new Date(), ' ', ' ');

		verifyErrorMessages({
			messages: [
				'The hearing date must be in the future',
				'Hearing time must include an hour',
				'Hearing time must include a minute'
			],
			fields: ['hearing-time-hour', 'hearing-time-minute']
		});
	});

	it('should not accept invalid input - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		hearingSectionPage.addHearingEstimates('0.25', 'sittingTime', '99.5');

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
		hearingSectionPage.addHearingEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.checkDetails);
		caseDetailsPage.clickBackLink();
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.estimateForm);
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
		caseDetailsPage.verifyHearingEstimateSectionIsDisplayed();
	});

	it('should add and update hearing Estimates', () => {
		// Adding initial hearing estimates
		caseDetailsPage.clickHearingEstimateLink();
		hearingSectionPage.addHearingEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.checkDetails);

		// Verify initial estimates were added correctly
		verifyHearingEstimate('estimated-preparation-time', initialEstimates.preparationTime);
		verifyHearingEstimate('estimated-sitting-time', initialEstimates.sittingTime);
		verifyHearingEstimate('estimated-reporting-time', initialEstimates.reportingTime);

		// Updating estimates from the check details page
		caseDetailsPage.clickRowChangeLink('estimated-preparation-time');
		hearingSectionPage.addHearingEstimates(
			updatedEstimates.preparationTime,
			updatedEstimates.sittingTime,
			updatedEstimates.reportingTime
		);

		verifyHearingEstimate('estimated-preparation-time', updatedEstimates.preparationTime);
		verifyHearingEstimate('estimated-sitting-time', updatedEstimates.sittingTime);
		verifyHearingEstimate('estimated-reporting-time', updatedEstimates.reportingTime);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Add hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates added');

		// Updating estimates from the overview page
		caseDetailsPage.clickRowChangeLink('reporting-time');
		hearingSectionPage.addHearingEstimates(
			finalEstimates.preparationTime,
			finalEstimates.sittingTime,
			finalEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Update hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates updated');

		// Verify final estimates were updated correctly
		verifyHearingEstimate('preparation-time', finalEstimates.preparationTime);
		verifyHearingEstimate('sitting-time', finalEstimates.sittingTime);
		verifyHearingEstimate('reporting-time', finalEstimates.reportingTime);

		cy.loadAppealDetails(caseRef).then((appealDetails) => {
			const hearingEstimates = appealDetails?.hearingEstimate;
			expect(hearingEstimates.preparationTime).to.eq(finalEstimates.preparationTime);
			expect(hearingEstimates.sittingTime).to.eq(finalEstimates.sittingTime);
			expect(hearingEstimates.reportingTime).to.eq(finalEstimates.reportingTime);
		});
	});

	it('should not accept invalid input - Hearing Address', () => {
		caseDetailsPage.clickHearingButton();
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			hearingSectionPage.setUpHearing(date, '10', '30');
		});

		// Handle missing yes/no selection
		caseDetailsPage.clickButtonByText('Continue');

		verifyErrorMessages({
			messages: ['Select yes if you know the address of where the hearing will take place'],
			fields: ['address-known']
		});

		hearingSectionPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');

		const emptyAddress = {
			line1: ' ',
			line2: ' ',
			town: ' ',
			county: ' ',
			postcode: ' '
		};

		hearingSectionPage.addHearingLocationAddress(emptyAddress);
		verifyErrorMessages({
			messages: ['Enter address line 1', 'Enter town or city', 'Enter postcode'],
			fields: ['address-line-1', 'town', 'post-code'],
			verifyInlineErrors: true
		});

		const invalidAddress = {
			...originalAddress,
			line1: 'e2e Hearing Test Address'.repeat(20).substring(0, 251),
			postcode: 'BS20'
		};

		hearingSectionPage.addHearingLocationAddress(invalidAddress);

		verifyErrorMessages({
			messages: ['Address line 1 must be 250 characters or less', 'Enter a full UK postcode'],
			fields: ['address-line-1', 'post-code'],
			verifyInlineErrors: true
		});
	});

	it('should navigate back through hearing setup workflow', () => {
		// Initialize Hearing
		caseDetailsPage.clickHearingButton();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());

			// Test back navigation from initial setup (no address)
			hearingSectionPage.setUpHearing(date, date.getHours(), date.getMinutes());
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');

			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.addressQuestion);

			// Test back navigation with address flow
			hearingSectionPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');

			hearingSectionPage.addHearingLocationAddress(originalAddress);

			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			hearingSectionPage.clickChangeHearing();
			hearingSectionPage.verifyHearingHeader(headers.hearing.addressForm);

			// Verify full back navigation chain
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.addressQuestion);
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.dateTime);
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		});
	});

	it('should set up hearing with address changes', () => {
		const updatedAddress = {
			...originalAddress,
			line1: 'e2e Hearing Test Address - New Address',
			postcode: 'SW1A 2AA'
		};

		// Initialise Hearing
		caseDetailsPage.clickHearingButton();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			// Set exact time and format for assertions
			date.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
			const expectedDateTime = formatDateAndTime(date);
			const getTimeUpToMinutes = (isoString) => isoString.slice(0, 16);

			// Set Up Initial Hearing (No Address)
			hearingSectionPage.setUpHearing(date, date.getHours(), date.getMinutes());
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
			hearingSectionPage.verifyHearingValues('address-known', 'No');

			// Add Initial Address
			hearingSectionPage.clickChangeHearing();
			hearingSectionPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			hearingSectionPage.addHearingLocationAddress(originalAddress);
			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
			hearingSectionPage.verifyHearingValues(
				'address-details',
				'Yes',
				true,
				Object.values(originalAddress)
			);

			// Update Address
			hearingSectionPage.clickChangeHearing();
			hearingSectionPage.addHearingLocationAddress(updatedAddress);
			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
			hearingSectionPage.verifyHearingValues(
				'address-details',
				'Yes',
				true,
				Object.values(updatedAddress)
			);

			// Finalise and Validate
			caseDetailsPage.clickButtonByText('Set up hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');

			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const hearing = appealDetails?.hearing;

				expect(hearing.hearingId).to.be.a('number');
				expect(hearing.addressId).to.be.a('number');
				expect(getTimeUpToMinutes(hearing.hearingStartTime)).to.equal(
					getTimeUpToMinutes(date.toISOString())
				);

				const actualAddress = hearing.address;
				expect(actualAddress).to.deep.include({
					addressLine1: updatedAddress.line1,
					addressLine2: updatedAddress.line2,
					town: updatedAddress.town,
					county: updatedAddress.county,
					postcode: updatedAddress.postcode
				});
			});
		});
	});

	it('should update existing hearing address from overview page', () => {
		// First ensure a hearing exists with a known address
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
			ensureHearingExists(caseRef, date).then((appealDetails) => {});
			cy.reload();

			// Now proceed with the test
			const expectedDateTime = formatDateAndTime(date);
			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);

			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const hearingAddress = appealDetails.hearing.address;
				const expectedAddress = [
					hearingAddress.addressLine1,
					hearingAddress.addressLine2,
					hearingAddress.county,
					hearingAddress.postcode,
					hearingAddress.town
				];
				hearingSectionPage.verifyHearingValues('address', 'Yes', true, expectedAddress);
			});

			caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
			hearingSectionPage.verifyHearingValues('whether-the-address-is-known-or-not', 'No');

			// Remove Address
			caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

			hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
			hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
			hearingSectionPage.verifyHearingValues('whether-the-address-is-known-or-not', 'No');

			// Add address
			caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
			hearingSectionPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			// Update Address
			const updatedAddress = {
				...originalAddress,
				line1: 'e2e Hearing Test Address - Overview Page',
				postcode: 'SW1A 2AA'
			};
			hearingSectionPage.addHearingLocationAddress(updatedAddress);
		});
	});

	it('should cancel hearing', () => {
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
			ensureHearingExists(caseRef, date).then((appealDetails) => {});
			cy.reload();
			caseDetailsPage.clickCancelHearing();
			hearingSectionPage.clickKeepHearing();

			// try to cancel
			caseDetailsPage.clickCancelHearing();
			hearingSectionPage.verifyHearingHeader(headers.hearing.confirmHearingCancellation);
			hearingSectionPage.clickCancelHearing();

			caseDetailsPage.validateBannerMessage('Success', 'Hearing cancelled');
			caseDetailsPage.verifyHearingSectionIsDisplayed();
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

	const verifyHearingEstimate = (fieldName, expectedValue) => {
		hearingSectionPage.verifyHearingEstimatedValue(fieldName, expectedValue);
	};

	const ensureHearingExists = (caseRef, date) => {
		return cy.loadAppealDetails(caseRef).then((appealDetails) => {
			if (appealDetails.hearing === undefined) {
				cy.addHearingDetails(caseRef, date).then((hearingDetails) => {
					expect(hearingDetails.hearingStartTime).to.be.eq(date.toISOString());
					expect(hearingDetails.hearingEndTime).to.be.eq(date.toISOString());
					return cy.addHearingDetails(caseRef, date);
				});
			}
		});
	};
});
