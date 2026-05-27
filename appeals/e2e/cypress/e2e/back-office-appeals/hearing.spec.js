// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { EstimatedDaysSection } from '../../page_objects/estimatedDaysSection';
import { happyPathHelper } from '../../support/happyPathHelper';
import { getPersonalListURLWithFilter, urlPaths } from '../../support/urlPaths';
import { formatDateAndTime, formatObjectAsString } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const hearingSectionPage = new HearingSectionPage();
const estimatedDaysSection = new EstimatedDaysSection();
const caseHistoryPage = new CaseHistoryPage();
const currentDate = new Date();

describe('Setup hearing and add hearing estimates', () => {
	let caseObj;

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
			estimationQuestion: 'Do you know the expected number of days to carry out the hearing?',
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

	beforeEach(() => {
		setupTestCase();
	});

	let appeal;

	after(() => {
		cy.deleteAppeals(appeal);
	});

	it('should not accept invalid input - current date with no time', () => {
		hearingSectionPage.clickChangeHearingDate();
		hearingSectionPage.setUpHearing(new Date(), ' ', ' ');

		hearingSectionPage.verifyErrorMessages({
			messages: ['Enter the hearing time', 'The hearing date must be in the future'],
			fields: ['hearing-time-hour', 'hearing-date-day']
		});
	});

	it('should not accept invalid input - valid time with no date', () => {
		hearingSectionPage.clickChangeHearingDate();
		hearingSectionPage.clearHearingDateAndTime();
		hearingSectionPage.setUpHearing(null, '12', '30');

		hearingSectionPage.verifyErrorMessages({
			messages: ['Enter the hearing date'],
			fields: ['hearing-date-day']
		});
	});

	it('should not accept invalid input - current date with no time', () => {
		hearingSectionPage.clickChangeHearingDate();
		hearingSectionPage.setUpHearing(new Date(), ' ', ' ');

		hearingSectionPage.verifyErrorMessages({
			messages: ['Enter the hearing time', 'The hearing date must be in the future'],
			fields: ['hearing-time-hour', 'hearing-date-day']
		});
	});

	it('should not accept invalid input - Hearing Estimates', () => {
		hearingSectionPage.clickChangeHearingEstimates();
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

	it('should not accept invalid input - empty address', () => {
		const emptyAddress = {
			line1: ' ',
			line2: ' ',
			town: ' ',
			county: ' ',
			postcode: ' '
		};

		hearingSectionPage.changeHearingAddress(emptyAddress);
		hearingSectionPage.verifyErrorMessages({
			messages: ['Enter address line 1', 'Enter town or city', 'Enter postcode'],
			fields: ['address-line-1', 'town', 'post-code'],
			verifyInlineErrors: true
		});
	});

	it('should not accept invalid input - invalid address', () => {
		const invalidAddress = {
			...originalAddress,
			line1: 'e2e Hearing Test Address'.repeat(20).substring(0, 251),
			postcode: 'BS20'
		};

		hearingSectionPage.changeHearingAddress(invalidAddress);
		hearingSectionPage.verifyErrorMessages({
			messages: ['Address line 1 must be 250 characters or less', 'Enter a full UK postcode'],
			fields: ['address-line-1', 'post-code'],
			verifyInlineErrors: true
		});
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

		caseDetailsPage.verifyCaseDetailsSection(expectedSections);
	});

	it('should navigate back to overview page - Hearing Estimate', () => {
		hearingSectionPage.clickChangeHearingEstimates();
		hearingSectionPage.addEstimates(
			initialEstimates.preparationTime,
			initialEstimates.sittingTime,
			initialEstimates.reportingTime
		);

		// verify hearing estimate header and navigate back to overview page
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.checkDetails);
		hearingSectionPage.clickBackLink();
		hearingSectionPage.verifyHearingHeader(headers.hearingEstimate.estimateForm);
		hearingSectionPage.clickBackLink();

		// verify we are back on the overview page by checking the appeal reference and hearing section is displayed
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseObj.reference}`);
		hearingSectionPage.verifyHearingSectionIsDisplayed();
		hearingSectionPage.verifyHearingEstimateSectionIsDisplayed();
	});

	it('should navigate back through hearing setup workflow', () => {
		// Initialize Hearing
		hearingSectionPage.clickChangeHearingDate();

		cy.getBusinessActualDate(currentDate, 2).then((date) => {
			date.setHours(currentDate.getHours(), currentDate.getMinutes());

			// Test back navigation from initial setup (no address)
			let navigationConfig = {
				clickBackFirst: false,
				clickBackLast: false,
				headers: [headers.hearing.checkDetails, headers.hearing.addressQuestion]
			};
			hearingSectionPage.setUpHearingWithAddress({ date: date });
			happyPathHelper.validateBackNavigationFlow(navigationConfig);

			// Test back navigation after adding address flow
			hearingSectionPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			hearingSectionPage.addHearingLocationAddress(originalAddress);

			navigationConfig.headers = [
				headers.hearing.checkDetails,
				headers.hearing.addressForm,
				headers.hearing.addressQuestion,
				headers.hearing.estimationQuestion,
				headers.hearing.dateTime
			];
			navigationConfig.clickBackLast = true;
			happyPathHelper.validateBackNavigationFlow(navigationConfig);

			// verify are back on the overview page by checking the appeal reference is displayed
			caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseObj.reference}`);
		});
	});

	it('should add and update hearing Estimates', () => {
		// Adding initial hearing estimates
		hearingSectionPage.clickChangeHearingEstimates();
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
		hearingSectionPage.clickRowChangeLink('estimated-preparation-time');
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
		hearingSectionPage.clickButtonByText('Add hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates added');

		// Updating estimates from the overview page
		hearingSectionPage.clickRowChangeLink('reporting-time');
		hearingSectionPage.addEstimates(
			finalEstimates.preparationTime,
			finalEstimates.sittingTime,
			finalEstimates.reportingTime
		);

		// Submit the estimates
		hearingSectionPage.clickButtonByText('Update hearing estimates');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing estimates updated');

		// Verify final estimates were updated correctly
		hearingSectionPage.verifyHearingEstimate('preparation-time', finalEstimates.preparationTime);
		hearingSectionPage.verifyHearingEstimate('sitting-time', finalEstimates.sittingTime);
		hearingSectionPage.verifyHearingEstimate('reporting-time', finalEstimates.reportingTime);

		// validate hearing estimates by checking the appeal details
		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			const hearingEstimates = appealDetails?.hearingEstimate;
			expect(hearingEstimates.preparationTime).to.eq(finalEstimates.preparationTime);
			expect(hearingEstimates.sittingTime).to.eq(finalEstimates.sittingTime);
			expect(hearingEstimates.reportingTime).to.eq(finalEstimates.reportingTime);
		});

		// check the case history to ensure updates are logged correctly
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValues([
			'Hearing estimates added',
			'Hearing estimates updated'
		]);
	});

	it('should cancel hearing', () => {
		hearingSectionPage.clickCancelHearing();
		hearingSectionPage.verifyHearingHeader(headers.hearing.confirmHearingCancellation);
		hearingSectionPage.clickCancelHearing();

		caseDetailsPage.validateBannerMessage('Success', 'Hearing cancelled');
		hearingSectionPage.verifyHearingIsDisplayed(false);

		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValues(['Hearing cancelled']);

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

		cy.checkNotifySent(caseObj, expectedNotifies);
	});

	it('should not cancel hearing if select to keep it', () => {
		hearingSectionPage.clickCancelHearing();
		hearingSectionPage.clickKeepHearing();
		hearingSectionPage.verifyHearingIsDisplayed(true);

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

		cy.checkNotifyNotSent(caseObj, expectedNotifies);
	});

	it('should send notify when adding hearing address', () => {
		hearingSectionPage.changeHearingAddress(originalAddress);
		hearingSectionPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

		// verify hearing address is updated on the case details page
		hearingSectionPage.verifyHearingValues('address', 'Yes', true, Object.values(originalAddress));

		// check case history
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValues(['The hearing address has been added']);

		// Check notifies
		const expectedNotifies = [
			{
				template: 'hearing-updated',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-updated',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		];

		cy.checkNotifySent(caseObj, expectedNotifies);
	});

	it('should send notify when updating hearing address', () => {
		const updatedAddress = {
			...originalAddress,
			line1: 'e2e Hearing Test Address - Overview Page',
			postcode: 'SW1A 2AA'
		};

		// set address
		hearingSectionPage.changeHearingAddress(originalAddress);
		hearingSectionPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

		// update address again to trigger notify
		hearingSectionPage.updateHearingAddress(updatedAddress);
		hearingSectionPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

		// verify hearing address is updated on the case details page
		hearingSectionPage.verifyHearingValues('address', 'Yes', true, Object.values(updatedAddress));

		// check case history
		const expectedUpdatedAddress = `Hearing address updated to ${formatObjectAsString(updatedAddress, ', ')}`;

		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValues([expectedUpdatedAddress]);

		// Check notifies
		const expectedNotifies = [
			{
				template: 'hearing-updated',
				recipient: 'appellant@test.com'
			},
			{
				template: 'hearing-updated',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		];

		cy.checkNotifySent(caseObj, expectedNotifies);
	});

	it('should verify the timetable behaviour', () => {
		hearingSectionPage.deleteHearingIfExists(caseObj);

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
		cy.updateAppealDetailsViaApi(caseObj, { planningObligation: true });
		cy.getBusinessActualDate(currentDate, 1).then((date) => {
			cy.updateTimeTableDetails(caseObj, { planningObligationDueDate: date });
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
			estimatedDaysSection.selectEstimatedDaysOption('No');
			caseDetailsPage.clickButtonByText('Continue');
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

		cy.checkNotifySent(caseObj, expectedNotifies);
	});

	it('should progress hearing case to decision', () => {
		// add address to set up the hearing and trigger notify and case history entry for adding hearing address
		hearingSectionPage.changeHearingAddress(originalAddress);
		hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
		caseDetailsPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

		// advance the case to decision
		happyPathHelper.advanceTo(caseObj, 'LPA_QUESTIONNAIRE', 'ISSUE_DECISION', 'S78', 'HEARING');

		// confirm issue decision flow
		hearingSectionPage.verifyIssueDecision(caseObj);

		// verify hearing details and case history entries
		hearingSectionPage.verifyCaseHistory([
			'Appeal started',
			'Appeal procedure: hearing',
			'Case progressed to Hearing ready to set up',
			`Hearing set up on`,
			'Case progressed to Awaiting hearing',
			'The hearing address has been added',
			'Case progressed to Issue decision',
			'Case progressed to Complete'
		]);

		// check notifies
		const expectedNotifies = [
			{
				template: 'appeal-valid-start-case-s78-appellant-hearing',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-s78-lpa-hearing',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
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

		cy.checkNotifySent(caseObj, expectedNotifies);
	});

	it.only('should display the correct status tags when removing hearing address', () => {
		// advance the case to event ready to set up hearing
		happyPathHelper.advanceTo(caseObj, 'LPA_QUESTIONNAIRE', 'AWAITING_EVENT', 'S78', 'HEARING');

		// Verify Hearing ready to set up tag - all cases page
		cy.visit(urlPaths.appealsList);
		hearingSectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Hearing ready to set up');

		// Verify Hearing ready to set up tag - personal list page
		const personalListLPA = getPersonalListURLWithFilter('event');
		cy.visit(personalListLPA);
		hearingSectionPage.verifyTagOnPersonalListPage(caseObj.reference, 'Hearing ready to set up');

		// navigate to details page
		caseDetailsPage.clickLinkByText(caseObj.reference);

		// add address to hearing and then remove it to trigger the tags
		hearingSectionPage.changeHearingAddress({ address: originalAddress });
		hearingSectionPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');

		// Verify awaiting hearing tag - all cases page
		cy.visit(urlPaths.appealsList);
		hearingSectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Awaiting hearing');

		// Verify awaiting hearing tag - personal list page
		const personalListAwaiting = getPersonalListURLWithFilter('awaiting_event');
		cy.visit(personalListAwaiting);
		hearingSectionPage.verifyTagOnPersonalListPage(caseObj.reference, 'Awaiting hearing');

		// remove hearing address to trigger important banner and tag changes
		caseDetailsPage.clickLinkByText(caseObj.reference);
		hearingSectionPage.changeHearingAddress({ addressKnown: false });
		hearingSectionPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');
		caseDetailsPage.validateBannerMessage('Important', 'Add hearing address');

		// Verify hearing ready to set up 	tag - all cases page
		cy.visit(urlPaths.appealsList);
		hearingSectionPage.verifyTagOnAllCasesPage(caseObj.reference, 'Hearing ready to set up');

		// Verify Hearing ready to set up tag - personal list page
		cy.visit(urlPaths.personalListFilteredEventReadyToSetup);
		hearingSectionPage.verifyTagOnPersonalListPage(caseObj.reference, 'Hearing ready to set up');
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			cy.assignCaseOfficerViaApi(caseObj);
			cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startCaseWithProcedureType(caseObj, 'hearing');
			cy.writeLog(`Case created with reference: ${caseObj.reference}, checking banners`);
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
			cy.writeLog(`Banners checked`);
		});
	};
});
