// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { Page } from '../../page_objects/basePage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';
import { formatDateAndTime } from '../../support/utils/format';

const basePage = new Page();
const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();

const now = new Date();
const formattedDate = formatDateAndTime(now);

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

describe('link appeals - S78', () => {
	it('Link an unlinked appeal to an unlinked appeal (from lead)', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCase, childCase);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//Notify
				const expectedNotifies = [
					{
						template: 'link-appeal',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'link-appeal',
						recipient: 'agent@test.com'
					}
				];

				cy.checkNotifySent(leadCase, expectedNotifies);
			});
		});
	});

	it('Link an unlinked appeal to an unlinked appeal (from child)', () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(childCase);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCase, leadCase);
				caseDetailsPage.checkStatusOfCase('Child', 1);

				//Notify
				const expectedNotifies = [
					{
						template: 'link-appeal',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'link-appeal',
						recipient: 'agent@test.com'
					}
				];

				cy.checkNotifySent(childCase, expectedNotifies);
			});
		});
	});

	it('As a lead appeal with a child, link another unlinked case', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase1) => {
				cy.createCase({ caseType: 'W' }).then((childCase2) => {
					happyPathHelper.assignCaseOfficer(leadCase);

					happyPathHelper.addLinkedAppeal(leadCase, childCase1);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					happyPathHelper.addLinkedAppeal(leadCase, childCase2, false);

					//case details
					caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
					caseDetailsPage.elements.linkedAppeal().should('have.length', 2);
				});
			});
		});
	});

	it('Visit the first linked appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCase, childCase);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//child appeal
				caseDetailsPage.clickLinkedAppeal(childCase);
				caseDetailsPage.verifyAppealRefOnCaseDetails(childCase);
			});
		});
	});

	it('Issue a decision for linked appeals', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase) => {
				cy.createCase({ caseType: 'W' }).then((childCase2) => {
					const cases = [leadCase, childCase, childCase2];
					const children = cases.slice(1);

					cases.forEach((caseRef) => {
						cy.addLpaqSubmissionToCase(caseRef);
					});

					children.forEach((child) => {
						happyPathHelper.assignCaseOfficer(child);
						happyPathHelper.reviewAppellantCase(child);
					});

					happyPathHelper.assignCaseOfficer(leadCase);

					//link appeals
					happyPathHelper.addLinkedAppeal(leadCase, childCase);
					happyPathHelper.addLinkedAppeal(leadCase, childCase2, false);

					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.verifyNumberOfLinkedAppeals(2);

					happyPathHelper.reviewAppellantCase(leadCase);
					happyPathHelper.startS78Case(leadCase, 'written');
					caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

					//review child LPAQs
					children.forEach((child) => {
						happyPathHelper.viewCaseDetails(child);
						happyPathHelper.reviewS78Lpaq(child);
					});

					//review lead LPAQ
					happyPathHelper.viewCaseDetails(leadCase);
					happyPathHelper.reviewS78Lpaq(leadCase);
					caseDetailsPage.checkStatusOfCase('Statements', 0);

					//add IP comments
					happyPathHelper.addThirdPartyComment(leadCase, true);
					caseDetailsPage.clickBackLink();
					happyPathHelper.addThirdPartyComment(leadCase, false);
					caseDetailsPage.clickBackLink();

					//add LPA statement
					happyPathHelper.addLpaStatement(leadCase);
					cy.simulateStatementsDeadlineElapsed(leadCase);
					cy.reload();

					caseDetailsPage.basePageElements.bannerLink().click();
					caseDetailsPage.clickButtonByText('Confirm');
					caseDetailsPage.checkStatusOfCase('Final comments', 0);

					//add final comments
					happyPathHelper.addLpaFinalComment(leadCase);
					cy.loadAppealDetails(leadCase).then((appealData) => {
						const serviceUserId = (
							(appealData?.appellant?.serviceUserId ?? 0) + 200000000
						).toString();
						happyPathHelper.addAppellantFinalComment(leadCase, serviceUserId);
					});
					cy.simulateFinalCommentsDeadlineElapsed(leadCase).then(() => {
						cy.reload();
					});

					//share final comments
					caseDetailsPage.basePageElements.bannerLink().click();
					caseDetailsPage.clickButtonByText('Share final comments');
					caseDetailsPage.checkStatusOfCase('Site visit ready to set up', 0);

					//site visit
					happyPathHelper.setupSiteVisitFromBanner(leadCase);
					cy.simulateSiteVisit(leadCase).then(() => {
						cy.reload();
					});

					//issue decision
					happyPathHelper.issueLinkedAppealDecisions(leadCase, 'Allowed', 2);

					//Case details
					caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
					caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');

					cases.forEach((caseRef) => {
						happyPathHelper.viewCaseDetails(caseRef);
						caseDetailsPage.checkStatusOfCase('Complete', 0);
						caseDetailsPage.checkDecisionOutcome(`Decision: Allowed`);
						caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
					});
				});
			});
		});
	});
});

