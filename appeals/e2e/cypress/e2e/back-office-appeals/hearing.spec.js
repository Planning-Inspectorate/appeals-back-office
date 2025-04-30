/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

describe('Setup hearing and add hearing estimates', () => {
	let caseRef;

	before(() => {
		setupTestCase();
	});

	beforeEach(() => {
		navigateToHearingSection();
	});

	it('should not accept current date with no time - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		caseDetailsPage.setUpHearing(new Date(), ' ', ' ');

		verifyErrorMessages({
			messages: [
				'Hearing date must be in the future',
				'The time must include an hour',
				'The time must include a minute'
			],
			fields: ['hearing-time-hour', 'hearing-time-minute']
		});
	});

	it('should navigate back to overview page - Hearing Time', () => {
		caseDetailsPage.clickHearingButton();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef} - set up hearing`);
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
	});

	it('should not accept invalid input - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		caseDetailsPage.addHearingEstimates('0.25', 'sittingTime', '99.5');

		verifyErrorMessages({
			messages: [
				'Estimated preparation time must be in increments of 0.5',
				'Estimated sitting time must be a number',
				'Estimated reporting time must be between 0 and 99'
			],
			fields: ['preparation-time', 'sitting-time', 'reporting-time'],
			verifyInlineErrors: true
		});
	});

	it('should navigate back to overview page - Hearing Estimate', () => {
		caseDetailsPage.clickHearingEstimateLink();
		caseDetailsPage.validateSectionHeader('Hearing estimates');
		caseDetailsPage.clickBackLink();
		caseDetailsPage.verifyAppealRefOnCaseDetails(`Appeal ${caseRef}`);
		caseDetailsPage.verifyHearingSectionIsDisplayed();
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseRef = ref;
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
			happyPathHelper.startS78Case(caseRef, 'hearing');
		});
	};

	const navigateToHearingSection = () => {
		cy.clearAllSessionStorage();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAccordionByText('Hearing');
	};

	const verifyErrorMessages = (options) => {
		options.messages.forEach((message) => {
			caseDetailsPage.checkErrorMessageDisplays(message);
		});

		options.fields.forEach((field) => {
			caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(field, 'name', field);
			if (options.verifyInlineErrors) {
				caseDetailsPage.verifyInlineErrorMessage(`${field}-error`);
			}
		});
	};
});
