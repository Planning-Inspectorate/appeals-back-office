// @ts-nocheck

import { users } from '../fixtures/users';
import { ListCasesPage } from '../page_objects/listCasesPage';
import { CaseDetailsPage } from '../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../page_objects/dateTimeSection';
import { urlPaths } from './urlPaths.js';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const listCasesPage = new ListCasesPage();

let sampleFiles = caseDetailsPage.sampleFiles;

export const happyPathHelper = {
	assignCaseOfficer(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickAssignCaseOfficer();
		caseDetailsPage.searchForCaseOfficer('case');
		caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
		caseDetailsPage.clickLinkByText('Choose');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Case officer has been assigned');
		caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
	},
	reviewAppellantCase(caseRef) {
		let dueDate = new Date();

		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.selectRadioButtonByValue('Valid');
		caseDetailsPage.clickButtonByText('Continue');
		dateTimeSection.enterValidDate(dueDate);
		caseDetailsPage.clickButtonByText('Confirm');
	},
	reviewLpaq(caseRef) {
		let dueDate = new Date();

		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickLinkByText('Go back to case details');
	},

	startCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickLinkByText('Go back to case details');
	},

	changeStartDate(caseRef) {
		caseDetailsPage.clickChangeStartDate();
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickLinkByText('Go back to case details');
	},

	validVisitDate() {
		let visitDate = new Date();
		visitDate.setMonth(visitDate.getMonth() + 10); // TODO What is a suitable dynamic date to use here?
		return visitDate;
	},

	uploadDocAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		happyPathHelper.assignCaseOfficer(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.clickAddAgreementToChangeDescriptionEvidence();
		caseDetailsPage.uploadSampleFile(sampleFiles.document);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		cy.reload();
		//caseDetailsPage.verifyAnswerSummaryValue('sample-doc.pdf'); - Success banners are currently missing, fix incoming
	},

	manageDocsAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		happyPathHelper.uploadDocAppellantCase(caseRef);
		cy.reload();
		caseDetailsPage.clickManageAgreementToChangeDescriptionEvidence();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('upload a new version');
		caseDetailsPage.uploadSampleFile(sampleFiles.img);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Document updated');
	},

	uploadDocsLpaq(caseRef) {
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.clickAddNotifyingParties();
		caseDetailsPage.uploadSampleFile(sampleFiles.document);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Document added');
	},

	uploadDocVersionLpaq(caseRef) {
		caseDetailsPage.clickManageNotifyingParties();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('Upload a new version');
		caseDetailsPage.uploadSampleFile(sampleFiles.img);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Document updated');
	},

	removeDocLpaq(caseRef) {
		caseDetailsPage.clickManageNotifyingParties();
		caseDetailsPage.clickLinkByText('View and edit');
		caseDetailsPage.clickButtonByText('Remove current version');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.validateBannerMessage('Document removed');
	}
};
