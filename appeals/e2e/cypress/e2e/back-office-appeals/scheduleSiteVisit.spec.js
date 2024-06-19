// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Schedule site visit', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	const visitTypeTestCases = ['Accompanied', 'Access required', 'Unaccompanied'];

	visitTypeTestCases.forEach((visitType, index) => {
		it.only(`Change to ${visitType} visit from Site details`, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);

				caseDetailsPage.clickChangeVisitTypeHasSiteDetails();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage(
					'Site visit scheduled',
					'Appeal reference ' + caseRef
				);
				caseDetailsPage.clickLinkByText('Go back to case details');
				caseDetailsPage.validateAnswer('Visit Type', visitType);
			});
		});

		it.only(`Change to ${visitType} site visit with time from case timetable`, () => {
			let visitDate = happyPathHelper.validVisitDate();

			cy.createCase().then((caseRef) => {
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);

				caseDetailsPage.clickChangeVisitTypeHasCaseTimetable();
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
				dateTimeSection.enterVisitDate(visitDate);
				dateTimeSection.enterVisitStartTime('08', '00');
				dateTimeSection.enterVisitEndTime('12', '00');
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.validateConfirmationPanelMessage(
					'Site visit scheduled',
					'Appeal reference ' + caseRef
				);
				caseDetailsPage.clickLinkByText('Go back to case details');
				caseDetailsPage.validateAnswer('Visit type', visitType);
			});
		});
	});
});
