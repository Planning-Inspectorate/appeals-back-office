// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';

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
			updateLpaqDueDate(caseObj);
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.reviewLpaq(caseObj);
		});
	});

	it('change S78 lpaq due date from timetable', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			updateLpaqDueDate(caseObj);
		});
	});

	it('change cas adverts lpaq due date from timetable', () => {
		cy.createCase({ ...appealsApiRequests.casAdvertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			updateLpaqDueDate(caseObj);
		});
	});

	it('change cas planning lpaq due date from timetable', () => {
		cy.createCase({ caseType: 'ZP' }).then((caseObj) => {
			appeal = caseObj;
			updateLpaqDueDate(caseObj);
		});
	});

	const updateLpaqDueDate = (caseObj) => {
		happyPathHelper.advanceTo(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
		cy.clearCookies();
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.clickChangeLpaqDueDate();
		cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
			dateTimeSection.enterLpaqDate(futureDate);
		});
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Update timetable due dates');
		caseDetailsPage.validateBannerMessage('Success', 'Timetable due dates updated');
	};
});
