// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();

describe('Change site visit', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it(`Change visit from Site details`, () => {
		let visitDate = happyPathHelper.validVisitDate();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Visit Type', 'Unaccompanied');
			caseDetailsPage.elements.changeSetVisitType().click();
			caseDetailsPage.clickButtonByText('Manage the site visit');
			caseDetailsPage.selectRadioButtonByValue('Access Required');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit updated');
			caseDetailsPage.validateAnswer('Visit Type', 'Access required');
		});
	});

	it(`Change visit from case timetable`, () => {
		let visitDate = happyPathHelper.validVisitDate();

		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickSetUpSiteVisitType();
			caseDetailsPage.selectRadioButtonByValue('Access required');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			caseDetailsPage.validateAnswer('Visit Type', 'Access required');
			caseDetailsPage.clickChangeVisitTypeHasCaseTimetable();
			caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
			dateTimeSection.enterVisitDate(visitDate);
			dateTimeSection.enterVisitStartTime('08', '00');
			dateTimeSection.enterVisitEndTime('12', '00');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit updated');
			caseDetailsPage.validateAnswer('Visit Type', 'Unaccompanied');
		});
	});
});
