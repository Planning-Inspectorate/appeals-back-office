// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { Page } from '../../page_objects/basePage.js';
import { CostsSectionPage } from '../../page_objects/caseDetails/costsSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage.js';
import { FileUploader, ManageDocument } from '../../page_objects/shared.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';
import { urlPaths } from '../../support/urlPaths.js';
import { formatDateAndTime } from '../../support/utils/format';

const basePage = new Page();
const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const costsSectionPage = new CostsSectionPage();
const dateTimeSection = new DateTimeSection();
const fileUploader = new FileUploader();
const manageDocument = new ManageDocument();

const now = new Date();
const formattedDate = formatDateAndTime(now);
const pdf = fileUploader.sampleFiles.pdf;
const doc = fileUploader.sampleFiles.document;
const img = fileUploader.sampleFiles.img;

let cases = [];

const timetableItems = [
	{
		row: 'lpa-statement-due-date',
		editable: true
	}
];

beforeEach(() => {
	cy.login(users.appeals.caseAdmin);
});

afterEach(() => {
	cy.deleteAppeals(cases);
});

describe('Link appeals', () => {
	it('Link an unlinked appeal to an unlinked appeal (from lead)', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				happyPathHelper.assignCaseOfficer(leadCaseObj);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
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

				cy.checkNotifySent(leadCaseObj, expectedNotifies);
			});
		});
	});

	it('Link an unlinked appeal to an unlinked appeal (from child)', () => {
		cy.createCase().then((leadCaseObj) => {
			cy.createCase().then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				happyPathHelper.assignCaseOfficer(childCaseObj);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCaseObj, leadCaseObj);
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

				cy.checkNotifySent(childCaseObj, expectedNotifies);
			});
		});
	});

	it('As a lead appeal with a child, link another unlinked case', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
					cases = [leadCaseObj, childCaseObj1, childCaseObj2];

					happyPathHelper.assignCaseOfficer(leadCaseObj);
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj1);
					caseDetailsPage.checkStatusOfCase('Lead', 1);
					caseDetailsPage.verifyNumberOfLinkedAppeals(1);
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj2, false);
					caseDetailsPage.verifyNumberOfLinkedAppeals(2);
					caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
				});
			});
		});
	});

	it('Visit the first linked appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				happyPathHelper.assignCaseOfficer(leadCaseObj);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//child appeal
				caseDetailsPage.clickLinkedAppeal(childCaseObj);
				caseDetailsPage.verifyAppealRefOnCaseDetails(childCaseObj.reference);
			});
		});
	});
});

describe('Hidden elements', () => {
	it('Start CTA on child appeals are hidden when at "Ready to start" stage', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				happyPathHelper.assignCaseOfficer(leadCaseObj);

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				caseDetailsPage.verifyActionExists('Start date', true);

				//child appeal
				happyPathHelper.reviewAppellantCase(childCaseObj);
				caseDetailsPage.checkStatusOfCase('Ready to start', 0);
				caseDetailsPage.checkStatusOfCase('Child', 1);
				caseDetailsPage.verifyActionExists('Start date', false);
			});
		});
	});

	it.skip('Change CTA on child appeals are hidden on timetable section', () => {});

	it('Cancel CTA is hidden on linked appeals', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);
				caseDetailsPage.verifyLinkExists('Cancel appeal', true);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				caseDetailsPage.verifyLinkExists('Cancel appeal', true);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				caseDetailsPage.verifyLinkExists('Cancel appeal', false);

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				caseDetailsPage.verifyLinkExists('Cancel appeal', false);
			});
		});
	});

	it('Change CTA is hidden on appeal procedure row on linked appeals', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				caseDetailsPage.verifyActionExists('Appeal procedure', false);

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				caseDetailsPage.verifyActionExists('Appeal procedure', false);
			});
		});
	});
});