describe('Unhappy path', () => {
	it('As a lead appeal, I am unable to link an already linked child case', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase1) => {
			cy.createCase({ caseType: 'W' }).then((leadCase2) => {
				cy.createCase({ caseType: 'W' }).then((childCase) => {
					happyPathHelper.assignCaseOfficer(leadCase1);

					happyPathHelper.addLinkedAppeal(leadCase1, childCase);
					caseDetailsPage.checkStatusOfCase('Lead', 1);

					//2nd lead case
					happyPathHelper.assignCaseOfficer(leadCase2);

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCase);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.checkHeading(`You have already linked appeal ${childCase}`);
				});
			});
		});
	});

	it('As a lead appeal, I am unable to link to another lead appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase1) => {
			cy.createCase({ caseType: 'W' }).then((leadCase2) => {
				cy.createCase({ caseType: 'W' }).then((childCase1) => {
					cy.createCase({ caseType: 'W' }).then((childCase2) => {
						happyPathHelper.assignCaseOfficer(leadCase1);

						happyPathHelper.addLinkedAppeal(leadCase1, childCase1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCase2);

						happyPathHelper.addLinkedAppeal(leadCase2, childCase2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//link lead appeals together
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(leadCase1);
						caseDetailsPage.clickButtonByText('Continue');

						//exit page
						caseDetailsPage.checkHeading(`You have already linked appeal ${leadCase1}`);
					});
				});
			});
		});
	});

	it('As a child appeal, I am unable to link to another child appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase1) => {
			cy.createCase({ caseType: 'W' }).then((leadCase2) => {
				cy.createCase({ caseType: 'W' }).then((childCase1) => {
					cy.createCase({ caseType: 'W' }).then((childCase2) => {
						happyPathHelper.assignCaseOfficer(leadCase1);

						happyPathHelper.addLinkedAppeal(leadCase1, childCase1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCase2);
						happyPathHelper.addLinkedAppeal(leadCase2, childCase2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//attempt to add a child appeal from a child appeal
						happyPathHelper.viewCaseDetails(childCase1);
						caseDetailsPage.checkAddLinkedAppealDoesNotExist();
					});
				});
			});
		});
	});

	it('Cannot link from cases beyond LPAQ', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase) => {
				cy.addLpaqSubmissionToCase(leadCase);
				happyPathHelper.assignCaseOfficer(leadCase);
				happyPathHelper.reviewAppellantCase(leadCase);
				happyPathHelper.startS78Case(leadCase, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				happyPathHelper.reviewS78Lpaq(leadCase);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				//link appeal
				caseDetailsPage.checkAddLinkedAppealDoesNotExist();
			});
		});
	});

	it('Cannot link to cases beyond LPAQ', () => {
		cy.createCase({ caseType: 'W' }).then((leadCase) => {
			cy.createCase({ caseType: 'W' }).then((childCase) => {
				cy.addLpaqSubmissionToCase(childCase);
				happyPathHelper.assignCaseOfficer(childCase);
				happyPathHelper.reviewAppellantCase(childCase);
				happyPathHelper.startS78Case(childCase, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				happyPathHelper.reviewS78Lpaq(childCase);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				happyPathHelper.assignCaseOfficer(leadCase);

				//link appeal
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(childCase);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.checkHeading(`You cannot link appeal ${childCase}`);
			});
		});
	});
});
