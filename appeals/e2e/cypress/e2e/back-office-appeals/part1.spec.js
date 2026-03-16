import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';

const caseDetailsPage = new CaseDetailsPage();

describe('part1 appeal', () => {
	let cases = [];

	afterEach(() => {
		if (cases.length > 0) {
			cy.deleteAppeals(cases);
		}
	});

	let caseObj;
	let appeal;
	const appealTypeS78 = 'S78';
	const setupTestCase = (appealType = appealTypeS78, caseType = 'W') => {
		cy.login(users.appeals.caseAdmin);
		return cy.createCase({ caseType, planningObligation: true }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			cases.push(caseObj.id);
			happyPathHelper.advanceTo(
				caseObj,
				'ASSIGN_CASE_OFFICER',
				'READY_TO_START',
				appealType,
				'INQUIRY'
			);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		});
	};

	it('check Part 1 radio button', { tags: tag.smoke }, () => {
		setupTestCase().then(() => {
			happyPathHelper.startCaseWithProcedureType(caseObj, 'Part 1');
			caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
		});
	});

	it('check Part 1 radio button not visible', { tags: tag.smoke }, () => {
		setupTestCase('S20', 'Y').then(() => {
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.clickReadyToStartCase();
			caseDetailsPage.basePageElements
				.radioButton()
				.contains('Part 1', { matchCase: false })
				.should('not.exist');
		});
	});
});
