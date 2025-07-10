// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Schedule site visit', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const visitTypeTestCases = ['Accompanied', 'Access required', 'Unaccompanied'];

	visitTypeTestCases.forEach((visitType, index) => {
		it(`Arrange ${visitType} visit from Site details`, { tags: tag.smoke }, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
				caseDetailsPage.validateAnswer('Visit Type', visitType);
			});
		});

		it(`Arrange ${visitType} site visit with time from case timetable`, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				caseDetailsPage.clickArrangeVisitTypeHasCaseTimetable();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
				caseDetailsPage.validateAnswer('Visit type', visitType);
			});
		});
	});

	it('should show an error when visit type is not selected', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickSetUpSiteVisitType();

			// Don’t select a radio button
			dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');

			caseDetailsPage.clickButtonByText('Confirm');

			caseDetailsPage.validateErrorMessage('Select visit type');
			caseDetailsPage.validateInLineErrorMessage('Select visit type');
		});
	});

	// start time only required for accompanied visits and access required
	// end time only required for access required
	// no times required for unnaccompanied visits
	it('should show an error when a past date is entered for the site visit', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');

			// Create a date 1 day in the past
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			dateTimeSection.enterVisitDate(yesterday);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');

			caseDetailsPage.clickButtonByText('Confirm');

			caseDetailsPage.validateErrorMessage('The site visit date must be in the future');
			caseDetailsPage.validateInLineErrorMessage('The site visit date must be in the future');
		});
	});

	it('should show an error when the start time is after the end time', () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');

			const futureDate = happyPathHelper.validVisitDate();

			dateTimeSection.enterVisitDate(futureDate);
			dateTimeSection.enterVisitStartTime('15', '00'); // 3:00 PM
			dateTimeSection.enterVisitEndTime('14', '00'); // 2:00 PM

			caseDetailsPage.clickButtonByText('Confirm');

			caseDetailsPage.validateErrorMessage('Start time must be before end time');
			caseDetailsPage.validateInLineErrorMessage('Start time must be before end time');
		});
	});
});
