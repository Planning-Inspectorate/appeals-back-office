// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage';
import { formatDateAndTime } from '../../support/utils/formatDateAndTime';
import { urlPaths } from '../../support/urlPaths';

const caseDetailsPage = new CaseDetailsPage();
const hearingSectionPage = new HearingSectionPage();
const currentDate = new Date();

describe('Setup hearing and add hearing estimates', () => {
	let caseRef;

	const initialEstimates = { preparationTime: 0.5, sittingTime: 1.0, reportingTime: 99 };
	const updatedEstimates = { preparationTime: 5.5, sittingTime: 1.5, reportingTime: 99 };
	const finalEstimates = { preparationTime: 2, sittingTime: 3, reportingTime: 4.5 };

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

	const timeTableRows = [
		'Valid date',
		'Start date',
		'LPA questionnaire due',
		'LPA statement due',
		'Interested party comments due',
		'Statement of common ground due',
		'Planning obligation due',
		'Hearing date'
	];

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		hearingSectionPage.navigateToHearingSection(caseRef);
	});

	it('should not accept current date with no time - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		hearingSectionPage.setUpHearing(new Date(), ' ', ' ');

		hearingSectionPage.verifyErrorMessages({
			messages: ['Enter the hearing time', 'The hearing date must be in the future'],
			fields: ['hearing-time-hour', 'hearing-date-day']
		});
	});

	it('should not accept invalid input - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		hearingSectionPage.addEstimates('0.25', 'sittingTime', '99.5');

		hearingSectionPage.verifyErrorMessages({
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
		hearingSectionPage.addEstimates(
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
		hearingSectionPage.addEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.checkDetails);

		// Verify initial estimates were added correctly
		hearingSectionPage.verifyHearingEstimate(
			'estimated-preparation-time',
			initialEstimates.preparationTime
		);
		hearingSectionPage.verifyHearingEstimate(
			'estimated-sitting-time',
			initialEstimates.sittingTime
		);
		hearingSectionPage.verifyHearingEstimate(
			'estimated-reporting-time',
			initialEstimates.reportingTime
		);

		// Updating estimates from the check details page
		caseDetailsPage.clickRowChangeLink('estimated-preparation-time');
		hearingSectionPage.addEstimates(
			updatedEstimates.preparationTime,
			updatedEstimates.sittingTime,
			updatedEstimates.reportingTime
		);

		hearingSectionPage.verifyHearingEstimate(
			'estimated-preparation-time',
			updatedEstimates.preparationTime
		);
		hearingSectionPage.verifyHearingEstimate(
			'estimated-sitting-time',
			updatedEstimates.sittingTime
		);
		hearingSectionPage.verifyHearingEstimate(
			'estimated-reporting-time',
			updatedEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Add hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates added');

		// Updating estimates from the overview page
		caseDetailsPage.clickRowChangeLink('reporting-time');
		hearingSectionPage.addEstimates(
			finalEstimates.preparationTime,
			finalEstimates.sittingTime,
			finalEstimates.reportingTime
		);

		// Submit the estimates
		caseDetailsPage.clickButtonByText('Update hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates updated');

		// Verify final estimates were updated correctly
		hearingSectionPage.verifyHearingEstimate('preparation-time', finalEstimates.preparationTime);
		hearingSectionPage.verifyHearingEstimate('sitting-time', finalEstimates.sittingTime);
		hearingSectionPage.verifyHearingEstimate('reporting-time', finalEstimates.reportingTime);

		cy.loadAppealDetails(caseRef).then((appealDetails) => {
			const hearingEstimates = appealDetails?.hearingEstimate;
			expect(hearingEstimates.preparationTime).to.eq(finalEstimates.preparationTime);
			expect(hearingEstimates.sittingTime).to.eq(finalEstimates.sittingTime);
			expect(hearingEstimates.reportingTime).to.eq(finalEstimates.reportingTime);
		});

		hearingSectionPage.verifyCaseHistory(['Hearing estimates added', 'Hearing estimates updated']);
	});

	it('should not accept invalid input - Hearing Address', () => {
		caseDetailsPage.clickHearingButton();
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			hearingSectionPage.setUpHearing(date, '10', '30');
		});

		// Handle missing yes/no selection
		caseDetailsPage.clickButtonByText('Continue');

		hearingSectionPage.verifyErrorMessages({
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
		hearingSectionPage.verifyErrorMessages({
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

		hearingSectionPage.verifyErrorMessages({
			messages: ['Address line 1 must be 250 characters or less', 'Enter a full UK postcode'],
			fields: ['address-line-1', 'post-code'],
			verifyInlineErrors: true
		});
	});

	it('should navigate back through hearing setup workflow', () => {
		// Initialize Hearing
		caseDetailsPage.clickHearingButton();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes());

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
			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.addressForm);
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.addressQuestion);
			caseDetailsPage.clickBackLink();
			hearingSectionPage.verifyHearingHeader(headers.hearing.dateTime);
			caseDetailsPage.clickBackLink();
			caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		});
	});

	// Verify you see "You cannot check these answers"
	it('should not allow re-setup of hearing if already submitted', () => {
		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes());
			caseDetailsPage.clickButtonByText('Set up hearing');
			hearingSectionPage.setUpHearing(date, '10', '30');
			hearingSectionPage.selectRadioButtonByValue('No');
			hearingSectionPage.clickButtonByText('Continue');
			hearingSectionPage.clickButtonByText('Set up hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');
			cy.go('back');
			hearingSectionPage.verifyYouCannotCheckTheseAnswersPage();
		});
	});

	it('should set up hearing with address changes', () => {
		hearingSectionPage.deleteHearingIfExists(caseRef);
		const updatedAddress = {
			...originalAddress,
			line1: 'e2e Hearing Test Address - New Address',
			postcode: 'SW1A 2AA'
		};

		// Initialise Hearing
		cy.navigateToAppealDetailsPage(caseRef);
		caseDetailsPage.clickHearingButton();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			// Set exact time and format for assertions
			date.setHours(currentDate.getHours(), currentDate.getMinutes());
			const expectedDateTime = formatDateAndTime(date);

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

			// validate hearing object
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const hearing = appealDetails?.hearing;

				expect(hearing.hearingId).to.be.a('number');
				expect(hearing.addressId).to.be.a('number');

				expect(hearingSectionPage.getTimeUpToMinutes(new Date(hearing.hearingStartTime))).to.equal(
					hearingSectionPage.getTimeUpToMinutes(date)
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

	it('should update existing hearing address and date from overview page', () => {
		// First ensure a hearing exists with a known address
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes());
			hearingSectionPage.ensureHearingExists(caseRef, date);
			cy.reload();

			//Now proceed with the test
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

			caseDetailsPage.clickRowChangeLink('date');
			const newHearingDate = new Date(date.getFullYear() + 1, 0, 1);
			hearingSectionPage.setUpHearing(newHearingDate, date.getHours(), date.getMinutes());
			caseDetailsPage.clickButtonByText('Continue');

			// Update Address and Date
			const updatedAddress = {
				...originalAddress,
				line1: 'e2e Hearing Test Address - Overview Page',
				postcode: 'SW1A 2AA'
			};
			hearingSectionPage.addHearingLocationAddress(updatedAddress);
			caseDetailsPage.clickButtonByText('Update hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

			// Remove Address
			caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

			const expectedUpdatedAddress = `Hearing address updated to ${updatedAddress.line1}, ${updatedAddress.line2}, ${updatedAddress.town}, ${updatedAddress.county}, ${updatedAddress.postcode}`;
			hearingSectionPage.verifyCaseHistory([
				expectedUpdatedAddress,
				`Hearing date updated to ${formatDateAndTime(newHearingDate).date}`
			]);
		});

		//Notify
		const expectedNotifies = [
			{
				template: 'appeal-valid-start-case-s78-appellant',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-s78-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'hearing-set-up',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-set-up',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'hearing-updated',
				recipient: 'appellant@test.com'
			}
		];

		cy.checkNotifySent(caseRef, expectedNotifies);
	});

	it('should cancel hearing', () => {
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes());
			hearingSectionPage.ensureHearingExists(caseRef, date);
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

		hearingSectionPage.verifyCaseHistory(['Hearing cancelled']);

		// Notify
		const expectedNotifies = [
			{
				template: 'hearing-cancelled',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-cancelled',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		];

		cy.checkNotifySent(caseRef, expectedNotifies);
	});

	it('should verify the timetable behaviour', () => {
		hearingSectionPage.deleteHearingIfExists(caseRef);
		caseDetailsPage.clickAccordionByButton('TimeTable');

		// Initial verification without planning obligation
		caseDetailsPage.elements
			.setUpTimetableHearingDate()
			.parent('dd')
			.siblings('dd')
			.should('contain.text', 'Not set up');
		const rowsWithNoObligationPlanning = timeTableRows.filter(
			(item) => item !== 'Planning obligation due'
		);
		caseDetailsPage.verifyTimeTableRows(rowsWithNoObligationPlanning);

		// Add planning obligation
		cy.updateAppealDetails(caseRef, { planningObligation: true });
		cy.getBusinessActualDate(currentDate, 1).then((date) => {
			cy.updateTimeTableDetails(caseRef, { planningObligationDueDate: date });
		});

		// Setup and verify hearing
		caseDetailsPage.clickSetUpTimetableHearingDate();
		cy.getBusinessActualDate(currentDate, 2).then((hearingDate) => {
			hearingDate.setHours(currentDate.getHours(), currentDate.getMinutes());
			hearingSectionPage.setUpHearing(
				hearingDate,
				hearingDate.getHours(),
				hearingDate.getMinutes()
			);

			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			hearingSectionPage.addHearingLocationAddress(originalAddress);
			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			caseDetailsPage.clickButtonByText('Set up hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');

			const expectedDate = `${formatDateAndTime(hearingDate).time} on ${
				formatDateAndTime(hearingDate).date
			}`;
			caseDetailsPage.elements
				.rowChangeLink('timetable-hearing-date')
				.parent('dd')
				.siblings('dd')
				.should('be.visible')
				.and('contain.text', expectedDate);
		});

		// Final timetable verification
		caseDetailsPage.verifyTimeTableRows(timeTableRows);

		//Notify
		const expectedNotifies = [
			{
				template: 'hearing-set-up',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-set-up',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		];

		cy.checkNotifySent(caseRef, expectedNotifies);
	});

	it('should progress hearing case to decision', () => {
		hearingSectionPage.deleteHearingIfExists(caseRef);
		happyPathHelper.reviewLPaStatement(caseRef);

		// Verify Hearing ready to set up tag - all cases page
		cy.visit(urlPaths.allCases);
		hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Hearing ready to set up');

		// Verify Hearing ready to set up tag - personal list page
		cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
		hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Hearing ready to set up');

		// navigate to details page
		caseDetailsPage.clickLinkByText(caseRef);

		// add hearing via banner
		caseDetailsPage.clickHearingBannerLink();

		cy.getBusinessActualDate(currentDate, 2).then((hearingDate) => {
			hearingDate.setHours(currentDate.getHours(), currentDate.getMinutes());
			hearingSectionPage.setUpHearing(
				hearingDate,
				hearingDate.getHours(),
				hearingDate.getMinutes()
			);

			// Do not add address
			hearingSectionPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			caseDetailsPage.clickButtonByText('Set up hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');
			caseDetailsPage.validateBannerMessage('Important', 'Add hearing address');

			// Verify Hearing ready to set up tag - all cases page
			cy.visit(urlPaths.allCases);
			hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Hearing ready to set up');

			// Verify Hearing ready to set up tag - personal list page
			cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
			hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Hearing ready to set up', 1);

			// navigate to details page
			caseDetailsPage.clickLinkByText(caseRef);

			caseDetailsPage.clickHearingBannerAddressLink();
			hearingSectionPage.addHearingLocationAddress(originalAddress);
			hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
			caseDetailsPage.clickButtonByText('Update hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

			// Verify Awaiting hearing tag - all cases page
			cy.visit(urlPaths.allCases);
			hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Awaiting hearing');

			// Verify Awaiting hearing tag - personal list page
			cy.visit(urlPaths.personalListFilteredAwaitingEvent);
			hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Awaiting hearing');

			// navigate to details page
			caseDetailsPage.clickLinkByText(caseRef);

			hearingSectionPage.verifyIssueDecision(caseRef);

			hearingSectionPage.verifyCaseHistory([
				'Appeal started',
				'Appeal procedure: hearing',
				'Case progressed to Hearing ready to set up',
				`Hearing set up on ${formatDateAndTime(hearingDate).date}`,
				'Case progressed to Awaiting hearing',
				'The hearing address has been added',
				'Case progressed to Issue decision',
				'Case progressed to Complete'
			]);
		});

		//Notify
		const expectedNotifies = [
			{
				template: 'appeal-valid-start-case-s78-appellant',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-s78-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'received-statement-and-ip-comments-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'received-statement-and-ip-comments-appellant',
				recipient: 'agent@test.com'
			},
			{
				template: 'hearing-updated',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-updated',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'decision-is-allowed-split-dismissed-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			},
			{
				template: 'decision-is-allowed-split-dismissed-appellant',
				recipient: 'agent@test.com'
			}
		];

		cy.checkNotifySent(caseRef, expectedNotifies);
	});

	it('should display all expected case detail sections for hearing cases', () => {
		const expectedSections = [
			'Overview',
			'Timetable',
			'Hearing',
			'Documentation',
			'Costs',
			'Contacts',
			'Team',
			'Case management'
		];

		cy.navigateToAppealDetailsPage(caseRef);
		caseDetailsPage.verifyCaseDetailsSection(expectedSections);
	});

	it('should display the correct status tags when removing hearing address', () => {
		cy.createCase({ caseType: 'W' }).then((ref) => {
			// Set up a new case
			caseRef = ref;
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'hearing');
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
			happyPathHelper.reviewLPaStatement(caseRef);

			// Verify Hearing ready to set up tag - all cases page
			cy.visit(urlPaths.allCases);
			hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Hearing ready to set up');

			// Verify Hearing ready to set up tag - personal list page
			cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
			hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Hearing ready to set up');

			// navigate to details page
			caseDetailsPage.clickLinkByText(caseRef);

			// add hearing via banner
			caseDetailsPage.clickHearingBannerLink();

			cy.getBusinessActualDate(currentDate, 2).then((hearingDate) => {
				hearingDate.setHours(currentDate.getHours(), currentDate.getMinutes());
				hearingSectionPage.setUpHearing(
					hearingDate,
					hearingDate.getHours(),
					hearingDate.getMinutes()
				);

				// Add address
				hearingSectionPage.selectRadioButtonByValue('Yes');
				caseDetailsPage.clickButtonByText('Continue');
				hearingSectionPage.addHearingLocationAddress(originalAddress);
				hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
				caseDetailsPage.clickButtonByText('Set up hearing');
				caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');

				// Verify Awaiting hearing tag - all cases page
				cy.visit(urlPaths.allCases);
				hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Awaiting hearing');

				// Verify Awaiting hearing tag - personal list page
				cy.visit(urlPaths.personalListFilteredAwaitingEvent);
				hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Awaiting hearing');

				// navigate to details page
				caseDetailsPage.clickLinkByText(caseRef);

				caseDetailsPage.clickAccordionByButton('Hearing');
				caseDetailsPage.clickRowChangeLink('whether-the-address-is-known-or-not');
				hearingSectionPage.selectRadioButtonByValue('No');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Update hearing');
				caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');
				caseDetailsPage.validateBannerMessage('Important', 'Add hearing address');

				// Verify Awaiting hearing tag - all cases page
				cy.visit(urlPaths.allCases);
				hearingSectionPage.verifyTagOnAllCasesPage(caseRef, 'Hearing ready to set up');

				// Verify Awaiting hearing tag - personal list page
				cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
				hearingSectionPage.verifyTagOnPersonalListPage(caseRef, 'Hearing ready to set up');
			});
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
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
		});
	};
});
