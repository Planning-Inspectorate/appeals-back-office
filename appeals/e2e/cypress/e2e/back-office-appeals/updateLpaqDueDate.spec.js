// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Update LPAQ Due date', () => {
	const lpaQuestionnaire = 'lpa-questionnaire-due-date';

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('change lpaq due date from timetable', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			cy.clearCookies();
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseObj);
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterLpaqDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.clickButtonByText('Update timetable due dates');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewLpaq(caseObj);
		});
	});

	it('change S78 lpaq due date from timetable', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			cy.clearCookies();
			cy.visit(urlPaths.appealsList);
			listCasesPage.clickAppealByRef(caseObj);
			caseDetailsPage.clickChangeLpaqDueDate();
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterLpaqDate(futureDate);
			});
		});
	});
});
