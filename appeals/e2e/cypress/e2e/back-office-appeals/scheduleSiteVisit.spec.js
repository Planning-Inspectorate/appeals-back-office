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
});
