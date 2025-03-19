// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { urlPaths } from '../../support/urlPaths.js';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { Before } from '@badeball/cypress-cucumber-preprocessor';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

let setthus;

describe('S78 - Case officer update pre populated timetable dates', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);

		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkAppealStatus('Validation'.toUpperCase());
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkAppealStatus('Ready to start'.toUpperCase());
			happyPathHelper.startCase(caseRef);
			cy.populateTimetable(caseRef);
			caseDetailsPage.clickAccordionByText('Timetable');
		});
	});
	it(`should change LPA questionnaire due date`, { tags: tag.smoke }, () => {
		const lpaQuestionaire = 'lpa-questionnaire-due-date';
		caseDetailsPage.checkTimetableDueDateIsDisplayed(lpaQuestionaire);
		caseDetailsPage.clickTimetableChangeLink(lpaQuestionaire);
		let futureDate = new Date();
		futureDate.setFullYear(futureDate.getFullYear() + 1);
		caseDetailsPage.changeTimetableDate(futureDate);
		caseDetailsPage.verifyDateChanges(lpaQuestionaire, futureDate);
		caseDetailsPage.validateBannerMessage('Success', 'Timetable updated');
	});

	it(`should change LPA statement due date`, { tags: tag.smoke }, () => {
		const lpaStatement = 'lpa-statement-due-date';
		caseDetailsPage.checkTimetableDueDateIsDisplayed(lpaStatement);
		caseDetailsPage.clickTimetableChangeLink(lpaStatement);
		let futureDate = new Date();
		futureDate.setFullYear(futureDate.getFullYear() + 1);
		caseDetailsPage.changeTimetableDate(futureDate);
		caseDetailsPage.verifyDateChanges(lpaStatement, futureDate);
		caseDetailsPage.validateBannerMessage('Success', 'Timetable updated');
	});

	it(`should change Interested party comments due date`, { tags: tag.smoke }, () => {
		const interestedParty = 'ip-comments-due-date';
		caseDetailsPage.checkTimetableDueDateIsDisplayed(interestedParty);
		caseDetailsPage.clickTimetableChangeLink(interestedParty);
		let futureDate = new Date();
		futureDate.setFullYear(futureDate.getFullYear() + 1);
		caseDetailsPage.changeTimetableDate(futureDate);
		caseDetailsPage.verifyDateChanges(interestedParty, futureDate);
		caseDetailsPage.validateBannerMessage('Success', 'Timetable updated');
	});

	it(`should change appellant final comments due date`, { tags: tag.smoke }, () => {
		const interestedParty = 'final-comments-due-date';
		caseDetailsPage.checkTimetableDueDateIsDisplayed(interestedParty);
		caseDetailsPage.clickTimetableChangeLink(interestedParty);
		let futureDate = new Date();
		futureDate.setFullYear(futureDate.getFullYear() + 1);
		caseDetailsPage.changeTimetableDate(futureDate);
		caseDetailsPage.verifyDateChanges(interestedParty, futureDate);
		caseDetailsPage.validateBannerMessage('Success', 'Timetable updated');
	});

	it(`should not accept current date`, { tags: tag.smoke }, () => {
		caseDetailsPage.checkTimetableDueDateIsDisplayed('lpa-questionnaire-due-date');
		caseDetailsPage.clickTimetableChangeLink('lpa-questionnaire-due-date');
		let currentDate = new Date();
		caseDetailsPage.changeTimetableDate(currentDate);
		caseDetailsPage.checkErrorMessageDisplays('Date must be in the future');
	});
});
