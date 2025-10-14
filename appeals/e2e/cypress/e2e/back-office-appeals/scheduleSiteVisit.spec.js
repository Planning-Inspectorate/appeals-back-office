// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
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

			cy.createCase().then((caseObj) => {
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startCase(caseObj);
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
				caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
			});
		});

		it(`Arrange ${visitType} site visit with time from case timetable`, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseObj) => {
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startCase(caseObj);
				caseDetailsPage.clickArrangeVisitTypeHasCaseTimetable();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
				caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
			});
		});

		it(`Cancel Site Visit`, { tags: tag.smoke }, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseObj) => {
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startCase(caseObj);
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
				caseDetailsPage.clickLinkByText('Cancel site visit');
				caseDetailsPage.clickButtonByText('Cancel site visit');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
			});
		});
	});

	it('should show an error when visit type is not selected', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
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
	it('should show a sucess banner when a past date is entered for the site visit', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');

			const yesterday = happyPathHelper.getYesterday();

			dateTimeSection.enterVisitDate(yesterday);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');

			caseDetailsPage.clickButtonByText('Confirm');

			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
		});
	});

	it('should show an error when the start time is after the end time', () => {
		cy.createCase().then((caseObj) => {
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
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
