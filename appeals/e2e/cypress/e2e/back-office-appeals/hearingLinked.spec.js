// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { EstimatedDaysSection } from '../../page_objects/estimatedDaysSection';
import { happyPathHelper } from '../../support/happyPathHelper';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const hearingSectionPage = new HearingSectionPage();
const estimatedDaysSection = new EstimatedDaysSection();
const caseHistoryPage = new CaseHistoryPage();
const currentDate = new Date();

// This test suite is designed to validate the hearing behaviour which relates specifically to linked appeals.
// For more generic tests use the hearing.spec.js test suite.
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

	it('should display all expected case detail sections for hearing cases on the lead', () => {
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
		// start the case with a hearing date and estimated days
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			const estimatedDays = 6;

			happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
				date,
				setEstimatedDays: true,
				estimatedDays,
				startCase: true
			});
		});

		caseDetailsPage.verifyCaseDetailsSection(expectedSections);
	});

	it('should not show the hearing section for hearing cases on a child appeal', () => {
		const childAppeal = {
			reference: String(Number(appeal.reference) + 2),
			id: String(Number(appeal.id) + 2)
		};
		// start the case with a hearing date and estimated days
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			const estimatedDays = 6;

			happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
				date,
				setEstimatedDays: true,
				estimatedDays,
				startCase: true
			});
		});

		caseDetailsPage.clickLinkedAppeal(childAppeal);
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${childAppeal.reference}`);

		const expectedSections = [
			'Overview',
			'Timetable',
			'Documentation',
			'Contacts',
			'Case management'
		];

		caseDetailsPage.verifyCaseDetailsSection(expectedSections);
	});

	it('should have hearing details on unlinked appeal when hearing details added in the start flow, then unlinked after', () => {
		// child info for the one we will unlink
		const childAppeal = {
			reference: String(Number(appeal.reference) + 1),
			id: String(Number(appeal.id) + 1)
		};

		// start the case with a hearing date and estimated days
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			const estimatedDays = 6;
			const formattedDate = formatDateAndTime(date);
			happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
				date,
				setEstimatedDays: true,
				estimatedDays,
				startCase: true
			});

			// verify hearing date and estimated days is added on the case details page
			hearingSectionPage.verifyHearingValues(
				'estimated-days',
				String(Number(estimatedDays)) + ' Days'
			);
			hearingSectionPage.verifyHearingValues('date', formattedDate.date);
			hearingSectionPage.verifyHearingValues('time', formattedDate.time);

			// unlink the appeal
			happyPathHelper.unlinkFirstChildEnforcementAppeal(appeal.reference);

			// go to the unlinked appeal and verify hearing date and estimated days is still present
			happyPathHelper.viewCaseDetails(childAppeal);
			caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${childAppeal.reference}`);
			// verify hearing address is still present on the unlinked appeal
			hearingSectionPage.verifyHearingValues(
				'estimated-days',
				String(Number(estimatedDays)) + ' Days'
			);
			hearingSectionPage.verifyHearingValues('date', formattedDate.date);
			hearingSectionPage.verifyHearingValues('time', formattedDate.time);
		});
	});

	it('should have hearing details on unlinked appeal when no hearing details added in the start flow, then unlinked after adding hearing details to the lead', () => {
		// child info for the one we will unlink
		const childAppeal = {
			reference: String(Number(appeal.reference) + 1),
			id: String(Number(appeal.id) + 1)
		};

		// start the case without hearing date or estimated days
		happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
			date: null,
			setDate: false,
			setEstimatedDays: false,
			startCase: true
		});

		// set up the hearing on the lead appeal from the case details page with a date and address
		caseDetailsPage.clickButtonByText('Set up hearing');
		cy.getBusinessActualDate(new Date(), 2).then((date) => {
			hearingSectionPage.setUpHearingWithAddress({ date, address: originalAddress });
		});
		hearingSectionPage.addHearingLocationAddress(originalAddress);
		caseDetailsPage.clickButtonByText('Set up Hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');

		// verify hearing address is updated on the case details page
		hearingSectionPage.verifyHearingValues('address', 'Yes', true, Object.values(originalAddress));

		// unlink the child appeal
		happyPathHelper.unlinkFirstChildEnforcementAppeal(appeal.reference);

		// go to the unlinked appeal and verify hearing address is still present
		happyPathHelper.viewCaseDetails(childAppeal);
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${childAppeal.reference}`);
		// verify hearing address is still present on the unlinked appeal
		hearingSectionPage.verifyHearingValues('address', 'Yes', true, Object.values(originalAddress));
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ ...appealsApiRequests.enforcementLinkedSubmission.casedata }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;

			// advance the case to the lpaq questionnaire status which is the starting point for these tests
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'READY_TO_START',
				'ENFORCEMENT',
				'HEARING',
				false
			);

			cy.writeLog(`Case created with reference: ${caseObj.reference}, checking case details page`);
		});
	};
});
