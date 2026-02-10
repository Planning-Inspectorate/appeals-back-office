import { users } from '../../fixtures/users';
import { Page } from '../../page_objects/basePage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const basePage = new Page();
let caseObj;

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

afterEach(() => {
	cy.deleteAppeals(appeal);
});

it('review appellant statement entry point', () => {
	cy.addLpaqSubmissionToCase(caseObj);
	cy.reviewLpaqSubmission(caseObj);
	cy.addAppellantStatementToCase(caseObj);

	cy.visit(urlPaths.personalListFilteredStatement);
	basePage.verifyActionRequiredLink(caseObj.reference, 'Review appellant statement');
});