describe.only('Net residences', () => {
	it('Net residence banner is only displayed on the lead appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((appeal) => {
					cy.addLpaqSubmissionToCase(appeal);
				});

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				happyPathHelper.reviewS78Lpaq(leadCaseObj);

				//child appeal
				happyPathHelper.reviewS78Lpaq(childCaseObj);
				caseDetailsPage.validateBannerMessage(
					'Important',
					'Add number of residential units',
					false
				);

				//lead appeal
				happyPathHelper.viewCaseDetails(leadCaseObj);
				caseDetailsPage.validateBannerMessage('Important', 'Add number of residential units');
			});
		});
	});

	it('Net residence rows are not visible on the child appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((appeal) => {
					cy.addLpaqSubmissionToCase(appeal);
				});

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				happyPathHelper.reviewS78Lpaq(leadCaseObj);

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				happyPathHelper.reviewS78Lpaq(childCaseObj);

				//lead appeal
				happyPathHelper.viewCaseDetails(leadCaseObj);
				happyPathHelper.addNetResidences('Net gain', '4');
				caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added'),
					caseDetailsPage.verifyRowValue('Net gain', '4');

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				caseDetailsPage.validateBannerExists(false);
				caseDetailsPage.verifyRowExists('Net gain', false);
			});
		});
	});

	//A2-4950
	it('Net residence case history entries only appear on the lead appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((appeal) => {
					cy.addLpaqSubmissionToCase(appeal);
				});

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				happyPathHelper.reviewS78Lpaq(leadCaseObj);

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				happyPathHelper.reviewS78Lpaq(childCaseObj);

				//lead appeal
				happyPathHelper.viewCaseDetails(leadCaseObj);
				happyPathHelper.addNetResidences('Net gain', '4');
				caseDetailsPage.validateBannerMessage('Success', 'Number of residential units added'),
					caseDetailsPage.clickViewCaseHistory();
				caseDetailsPage.verifyTableCellTextCaseHistory('Case updated');

				//child appeal
				happyPathHelper.viewCaseDetails(childCaseObj);
				caseDetailsPage.clickViewCaseHistory();
				caseDetailsPage.verifyTableCellTextCaseHistory('Case updated', false);
			});
		});
	});
});

describe('Timetable', () => {
	it('Timetable changes are reflected on child appeals', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((appeal) => {
					cy.addLpaqSubmissionToCase(appeal);
				});

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');

				//update statements due date
				caseDetailsPage.appeal;
				caseDetailsPage.verifyActionExists('LPA statement due', true);
				caseDetailsPage.clickRowChangeLink('lpa-statement-due-date');
				cy.getBusinessActualDate(new Date(), 14).then((dueDate) => {
					const formattedDate = formatDateAndTime(dueDate);
					caseDetailsPage.changeTimetableDates(timetableItems, dueDate, 0);
					basePage.clickButtonByText('Update timetable due dates');
					caseDetailsPage.verifyRowValue('LPA statement due', formattedDate.date);

					//child apppeal
					happyPathHelper.viewCaseDetails(childCaseObj);
					caseDetailsPage.verifyRowValue('LPA statement due', formattedDate.date);
				});
			});
		});
	});

	//A2-4902
	it.skip('Timetable changes are reflected in case history', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((appeal) => {
					cy.addLpaqSubmissionToCase(appeal);
				});

				//child appeal
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				//lead appeal
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');

				//update statements due date
				caseDetailsPage.appeal;
				caseDetailsPage.verifyActionExists('LPA statement due', true);
				caseDetailsPage.clickRowChangeLink('lpa-statement-due-date');
				cy.getBusinessActualDate(new Date(), 14).then((dueDate) => {
					const formattedDate = formatDateAndTime(dueDate);
					caseDetailsPage.changeTimetableDates(timetableItems, dueDate, 0);
					basePage.clickButtonByText('Update timetable due dates');
					caseDetailsPage.verifyRowValue('LPA statement due', formattedDate.date);

					//case history
					caseDetailsPage.clickViewCaseHistory();
					caseDetailsPage.verifyTableCellTextCaseHistory(
						`Statements due date changed to ${formattedDate.date}`
					);

					//child apppeal
					happyPathHelper.viewCaseDetails(childCaseObj);
					caseDetailsPage.clickViewCaseHistory();
					caseDetailsPage.verifyTableCellTextCaseHistory(
						`Statements due date changed to ${formattedDate.date}`,
						false
					);
				});
			});
		});
	});
});

