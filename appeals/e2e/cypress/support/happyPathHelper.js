// @ts-nocheck

import { users } from '../fixtures/users';
import { ListCasesPage } from '../page_objects/listCasesPage';
import { CaseDetailsPage } from '../page_objects/caseDetailsPage.js';
import { FileUploader } from '../page_objects/shared.js';
import { DateTimeSection } from '../page_objects/dateTimeSection';
import { urlPaths } from './urlPaths.js';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const listCasesPage = new ListCasesPage();
const fileUploader = new FileUploader();

let sampleFiles = fileUploader.sampleFiles;

export const happyPathHelper = {
	assignCaseOfficer(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAssignCaseOfficer();
		caseDetailsPage.searchForCaseOfficer('case');
		caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
		caseDetailsPage.clickButtonByText('Assign case officer');
		caseDetailsPage.validateBannerMessage('Success', 'Case officer assigned');
		caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
	},
	reviewAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.selectRadioButtonByValue('Valid');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
	},
	reviewLpaq(caseRef) {
		let dueDate = new Date();

		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Confirm');
	},
	reviewS78Lpaq(caseRef) {
		let dueDate = new Date();

		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.selectRadioButtonByValue('yes');
		caseDetailsPage.clickButtonByText('Continue');
	},

	startCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.clickButtonByText('Confirm');
	},

	startS78Case(caseRef, procedureType) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.selectRadioButtonByValue(procedureType);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Start case');
	},

	startS78InquiryCase(caseRef, procedureType) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.selectRadioButtonByValue(procedureType);
		caseDetailsPage.clickButtonByText('Continue');
		//dateTimeSection.enterDueDate();
		//caseDetailsPage.clickButtonByText('Continue');
		//caseDetailsPage.selectRadioButtonByValue('Yes');
		//caseDetailsPage.clickButtonByText('Continue');
	},
	reviewLPaStatement(caseRef) {
		happyPathHelper.reviewS78Lpaq(caseRef);
		caseDetailsPage.checkStatusOfCase('Statements', 0);
		happyPathHelper.addThirdPartyComment(caseRef, true);
		caseDetailsPage.clickBackLink();
		happyPathHelper.addThirdPartyComment(caseRef, false);
		caseDetailsPage.clickBackLink();
		happyPathHelper.addLpaStatement(caseRef);
		cy.simulateStatementsDeadlineElapsed(caseRef);
		cy.reload();
		caseDetailsPage.basePageElements.bannerLink().click();
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Statements and IP comments shared');
	},

	changeStartDate(caseRef) {
		caseDetailsPage.clickChangeStartDate();
		caseDetailsPage.clickButtonByText('Confirm');
	},

	validVisitDate() {
		let visitDate = new Date();
		visitDate.setMonth(visitDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?
		return visitDate;
	},

	getYesterday() {
		const date = new Date();
		date.setDate(date.getDate() - 1);
		return date;
	},

	uploadDocAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		happyPathHelper.assignCaseOfficer(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.clickAddAgreementToChangeDescriptionEvidence();
		fileUploader.uploadFiles(sampleFiles.document);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage(
			'Success',
			'Agreement to change description evidence added'
		);
	},

	manageDocsAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		happyPathHelper.uploadDocAppellantCase(caseRef);
		cy.reloadUntilVirusCheckComplete();
		caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('upload a new version');
		fileUploader.uploadFiles(sampleFiles.document2);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage(
			'Success',
			'Agreement to change description evidence updated'
		);
	},

	uploadDocsLpaq(bannerMessage = 'Document added') {
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.clickAddNotifyingParties();
		fileUploader.uploadFiles(sampleFiles.document);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateConfirmationPanelMessage(
			'Success',
			'Who was notified about the application added'
		);
	},

	uploadDocVersionLpaq(caseRef) {
		caseDetailsPage.clickManageNotifyingParties();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('Upload a new version');
		fileUploader.uploadFiles(sampleFiles.document2);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateConfirmationPanelMessage(
			'Success',
			'Who was notified about the application updated'
		);
	},

	removeDocLpaq(caseRef) {
		caseDetailsPage.clickManageNotifyingParties();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('Remove current version');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage(
			'Success',
			'Who was notified about the application removed'
		);
	},

	addThirdPartyComment(caseRef, state) {
		cy.addRepresentation(caseRef, 'interestedPartyComment', null).then((caseRef) => {
			cy.reload();
			caseDetailsPage.reviewIpComments(state);
			cy.reload();
		});
	},

	addLpaStatement(caseRef, isAllocationPageExist = true) {
		cy.addRepresentation(caseRef, 'lpaStatement', null).then((caseRef) => {
			cy.reload();
			caseDetailsPage.reviewLpaStatement(isAllocationPageExist);
		});
	},

	addLpaFinalComment(caseRef) {
		cy.addRepresentation(caseRef, 'lpaFinalComment', null).then((caseRef) => {
			cy.reload();
			caseDetailsPage.reviewFinalComment('LPA');
		});
	},

	addAppellantFinalComment(caseRef, serviceUserId) {
		cy.addRepresentation(caseRef, 'appellantFinalComment', serviceUserId).then((caseRef) => {
			cy.reload();
			caseDetailsPage.reviewFinalComment('appellant');
		});
	},

	progressSiteVisit(caseRef) {
		caseDetailsPage.clickSetUpSiteVisitType();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Site visit set up');
		cy.simulateSiteVisit(caseRef).then((caseRef) => {
			cy.reload();
		});
	},

	setupSiteVisitFromBanner(caseRef) {
		caseDetailsPage.clickSiteVisitBanner();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Site visit set up');
	},

	issueDecision(caseRef, decision, appellantCostsBool = true, lpaCostsBool = true) {
		caseDetailsPage.clickIssueDecision();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(decision));

		if (decision === 'Invalid') {
			caseDetailsPage.fillTextArea('The appeal is invalid because of X reason', 0);
			caseDetailsPage.clickButtonByText('Continue');
		} else {
			caseDetailsPage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
		}

		//Appellant costs
		if (appellantCostsBool) {
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
		} else {
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
		}

		//LPA costs
		if (lpaCostsBool) {
			caseDetailsPage.selectRadioButtonByValue('Yes');
			caseDetailsPage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
		} else {
			caseDetailsPage.selectRadioButtonByValue('No');
			caseDetailsPage.clickButtonByText('Continue');
		}

		//CYA
		caseDetailsPage.clickButtonByText('Issue decision');

		//Banner & inset text
		if (decision === 'Invalid') {
			caseDetailsPage.validateBannerMessage('Success', 'Appeal marked as invalid');
			caseDetailsPage.checkStatusOfCase('Invalid', 0);
		} else {
			caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
			caseDetailsPage.checkStatusOfCase('Complete', 0);
		}
	},

	issueAppellantCostsDecision(caseRef) {
		caseDetailsPage.clickIssueAppellantCostsDecision();
		fileUploader.uploadFiles(sampleFiles.pdf);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Issue appellant costs decision');
	},

	issueLpaCostsDecision(caseRef) {
		caseDetailsPage.clickIssueLpaCostsDecision();
		fileUploader.uploadFiles(sampleFiles.pdf);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Issue lpa costs decision');
	},

	addLinkedAppeal(leadCaseRef, childCaseRef) {
		caseDetailsPage.clickAccordionByButton('Overview');
		caseDetailsPage.clickAddLinkedAppeal();
		caseDetailsPage.fillInput(childCase);
		caseDetailsPage.clickButtonByText('Continue');

		//select lead appeal
		caseDetailsPage.selectRadioButtonByValue(leadCase);
		caseDetailsPage.clickButtonByText('Continue');

		//CYA
		caseDetailsPage.clickButtonByText('Add linked appeal');

		//case details
		caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
		caseDetailsPage.checkStatusOfCase('Lead', 1);
	}
};
