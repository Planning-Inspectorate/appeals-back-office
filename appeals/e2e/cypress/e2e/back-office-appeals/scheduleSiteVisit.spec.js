// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';

let appeal;

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase().then((ref) => {
		appeal = ref;
		happyPathHelper.assignCaseOfficer(appeal);
		happyPathHelper.reviewAppellantCase(appeal);
		happyPathHelper.startCase(appeal);
	});
};

describe('Schedule site visit', () => {
	beforeEach(() => {
		setupTestCase();
	});

	//afterEach(() => {
	//	cy.deleteAppeals(appeal);
	//});

	const visitTypeTestCases = ['Accompanied', 'Access required', 'Unaccompanied'];

	visitTypeTestCases.forEach((visitType, index) => {
		it(`Arrange ${visitType} visit from Site details`, { tags: tag.smoke }, () => {
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
			cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
				dateTimeSection.enterVisitDate(visitDate);
			});
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
		});

		it(`Arrange ${visitType} site visit with time from case timetable`, () => {
			caseDetailsPage.clickArrangeVisitTypeHasCaseTimetable();
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
			cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
				dateTimeSection.enterVisitDate(visitDate);
			});
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
		});

		it(`Cancel Site Visit`, { tags: tag.smoke }, () => {
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
			cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
				dateTimeSection.enterVisitDate(visitDate);
			});
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.clickLinkByText('Cancel site visit');
			caseDetailsPage.clickButtonByText('Cancel site visit');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
		});

		it('Missed Site Visit', () => {
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
			cy.getBusinessActualDate(new Date(), -28).then((visitDate) => {
				dateTimeSection.enterVisitDate(visitDate);
			});
			dateTimeSection.enterVisitStartTime('13', '00'); //
			dateTimeSection.enterVisitEndTime('14', '00'); //
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.clickLinkByText('Record missed site visit');
			caseDetailsPage.selectRadioButtonByValue('Appellant');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Record missed site visit');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Missed site visit recorded');
			caseHistoryPage.verifyCaseHistory('missedSiteVisit', appeal.reference);
		});
	});

	it('should show an error when visit type is not selected', () => {
		caseDetailsPage.clickSetUpSiteVisitType();
		// Don’t select a radio button
		cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
			dateTimeSection.enterVisitDate(visitDate);
		});
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateErrorMessage('Select visit type');
		caseDetailsPage.validateInLineErrorMessage('Select visit type');
	});

	// start time only required for accompanied visits and access required
	// end time only required for access required
	// no times required for unnaccompanied visits
	it('should show a sucess banner when a past date is entered for the site visit', () => {
		caseDetailsPage.clickSetUpSiteVisitType();
		caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
		cy.getBusinessActualDate(new Date(), -28).then((pastDate) => {
			dateTimeSection.enterVisitDate(pastDate);
		});
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
	});

	it('should show an error when the start time is after the end time', () => {
		caseDetailsPage.clickSetUpSiteVisitType();
		caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
		cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
			dateTimeSection.enterVisitDate(visitDate);
		});
		dateTimeSection.enterVisitStartTime('15', '00'); // 3:00 PM
		dateTimeSection.enterVisitEndTime('14', '00'); // 2:00 PM
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateErrorMessage('Start time must be before end time');
		caseDetailsPage.validateInLineErrorMessage('Start time must be before end time');
	});
});
