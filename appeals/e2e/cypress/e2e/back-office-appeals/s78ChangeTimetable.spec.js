// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('S78 - Case officer update pre populated timetable dates', () => {
	const timetableItems = [
		{
			row: 'lpa-questionnaire-due-date',
			editable: true
		},
		{
			row: 'lpa-statement-due-date',
			editable: true
		},
		{
			row: 'ip-comments-due-date',
			editable: true
		},
		{
			row: 'final-comments-due-date',
			editable: true
		}
	];
	const futureDate = { years: 1, days: 10 };
	let caseObj;

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
		cy.intercept('POST', '**/timetable/edit/check', (req) => {
			req.continue((res) => {
				console.log('📤 Request body:', req.body);
				console.log('❌ Response body:', res.body);
				console.log('🔁 Status code:', res.statusCode);
			});
		}).as('timetableCheck');
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it(
		'should change due dates when case status is lpa_questionnaire',
		{ retries: { runMode: 2, openMode: 0 } },
		() => {
			cy.createCase({
				caseType: 'W'
			}).then((caseObj) => {
				appeal = caseObj;
				happyPathHelper.assignCaseOfficer(caseObj);
				happyPathHelper.reviewAppellantCase(caseObj);
				happyPathHelper.startS78Case(caseObj, 'written');
				verifyDateChanges(0);
			});
		}
	);

	it('should not accept current date when case status is lpa_questionnaire', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
			caseDetailsPage.changeTimetableDates(timetableItems, new Date(), 7);
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
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[0].row);
			const nextYear = new Date().getFullYear() + 1;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates(timetableItems, nonBusinessDate, 1);
			caseDetailsPage.checkErrorMessageDisplays(
				'The lpa questionnaire due date must be a business day'
			);
		});
	});

	// tests are flaky error only caused with automation
	it.only('should move case status to statements and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewS78Lpaq(caseObj);
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			verifyDateChanges(1);
		});
	});

	it('should not accept current date when case status is statements', () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			happyPathHelper.reviewS78Lpaq(caseObj);
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
			caseDetailsPage.changeTimetableDates(timetableItems, new Date(), 7);
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
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			happyPathHelper.reviewS78Lpaq(caseObj);
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
			caseDetailsPage.clickRowChangeLink(timetableItems[1].row);
			const nextYear = new Date().getFullYear() + 2;
			const nonBusinessDate = new Date(nextYear, 0, 1);
			caseDetailsPage.changeTimetableDates([timetableItems[1]], new Date(nextYear, 0, 1), 0);
			caseDetailsPage.checkErrorMessageDisplays('due date must be a business day');
		});
	});

	// tests are flaky error only caused with automation
	it.only('should move case status to final_comments and update available due dates', () => {
		cy.clearAllSessionStorage();
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			happyPathHelper.reviewS78Lpaq(caseObj);
			caseDetailsPage.navigateToAppealsService();
			listCasesPage.clickAppealByRef(caseObj);
			happyPathHelper.addThirdPartyComment(caseObj, true);
			caseDetailsPage.clickBackLink();
			happyPathHelper.addThirdPartyComment(caseObj, false);
			caseDetailsPage.clickBackLink();

			happyPathHelper.addLpaStatement(caseObj);
			cy.simulateStatementsDeadlineElapsed(caseObj);
			cy.reload();

			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.checkStatusOfCase('Final comments', 0);
			timetableItems[0].editable = false; // lpa questionare date is not editable in statements status
			timetableItems[1].editable = false; // statement due is not editbale
			timetableItems[2].editable = false; //
			verifyDateChanges(7);
		});
	});

	const verifyDateChanges = (addedDays) => {
		const safeAddedDays = Math.max(addedDays, 1);

		caseDetailsPage.checkTimetableDueDatesAndChangeLinks(timetableItems);
		caseDetailsPage.clickRowChangeLink(timetableItems[3].row);

		// Get the future business date using Cypress task/helper
		cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
			caseDetailsPage.changeTimetableDates(timetableItems, startDate, 7);
			caseDetailsPage.clickUpdateTimetableDueDates();

			caseDetailsPage.verifyDatesChanged(timetableItems, startDate, 7);
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
		});
	};
});
