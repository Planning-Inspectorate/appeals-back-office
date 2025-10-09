// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { s78ChangeTimetableTimetableItems } from '../../support/timetables.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('S78 - Case officer update pre populated timetable dates', () => {
	const futureDate = { years: 1, days: 10 };
	let caseObj;

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('should change due dates when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			verifyDateChanges(0);
		});
	});

	it('should not accept current date when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(s78ChangeTimetableTimetableItems);
			caseDetailsPage.clickRowChangeLink(s78ChangeTimetableTimetableItems[0].row);
			caseDetailsPage.changeTimetableDates(s78ChangeTimetableTimetableItems, new Date(), 7);
			caseDetailsPage.checkErrorMessageDisplays(
				'The lpa questionnaire due date must be in the future'
			);
		});
	});

	it('should not accept non business date when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(s78ChangeTimetableTimetableItems);
			caseDetailsPage.clickRowChangeLink(s78ChangeTimetableTimetableItems[0].row);
			const nextYear = new Date().getFullYear() + 1;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates(s78ChangeTimetableTimetableItems, nonBusinessDate, 1);
			caseDetailsPage.checkErrorMessageDisplays(
				'The lpa questionnaire due date must be a business day'
			);
		});
	});

	// tests are flaky error only caused with automation
	it('should move case status to statements and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
			s78ChangeTimetableTimetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			verifyDateChanges(1);
		});
	});

	it('should not accept current date when case status is statements', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
			s78ChangeTimetableTimetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(s78ChangeTimetableTimetableItems);
			caseDetailsPage.clickRowChangeLink(s78ChangeTimetableTimetableItems[1].row);
			caseDetailsPage.changeTimetableDates(s78ChangeTimetableTimetableItems, new Date(), 7);
			caseDetailsPage.checkErrorMessageDisplays(
				'Statements due date must be after the LPA questionnaire due date'
			);
		});
	});

	it('should not accept non business date when case status is statements', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'STATEMENTS', 'S78', 'WRITTEN');
			s78ChangeTimetableTimetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(s78ChangeTimetableTimetableItems);
			caseDetailsPage.clickRowChangeLink(s78ChangeTimetableTimetableItems[1].row);
			const nextYear = new Date().getFullYear() + 2;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates(
				[s78ChangeTimetableTimetableItems[1]],
				new Date(nextYear, 0, 1),
				0
			);
			caseDetailsPage.checkErrorMessageDisplays('due date must be a business day');
		});
	});

	// tests are flaky error only caused with automation
	it('should move case status to final_comments and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'FINAL_COMMENTS', 'S78', 'WRITTEN');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);
			s78ChangeTimetableTimetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			s78ChangeTimetableTimetableItems[1].editable = false; // statement due is not editbale
			s78ChangeTimetableTimetableItems[2].editable = false; //
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			verifyDateChanges(7);
		});
	});

	it('check timetable for full adverts submission', () => {
		cy.createCase({ ...appealsApiRequests.advertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'ADVERT');
			cy.clearCookies();
			happyPathHelper.viewCaseDetails(caseObj);
			verifyDateChanges(0);
		});
	});

	const verifyDateChanges = (addedDays) => {
		const safeAddedDays = Math.max(addedDays, 1);

		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(s78ChangeTimetableTimetableItems);
		caseDetailsPage.clickRowChangeLink(s78ChangeTimetableTimetableItems[3].row);

		// Get the future business date using Cypress task/helper
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			caseDetailsPage.changeTimetableDates(s78ChangeTimetableTimetableItems, startDate, 21);
			caseDetailsPage.clickUpdateTimetableDueDates();

			caseDetailsPage.verifyDatesChanged(s78ChangeTimetableTimetableItems, startDate, 21);
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
		});
	};
});
