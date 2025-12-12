// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AllCases } from '../../page_objects/allCases.js';
import { Page } from '../../page_objects/basePage.js';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper.js';

const dateTimeSection = new DateTimeSection();
const basePage = new Page();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();
const caseHistoryPage = new CaseHistoryPage();
const allCases = new AllCases();

let appeal;

let s78AppealRows = [
	'Is the appeal site part of an agricultural holding?',
	'Are you a tenant of the agricultural holding?',
	'Are there any other tenants?',
	'Development type',
	'How would you prefer us to decide your appeal?',
	'Why would you prefer this appeal procedure?',
	'How many days would you expect the inquiry to last?',
	'How many witnesses would you expect to give evidence at the inquiry?',
	'Plans, drawings and list of plans',
	'Separate ownership certificate and agricultural land declaration',
	'Design and access statement',
	'New plans or drawings',
	'What is the status of your planning obligation?',
	'Planning obligation',
	'Other new supporting documents',
	'Draft statement of common ground'
];

let s20AppealRows = s78AppealRows.slice(3);
let s20AppealRowsRemoved = s78AppealRows.slice(0, 3);

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

afterEach(() => {
	cy.deleteAppeals(appeal);
});

describe('From S78', () => {
	it('to HAS', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, true);
			});
			basePage.clickBackLink();

			//change appeal type
			happyPathHelper.changeAppealType(1);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Householder');

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, false);
			});
		});
	});

	it('to S20', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, true);
			});
			basePage.clickBackLink();

			happyPathHelper.changeAppealType(11);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Planning listed building and conservation area appeal');

			caseDetailsPage.clickReviewAppellantCase();
			s20AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, true);
			});
			s20AppealRowsRemoved.forEach((row) => {
				basePage.verifyRowExists(row, false);
			});
		});
	});
});

describe('From HAS', () => {
	it('to S78', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, false);
			});
			basePage.clickBackLink();

			happyPathHelper.changeAppealType(9);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Planning appeal');

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, true);
			});
		});
	});

	it('to S20', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s78AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, false);
			});
			basePage.clickBackLink();

			happyPathHelper.changeAppealType(11);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Planning listed building and conservation area appeal');

			//view appellant case
			caseDetailsPage.clickReviewAppellantCase();
			s20AppealRows.forEach((row) => {
				basePage.verifyRowExists(row, true);
			});
		});
	});
});

describe('Case history', () => {
	it('Case history entry added', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//change appeal type
			happyPathHelper.changeAppealType(1);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Householder');

			//case history
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue('Appeal type updated to Householder');
		});
	});

	it('Case history entry added - resubmit', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//change appeal type
			happyPathHelper.changeAppealTypeResubmit(1);
			caseDetailsPage.verifyAppealType('Planning appeal');

			//case history
			caseDetailsPage.clickViewCaseHistory();
			caseHistoryPage.verifyCaseHistoryValue('Appeal reviewed as invalid: wrong appeal type');
		});
	});
});

describe('Notify', () => {
	it('Notify sent', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);

			//change appeal type
			happyPathHelper.changeAppealType(1);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			caseDetailsPage.verifyAppealType('Householder');

			const expectedNotifies = [
				{
					template: 'appeal-type-change-in-manage-appeals-appellant',
					recipient: 'agent@test.com'
				},
				{
					template: 'appeal-type-change-in-manage-appeals-lpa',
					recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
				}
			];

			cy.checkNotifySent(caseObj, expectedNotifies);
		});
	});

	it('Notify sent - resubmit', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.changeAppealTypeResubmit(9);

			const expectedNotifies = [
				{
					template: 'appeal-type-change-non-has',
					recipient: 'agent@test.com'
				}
			];

			cy.checkNotifySent(caseObj, expectedNotifies);
		});
	});
});

describe('Other', () => {
	it('All cases reflects new appeal type', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			//all cases
			basePage.navigateToAppealsService();
			allCases.verifyappealType(caseObj, 'Planning appeal');

			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.changeAppealType(1);
			caseDetailsPage.verifyAppealType('Householder');

			//all cases
			basePage.navigateToAppealsService();
			allCases.verifyappealType(caseObj, 'Householder');
		});
	});

	it('Change appeal type and resubmit', () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.changeAppealTypeResubmit(9);
			caseDetailsPage.checkStatusOfCase('Invalid', 0);
			caseDetailsPage.verifyAppealType('Householder');
		});
	});
});