describe('Site visit', () => {
	it('Arrange a site visit - S78', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cases.forEach((caseObj) => {
					cy.addLpaqSubmissionToCase(caseObj);
				});

				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);

				happyPathHelper.assignCaseOfficer(leadCaseObj);

				//link appeals
				happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

				//review child LPAQs
				happyPathHelper.viewCaseDetails(childCaseObj);
				happyPathHelper.reviewS78Lpaq(childCaseObj);

				//review lead LPAQ
				happyPathHelper.viewCaseDetails(leadCaseObj);
				happyPathHelper.reviewS78Lpaq(leadCaseObj);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				//add IP comments
				happyPathHelper.addThirdPartyComment(leadCaseObj, true);
				caseDetailsPage.clickBackLink();

				//add LPA statement
				happyPathHelper.addLpaStatement(leadCaseObj);
				cy.simulateStatementsDeadlineElapsed(leadCaseObj);
				cy.reload();

				caseDetailsPage.basePageElements.bannerLink().click();
				caseDetailsPage.clickButtonByText('Confirm');
				caseDetailsPage.checkStatusOfCase('Final comments', 0);

				//add final comments
				happyPathHelper.addLpaFinalComment(leadCaseObj);
				cy.loadAppealDetails(leadCaseObj).then((appealData) => {
					const serviceUserId = (
						(appealData?.appellant?.serviceUserId ?? 0) + 200000000
					).toString();
					happyPathHelper.addAppellantFinalComment(leadCaseObj, serviceUserId);
				});
				cy.simulateFinalCommentsDeadlineElapsed(leadCaseObj).then(() => {
					cy.reload();
				});

				//share final comments
				happyPathHelper.shareFinalComments(leadCaseObj);

				//SITE VISIT
				const readyTagText = 'Site visit ready to set up';
				const awaitingTagText = 'Awaiting site visit';

				//lead case details
				happyPathHelper.viewCaseDetails(leadCaseObj);
				caseDetailsPage.checkStatusOfCase(readyTagText, 0);

				//child case details
				happyPathHelper.viewCaseDetails(childCaseObj);
				caseDetailsPage.checkStatusOfCase(readyTagText, 0);
				basePage.verifySectionHeaderExists('Site', false);

				//personal list
				cy.visit(urlPaths.personalList);
				cases.forEach((caseObj) => {
					basePage.verifyTagOnPersonalListPage(caseObj.reference, readyTagText);
				});

				//all cases
				cy.visit(urlPaths.allCases);
				cases.forEach((caseObj) => {
					basePage.verifyTagOnAllCasesPage(caseObj.reference, readyTagText);
				});

				//arrange site visit
				happyPathHelper.viewCaseDetails(leadCaseObj);
				happyPathHelper.setupSiteVisitFromBanner(leadCaseObj);

				cases.forEach((caseObj) => {
					happyPathHelper.viewCaseDetails(caseObj);
					caseDetailsPage.checkStatusOfCase(awaitingTagText, 0);
				});

				//personal list
				cy.visit(urlPaths.personalList);
				cases.forEach((caseObj) => {
					basePage.verifyTagOnPersonalListPage(caseObj.reference, awaitingTagText);
					cy.log(leadCaseObj.reference);
				});

				//all cases
				cy.visit(urlPaths.allCases);
				cases.forEach((caseObj) => {
					basePage.verifyTagOnAllCasesPage(caseObj.reference, awaitingTagText);
				});

				//notify
				const expectedNotifies = [
					{
						template: 'site-visit-schedule-accompanied-lpa',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'site-visit-schedule-accompanied-appellant',
						recipient: 'agent@test.com'
					}
				];
				cy.checkNotifySent(leadCaseObj, expectedNotifies);
			});
		});
	});
});

