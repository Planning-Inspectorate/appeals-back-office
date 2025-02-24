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

	changeStartDate(caseRef) {
		caseDetailsPage.clickChangeStartDate();
		caseDetailsPage.clickButtonByText('Confirm');
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
		caseDetailsPage.validateBannerMessage('Document added');
	},

	manageDocsAppellantCase(caseRef) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseRef);
		happyPathHelper.uploadDocAppellantCase(caseRef);
		cy.reloadUntilVirusCheckComplete();
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
	},

	addThirdPartyComment(caseRef, state) {
		cy.addRepresentation(caseRef, 'interestedPartyComment', null).then((caseRef) => {
			caseDetailsPage.reviewIpComments(state);
		});
	},

	addLpaStatement(caseRef) {
		cy.addRepresentation(caseRef, 'lpaStatement', null).then((caseRef) => {
			caseDetailsPage.reviewLpaStatement();
		});
	},

	addLpaFinalComment(caseRef) {
		cy.addRepresentation(caseRef, 'lpaFinalComment', null).then((caseRef) => {
			caseDetailsPage.reviewFinalComment('LPA');
		});
	},

	addAppellantFinalComment(caseRef, serviceUserId) {
		cy.addRepresentation(caseRef, 'appellantFinalComment', serviceUserId).then((caseRef) => {
			caseDetailsPage.reviewFinalComment('appellant');
		});
	},

	progressSiteVisit(caseRef) {
		caseDetailsPage.clickChangeVisitTypeHasSiteDetails();
		caseDetailsPage.clickButtonByText('Manage the site visit');
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateConfirmationPanelMessage(
			'Site visit scheduled',
			'Appeal reference ' + caseRef
		);
		cy.simulateSiteVisit(caseRef).then((caseRef) => {});
	},

	setupSiteVisitFromBanner(caseRef) {
		caseDetailsPage.clickSiteVisitBanner();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateConfirmationPanelMessage(
			'Site visit scheduled',
			'Appeal reference ' + caseRef
		),
			caseDetailsPage.validateBannerMessage('Site visit has been arranged');
	}
};
