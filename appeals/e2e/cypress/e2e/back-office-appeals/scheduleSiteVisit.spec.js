// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AppealsListPage } from '../../page_objects/appealsListPage';
import { UpdateDueDatePage } from '../../page_objects/updateDueDatePage';
import { urlPaths } from '../../fixtures/url-paths.js';
import { AppealsDetailPage } from '../../page_objects/appealsDetailPage.js';

const appealsListPage = new AppealsListPage();
const appealsDetailPage = new AppealsDetailPage();
const updateDueDatePage = new UpdateDueDatePage();

describe('Appeals feature', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Change to accommpanied site visit from case timetable', () => {
		let visitDate = new Date();
		visitDate.setMonth(futureDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsDetailPage.clickChangeVisitTypeHasCaseTimetable();
		appealsListPage.selectRadioButtonByValue('Accompanied');
		updateDueDatePage.enterVisitDate(visitDate);
		updateDueDatePage.enterVisitStartTimeHour('10');
		updateDueDatePage.enterVisitStartTimeMinute('00');
		updateDueDatePage.enterVisitEndTimeHour('14');
		updateDueDatePage.enterVisitEndTimeMinute('00');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		appealsListPage.checkAnswer('Visit type', 'Accompanied');
	});

	it('Change to access required site visit from case timetable', () => {
		let visitDate = new Date();
		visitDate.setMonth(futureDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasCaseTimetable();
		appealsListPage.selectRadioButtonByValue('Access Required');
		updateDueDatePage.enterVisitDate(visitDate);
		updateDueDatePage.enterVisitStartTimeHour('10');
		updateDueDatePage.enterVisitStartTimeMinute('00');
		updateDueDatePage.enterVisitEndTimeHour('14');
		updateDueDatePage.enterVisitEndTimeMinute('00');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		appealsListPage.checkAnswer('Visit type', 'Access required');
	});

	it('Change to Unaccommpanied site visit without time from case timetable', () => {
		let visitDate = new Date();
		visitDate.setMonth(futureDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasCaseTimetable();
		appealsListPage.selectRadioButtonByValue('Unaccompanied');
		updateDueDatePage.enterVisitDate(visitDate);
		updateDueDatePage.removeVisitStartTimeHour();
		updateDueDatePage.removeVisitStartTimeMinute();
		updateDueDatePage.removeVisitEndTimeHour();
		updateDueDatePage.removeVisitEndTimeMinute();
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		appealsListPage.checkAnswer('Visit type', 'Unaccompanied');
	});

	it('Change to Unaccommpanied site visit with time from case timetable', () => {
		let visitDate = new Date();
		visitDate.setMonth(futureDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?

		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasCaseTimetable();
		appealsListPage.selectRadioButtonByValue('Unaccompanied');
		updateDueDatePage.enterVisitDate(visitDate);
		updateDueDatePage.enterVisitStartTimeHour('08');
		updateDueDatePage.enterVisitStartTimeMinute('00');
		updateDueDatePage.enterVisitEndTimeHour('12');
		updateDueDatePage.enterVisitEndTimeMinute('00');
		appealsListPage.clickButtonByText('Confirm');
		appealsListPage.clickLinkByText('Go back to case details');
		appealsListPage.checkAnswer('Visit type', 'Unaccompanied');
	});

	it.skip('Change to accommpanied site visit from Site details', () => {
		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasSiteDetails();
		appealsListPage.selectRadioButtonByValue('Accompanied');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.validateBannerMessage('Site visit type has been selected');
		appealsListPage.checkAnswer('Visit Type', 'Accompanied');
	});

	it.skip('Change to access required site visit from Site details', () => {
		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasSiteDetails();
		appealsListPage.selectRadioButtonByValue('Access required');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.validateBannerMessage('Site visit type has been selected');
		appealsListPage.checkAnswer('Visit Type', 'Access required');
	});

	it.skip('Change to Unaccommpanied site visit from Site details', () => {
		cy.visit(urlPaths.appealsList);
		appealsListPage.clickAppealFromList(30); // TODO Change to use page.clickAppealByRef(ref)
		appealsListPage.clickChangeVisitTypeHasSiteDetails();
		appealsListPage.selectRadioButtonByValue('Unaccompanied');
		appealsListPage.clickButtonByText('Continue');
		appealsListPage.validateBannerMessage('Site visit type has been selected');
		appealsListPage.checkAnswer('Visit Type', 'Unaccompanied');
	});
});