describe('Issue Decision', () => {
	it('Issue a decision with costs for linked appeals - S78', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
					cases = [leadCaseObj, childCaseObj1, childCaseObj2];
					const children = cases.slice(1);

					cases.forEach((caseRef) => {
						cy.addLpaqSubmissionToCase(caseRef);
					});

					children.forEach((child) => {
						happyPathHelper.assignCaseOfficer(child);
						happyPathHelper.reviewAppellantCase(child);
					});

					happyPathHelper.assignCaseOfficer(leadCaseObj);

					//link appeals
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj1);
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj2, false);

					caseDetailsPage.checkStatusOfCase('Lead', 1);

					happyPathHelper.reviewAppellantCase(leadCaseObj);
					happyPathHelper.startS78Case(leadCaseObj, 'written');
					caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

					//review child LPAQs
					children.forEach((child) => {
						happyPathHelper.viewCaseDetails(child);
						happyPathHelper.reviewS78Lpaq(child);
					});

					//review lead LPAQ
					happyPathHelper.viewCaseDetails(leadCaseObj);
					happyPathHelper.reviewS78Lpaq(leadCaseObj);
					caseDetailsPage.checkStatusOfCase('Statements', 0);

					//add IP comments
					happyPathHelper.addThirdPartyComment(leadCaseObj, true);
					caseDetailsPage.clickBackLink();
					happyPathHelper.addThirdPartyComment(leadCaseObj, false);
					caseDetailsPage.clickBackLink();

					//add LPA statement
					happyPathHelper.addLpaStatement(leadCaseObj);
					cy.simulateStatementsDeadlineElapsed(leadCaseObj);
					cy.reload();

					caseDetailsPage.basePageElements.bannerLink().click();
					caseDetailsPage.clickButtonByText('Confirm');
					caseDetailsPage.checkStatusOfCase('Final comments', 0);

					//add final comments
					happyPathHelper.addLpaFinalComment(leadCaseObj);
					cy.loadAppealDetails(leadCaseObj).then((appealData) => {
						const serviceUserId = (
							(appealData?.appellant?.serviceUserId ?? 0) + 200000000
						).toString();
						happyPathHelper.addAppellantFinalComment(leadCaseObj, serviceUserId);
					});
					cy.simulateFinalCommentsDeadlineElapsed(leadCaseObj).then(() => {
						cy.reload();
					});

					//share final comments
					happyPathHelper.shareFinalComments(leadCaseObj);

					//site visit
					happyPathHelper.setupSiteVisitFromBanner(leadCaseObj);
					cy.simulateSiteVisit(leadCaseObj).then(() => {
						cy.reload();
					});

					//decision, number of children, costs present
					happyPathHelper.issueLinkedAppealDecisions('Allowed', children.length, 'both costs');

					//case details
					caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');
					caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');

					cases.forEach((caseRef) => {
						happyPathHelper.viewCaseDetails(caseRef);
						caseDetailsPage.checkStatusOfCase('Complete', 0);
						caseDetailsPage.checkDecisionOutcome(`Decision: Allowed`);
						caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
					});

					//notify
					const expectedNotifies = [
						{
							template: 'decision-is-allowed-split-dismissed-lpa',
							recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
						},
						{
							template: 'decision-is-allowed-split-dismissed-appellant',
							recipient: 'agent@test.com'
						}
					];

					cy.checkNotifySent(leadCaseObj, expectedNotifies);
				});
			});
		});
	});

	it('Cost decisions - appellant withdrawn', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
					const cases = [leadCaseObj, childCaseObj1, childCaseObj2];
					const children = cases.slice(1);

					cases.forEach((caseObj) => {
						cy.addLpaqSubmissionToCase(caseObj);
					});

					children.forEach((childCaseObj1) => {
						happyPathHelper.assignCaseOfficer(childCaseObj1);
						happyPathHelper.reviewAppellantCase(childCaseObj1);
					});

					happyPathHelper.assignCaseOfficer(leadCaseObj);

					//link appeals
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj1);
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj2, false);

					caseDetailsPage.checkStatusOfCase('Lead', 1);

					happyPathHelper.reviewAppellantCase(leadCaseObj);
					happyPathHelper.startS78Case(leadCaseObj, 'written');
					caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

					//review child LPAQs
					children.forEach((child) => {
						happyPathHelper.viewCaseDetails(child);
						happyPathHelper.reviewS78Lpaq(child);
					});

					//review lead LPAQ
					happyPathHelper.viewCaseDetails(leadCaseObj);
					happyPathHelper.reviewS78Lpaq(leadCaseObj);
					caseDetailsPage.checkStatusOfCase('Statements', 0);

					//add IP comments
					happyPathHelper.addThirdPartyComment(leadCaseObj, true);
					caseDetailsPage.clickBackLink();
					happyPathHelper.addThirdPartyComment(leadCaseObj, false);
					caseDetailsPage.clickBackLink();

					//add LPA statement
					happyPathHelper.addLpaStatement(leadCaseObj);
					cy.simulateStatementsDeadlineElapsed(leadCaseObj);
					cy.reload();

					caseDetailsPage.basePageElements.bannerLink().click();
					caseDetailsPage.clickButtonByText('Confirm');
					caseDetailsPage.checkStatusOfCase('Final comments', 0);

					//add final comments
					happyPathHelper.addLpaFinalComment(leadCaseObj);
					cy.loadAppealDetails(leadCaseObj).then((appealData) => {
						const serviceUserId = (
							(appealData?.appellant?.serviceUserId ?? 0) + 200000000
						).toString();
						happyPathHelper.addAppellantFinalComment(leadCaseObj, serviceUserId);
					});
					cy.simulateFinalCommentsDeadlineElapsed(leadCaseObj).then(() => {
						cy.reload();
					});

					//share final comments
					happyPathHelper.shareFinalComments(leadCaseObj);

					//site visit
					happyPathHelper.setupSiteVisitFromBanner(leadCaseObj);
					cy.simulateSiteVisit(leadCaseObj).then(() => {
						cy.reload();
					});

					caseDetailsPage.clickManageAppellantCostApplication();
					manageDocument.verifyNumberOfDocuments(3);
					manageDocument.clickBackLink();

					caseDetailsPage.clickAddAppellantWithdrawal();
					fileUploader.uploadFiles([pdf, doc, img]);
					fileUploader.clickButtonByText('Continue');
					fileUploader.clickButtonByText('Confirm');
					fileUploader.clickButtonByText('Confirm');

					caseDetailsPage.clickManageAppellanCostWithdrawal();
					manageDocument.verifyNumberOfDocuments(3);
					manageDocument.clickBackLink();

					//issue decision
					//leadcase, decision, number of children, costs present, issueCosts
					happyPathHelper.issueLinkedAppealDecisions(
						'Allowed',
						children.length,
						'lpa only',
						true,
						true
					);

					//case details
					caseDetailsPage.checkDecisionOutcome('LPA costs decision: Issued');

					cases.forEach((caseObj) => {
						happyPathHelper.viewCaseDetails(caseObj.reference);
						caseDetailsPage.checkStatusOfCase('Complete', 0);
						caseDetailsPage.checkDecisionOutcome(`Decision: Allowed`);
						caseDetailsPage.checkDecisionOutcome(`Decision issued on ${formattedDate.date}`);
					});
				});
			});
		});
	});

	it('Cost decisions - lpa withdrawn', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
					const cases = [leadCaseObj, childCaseObj1, childCaseObj2];
					const children = cases.slice(1);

					cases.forEach((caseObj) => {
						cy.addLpaqSubmissionToCase(caseObj.reference);
					});

					children.forEach((childCaseObj) => {
						happyPathHelper.assignCaseOfficer(childCaseObj.reference);
						happyPathHelper.reviewAppellantCase(childCaseObj.reference);
					});

					happyPathHelper.assignCaseOfficer(leadCaseObj);

					//link appeals
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj);
					happyPathHelper.addLinkedAppeal(leadCaseObj, childCaseObj2, false);

					caseDetailsPage.checkStatusOfCase('Lead', 1);

					happyPathHelper.reviewAppellantCase(leadCaseObj);
					happyPathHelper.startS78Case(leadCaseObj, 'written');
					caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

					//review child LPAQs
					children.forEach((child) => {
						happyPathHelper.viewCaseDetails(child);
						happyPathHelper.reviewS78Lpaq(child);
					});

					//review lead LPAQ
					happyPathHelper.viewCaseDetails(leadCaseObj);
					happyPathHelper.reviewS78Lpaq(leadCaseObj);
					caseDetailsPage.checkStatusOfCase('Statements', 0);

					//add IP comments
					happyPathHelper.addThirdPartyComment(leadCaseObj, true);
					caseDetailsPage.clickBackLink();
					happyPathHelper.addThirdPartyComment(leadCaseObj, false);
					caseDetailsPage.clickBackLink();

					//add LPA statement
					happyPathHelper.addLpaStatement(leadCaseObj);
					cy.simulateStatementsDeadlineElapsed(leadCaseObj);
					cy.reload();

					caseDetailsPage.basePageElements.bannerLink().click();
					caseDetailsPage.clickButtonByText('Confirm');
					caseDetailsPage.checkStatusOfCase('Final comments', 0);

					//add final comments
					happyPathHelper.addLpaFinalComment(leadCaseObj);
					cy.loadAppealDetails(leadCaseObj).then((appealData) => {
						const serviceUserId = (
							(appealData?.appellant?.serviceUserId ?? 0) + 200000000
						).toString();
						happyPathHelper.addAppellantFinalComment(leadCaseObj, serviceUserId);
					});
					cy.simulateFinalCommentsDeadlineElapsed(leadCaseObj).then(() => {
						cy.reload();
					});

					//share final comments
					happyPathHelper.shareFinalComments(leadCaseObj);

					//site visit
					happyPathHelper.setupSiteVisitFromBanner(leadCaseObj);
					cy.simulateSiteVisit(leadCaseObj).then(() => {
						cy.reload();
					});

					caseDetailsPage.clickManageLpaCostApplication();
					manageDocument.verifyNumberOfDocuments(3);
					manageDocument.clickBackLink();

					caseDetailsPage.clickAddLpaWithdrawal();
					fileUploader.uploadFiles([pdf, doc, img]);
					fileUploader.clickButtonByText('Continue');
					fileUploader.clickButtonByText('Confirm');
					fileUploader.clickButtonByText('Confirm');

					caseDetailsPage.clickManageLpaCostWithdrawal();
					manageDocument.verifyNumberOfDocuments(3);
					manageDocument.clickBackLink();

					//issue decision
					//leadcase, decision, number of children, costs present, issueCosts
					happyPathHelper.issueLinkedAppealDecisions(
						'Allowed',
						children.length,
						'appellant only',
						true,
						true
					);

					//case details
					caseDetailsPage.checkDecisionOutcome('Appellant costs decision: Issued');

					cases.forEach((caseObj) => {
						happyPathHelper.viewCaseDetails(caseObj.reference);
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
		cy.createCase({ caseType: 'W' }).then((leadCaseObj1) => {
			cy.createCase({ caseType: 'W' }).then((leadCaseObj2) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
					cases = [leadCaseObj1, leadCaseObj2, childCaseObj];

					happyPathHelper.assignCaseOfficer(leadCaseObj1);

					happyPathHelper.addLinkedAppeal(leadCaseObj1, childCaseObj);
					caseDetailsPage.checkStatusOfCase('Lead', 1);

					//2nd lead case
					happyPathHelper.assignCaseOfficer(leadCaseObj2);

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCaseObj.reference);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.checkHeading(`You have already linked appeal ${childCaseObj.reference}`);
				});
			});
		});
	});

	it('As a lead appeal, I am unable to link to another lead appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj1) => {
			cy.createCase({ caseType: 'W' }).then((leadCaseObj2) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
					cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
						cases = [leadCaseObj1, leadCaseObj2, childCaseObj1, childCaseObj2];

						happyPathHelper.assignCaseOfficer(leadCaseObj1);

						happyPathHelper.addLinkedAppeal(leadCaseObj1, childCaseObj1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCaseObj2);

						happyPathHelper.addLinkedAppeal(leadCaseObj2, childCaseObj2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//link lead appeals together
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(leadCaseObj1.reference);
						caseDetailsPage.clickButtonByText('Continue');

						//exit page
						caseDetailsPage.checkHeading(
							`You have already linked appeal ${leadCaseObj1.reference}`
						);
					});
				});
			});
		});
	});

	it('As a child appeal, I am unable to link to another child appeal', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj1) => {
			cy.createCase({ caseType: 'W' }).then((leadCaseObj2) => {
				cy.createCase({ caseType: 'W' }).then((childCaseObj1) => {
					cy.createCase({ caseType: 'W' }).then((childCaseObj2) => {
						cases = [leadCaseObj1, leadCaseObj2, childCaseObj1, childCaseObj2];

						happyPathHelper.assignCaseOfficer(leadCaseObj1);

						happyPathHelper.addLinkedAppeal(leadCaseObj1, childCaseObj1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCaseObj2);
						happyPathHelper.addLinkedAppeal(leadCaseObj2, childCaseObj2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//attempt to add a child appeal from a child appeal
						happyPathHelper.viewCaseDetails(childCaseObj1);
						caseDetailsPage.checkAddLinkedAppealDoesNotExist();
					});
				});
			});
		});
	});

	it('Cannot link from cases beyond LPAQ', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cy.addLpaqSubmissionToCase(leadCaseObj);
				happyPathHelper.assignCaseOfficer(leadCaseObj);
				happyPathHelper.reviewAppellantCase(leadCaseObj);
				happyPathHelper.startS78Case(leadCaseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				happyPathHelper.reviewS78Lpaq(leadCaseObj);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				//link appeal
				caseDetailsPage.checkAddLinkedAppealDoesNotExist();
			});
		});
	});

	it('Cannot link to cases beyond LPAQ', () => {
		cy.createCase({ caseType: 'W' }).then((leadCaseObj) => {
			cy.createCase({ caseType: 'W' }).then((childCaseObj) => {
				cases = [leadCaseObj, childCaseObj];

				cy.addLpaqSubmissionToCase(childCaseObj);
				happyPathHelper.assignCaseOfficer(childCaseObj);
				happyPathHelper.reviewAppellantCase(childCaseObj);
				happyPathHelper.startS78Case(childCaseObj, 'written');
				caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);
				happyPathHelper.reviewS78Lpaq(childCaseObj);
				caseDetailsPage.checkStatusOfCase('Statements', 0);

				happyPathHelper.assignCaseOfficer(leadCaseObj);

				//link appeal
				caseDetailsPage.clickAddLinkedAppeal();
				caseDetailsPage.fillInput(childCaseObj.reference);
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.checkHeading(`You cannot link appeal ${childCaseObj.reference}`);
			});
		});
	});
});
