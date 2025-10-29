// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Change site visit', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(`Change visit from Site details`, () => {
		let visitDate = happyPathHelper.validVisitDate();

		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Type', 'Unaccompanied', { matchQuestionCase: true });
			caseDetailsPage.elements.changeSetVisitType().click();
			caseDetailsPage.clickButtonByText('Manage the site visit');
			caseDetailsPage.selectRadioButtonByValue('Access Required');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit updated');
			caseDetailsPage.validateAnswer('Type', 'Access required', { matchQuestionCase: true });
		});
	});

	it(`Change visit from case timetable`, () => {
		let visitDate = happyPathHelper.validVisitDate();

		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Access required');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Type', 'Access required', { matchQuestionCase: true });
			caseDetailsPage.clickChangeVisitTypeHasCaseTimetable();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit updated');
			caseDetailsPage.validateAnswer('Type', 'Unaccompanied', { matchQuestionCase: true });
		});
	});
});
