import { users } from '../../fixtures/users';
import { PersonalListPage } from '../../page_objects/caseDetails/personalListPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

let caseObj;
const personalListPage = new PersonalListPage();

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		caseObj = ref;
		appeal = caseObj;
		happyPathHelper.viewCaseDetails(caseObj);

		// Assign Case Officer Via API
		cy.assignCaseOfficerViaApi(caseObj);

		// Validate Appeal Via API
		cy.getBusinessActualDate(new Date(), 0).then((date) => {
			cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
		});

		// Start Inquiry Via API
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			cy.addInquiryViaApi(caseObj, inquiryDate);
		});
		cy.reload();
	});
};
beforeEach(() => {
	setupTestCase();
});

let appeal;

// afterEach(() => {
// 	cy.deleteAppeals(appeal);
// });

it.skip('Display Review CTA for appellant statement on personal list page', () => {
	cy.addLpaqSubmissionToCase(caseObj);
	cy.reviewLpaqSubmission(caseObj);
	cy.addAppellantStatementToCase(caseObj);

	cy.visit(urlPaths.personalListFilteredStatement);
	personalListPage.verifyActionRequiredLink(caseObj.reference, 'Review appellant statement');
});
