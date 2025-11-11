// @ts-nocheck

import { users } from '../fixtures/users';
import { Page } from '../page_objects/basePage.js';
import { HearingSectionPage } from '../page_objects/caseDetails/hearingSectionPage';
import { CaseDetailsPage } from '../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../page_objects/dateTimeSection';
import { ListCasesPage } from '../page_objects/listCasesPage';
import { FileUploader } from '../page_objects/shared.js';
import { urlPaths } from './urlPaths.js';

const basePage = new Page();
const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();
const listCasesPage = new ListCasesPage();
const fileUploader = new FileUploader();
const hearingSectionPage = new HearingSectionPage();
const currentDate = new Date();

let sampleFiles = fileUploader.sampleFiles;
let pdf = sampleFiles.pdf;

export const happyPathHelper = {
	viewCaseDetails(caseObj) {
		cy.visit(urlPaths.appealsList);
		listCasesPage.clickAppealByRef(caseObj);
	},
	assignCaseOfficer(caseObj) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickAssignCaseOfficer();
		caseDetailsPage.searchForCaseOfficer('case');
		caseDetailsPage.chooseSummaryListValue(users.appeals.caseAdmin.email);
		caseDetailsPage.clickButtonByText('Assign case officer');
		caseDetailsPage.validateBannerMessage('Success', 'Case officer assigned');
		caseDetailsPage.verifyAnswerSummaryValue(users.appeals.caseAdmin.email);
	},
	reviewAppellantCase(caseObj) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.selectRadioButtonByValue('Valid');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm');
	},
	reviewLpaq(caseObj, state = 'Complete') {
		let dueDate = new Date();

		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.selectRadioButtonByValue(state);
		caseDetailsPage.clickButtonByText('Confirm');
	},
	reviewS78Lpaq(caseObj, state = 'Complete') {
		let dueDate = new Date();

		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReviewLpaq();
		caseDetailsPage.selectRadioButtonByValue(state);
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.selectRadioButtonByValue('yes');
		caseDetailsPage.clickButtonByText('Continue');
	},

	startCase(caseObj) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.clickButtonByText('Confirm');
	},

	startS78Case(caseObj, procedureType) {
		if (procedureType === 'hearing') {
			return happyPathHelper.startS78HearingCase(caseObj, procedureType);
		}
		if (procedureType === 'inquiry') {
			return happyPathHelper.startS78InquiryCase(caseObj, procedureType);
		}
		happyPathHelper.viewCaseDetails(caseObj);
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.selectRadioButtonByValue(procedureType);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Start case');
	},

	startS78HearingCase(caseObj, procedureType, dateKnown = false) {
		happyPathHelper.viewCaseDetails(caseObj);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.selectRadioButtonByValue(procedureType);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue(dateKnown ? 'yes' : 'no');
		caseDetailsPage.clickButtonByText('Continue');
		if (dateKnown) {
			dateTimeSection.enterHearingDate(happyPathHelper.validVisitDate());
			dateTimeSection.enterHearingTime('13', '45');
			caseDetailsPage.clickButtonByText('Continue');
		}
		caseDetailsPage.clickButtonByText('Start case');
	},

	startS78InquiryCase(caseObj, procedureType) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		caseDetailsPage.clickReadyToStartCase();
		caseDetailsPage.selectRadioButtonByValue(procedureType);
		caseDetailsPage.clickButtonByText('Continue');
		//dateTimeSection.enterDueDate();
		//caseDetailsPage.clickButtonByText('Continue');
		//caseDetailsPage.selectRadioButtonByValue('Yes');
		//caseDetailsPage.clickButtonByText('Continue');
	},
	reviewLPaStatement(caseObj) {
		happyPathHelper.reviewS78Lpaq(caseObj);
		caseDetailsPage.checkStatusOfCase('Statements', 0);
		happyPathHelper.addThirdPartyComment(caseObj, true);
		caseDetailsPage.clickBackLink();
		happyPathHelper.addThirdPartyComment(caseObj, false);
		caseDetailsPage.clickBackLink();
		happyPathHelper.addLpaStatement(caseObj);
		cy.simulateStatementsDeadlineElapsed(caseObj);
		cy.reload();
		caseDetailsPage.basePageElements.bannerLink().click();
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Statements and IP comments shared');
	},

	changeStartDate(caseObj) {
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

	uploadDocAppellantCase(caseObj) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		happyPathHelper.assignCaseOfficer(caseObj);
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
		caseDetailsPage.verifyAnswerSummaryValue(sampleFiles.document);
	},

	manageDocsAppellantCase(caseObj) {
		cy.visit(`${urlPaths.caseDetails}/${caseObj.id}`);
		happyPathHelper.uploadDocAppellantCase(caseObj);
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

	uploadDocVersionLpaq(caseObj) {
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

	removeDocLpaq(caseObj) {
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

	addThirdPartyComment(caseObj, state) {
		cy.addRepresentation(caseObj, 'interestedPartyComment', null).then((caseObj) => {
			cy.reload();
			caseDetailsPage.reviewIpComments(state);
			cy.reload();
		});
	},

	addLpaStatement(caseObj, isAllocationPageExist = true) {
		cy.addRepresentation(caseObj, 'lpaStatement', null).then((caseObj) => {
			cy.reload();
			caseDetailsPage.reviewLpaStatement(isAllocationPageExist);
		});
	},

	addLpaFinalComment(caseObj) {
		cy.addRepresentation(caseObj, 'lpaFinalComment', null).then((caseObj) => {
			cy.reload();
			caseDetailsPage.reviewFinalComment('LPA');
		});
	},

	addAppellantFinalComment(caseObj, serviceUserId) {
		cy.addRepresentation(caseObj, 'appellantFinalComment', serviceUserId).then((caseObj) => {
			cy.reload();
			caseDetailsPage.reviewFinalComment('appellant');
		});
	},

	progressSiteVisit(caseObj) {
		caseDetailsPage.clickSetUpSiteVisitType();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Site visit set up');
		cy.simulateSiteVisit(caseObj).then((caseObj) => {
			cy.reload();
		});
	},

	setupSiteVisitFromBanner(caseObj) {
		caseDetailsPage.clickSiteVisitBanner();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Accompanied'));
		dateTimeSection.enterVisitDate(happyPathHelper.validVisitDate());
		dateTimeSection.enterVisitStartTime('08', '00');
		dateTimeSection.enterVisitEndTime('12', '00');
		caseDetailsPage.clickButtonByText('Confirm');
		caseDetailsPage.validateBannerMessage('Success', 'Site visit set up');
	},

	setupSiteHearingFromBanner(caseObj) {
		caseDetailsPage.clickHearingBannerLink();

		cy.getBusinessActualDate(currentDate, 2).then((hearingDate) => {
			hearingDate.setHours(currentDate.getHours(), currentDate.getMinutes());
			hearingSectionPage.setUpHearing(
				hearingDate,
				hearingDate.getHours(),
				hearingDate.getMinutes()
			);
		});
		hearingSectionPage.selectRadioButtonByValue('No');
		hearingSectionPage.clickButtonByText('Continue');
		hearingSectionPage.clickButtonByText('Set up hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing set up');
		//add address
		const originalAddress = {
			line1: 'e2e Hearing Test Address',
			line2: 'Hearing Street',
			town: 'Hearing Town',
			county: 'Somewhere',
			postcode: 'BS20 1BS'
		};
		const headers = {
			hearingEstimate: {
				checkDetails: 'Check details and add hearing estimates',
				estimateForm: 'Hearing estimates'
			},
			hearing: {
				checkDetails: 'Check details and set up hearing',
				addressQuestion: 'Do you know the address of where the hearing will take place?',
				addressForm: 'Address',
				dateTime: 'Date and time',
				confirmHearingCancellation: 'Confirm that you want to cancel the hearing'
			}
		};
		caseDetailsPage.clickHearingBannerAddressLink();
		hearingSectionPage.addHearingLocationAddress(originalAddress);
		hearingSectionPage.verifyHearingHeader(headers.hearing.checkDetails);
		caseDetailsPage.clickButtonByText('Update hearing');
		caseDetailsPage.validateBannerMessage('Success', 'Hearing updated');
	},

	issueDecision(decision, route, appellantCostsBool = true, lpaCostsBool = true) {
		caseDetailsPage.clickIssueDecision();
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(decision));

		const issueCosts = (bool) => {
			if (bool) {
				basePage.selectRadioButtonByValue('Yes');
				basePage.clickButtonByText('Continue');
				fileUploader.uploadFiles(sampleFiles.pdf);
				fileUploader.clickButtonByText('Continue');
			} else {
				basePage.selectRadioButtonByValue('No');
				basePage.clickButtonByText('Continue');
			}
		};

		if (decision === 'Invalid') {
			caseDetailsPage.clickButtonByText('Continue');
			// this is actually choosing not to upload the decision letter for an invalid appeal
			issueCosts(false);
			caseDetailsPage.fillTextArea('The appeal is invalid because of X reason', 0);
			caseDetailsPage.clickButtonByText('Continue');
		} else {
			caseDetailsPage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			caseDetailsPage.clickButtonByText('Continue');
		}

		//this is not for which costs are issued but which costs are eligible to be issued
		switch (route) {
			case 'both costs':
				issueCosts(appellantCostsBool);
				issueCosts(lpaCostsBool);
				break;

			case 'appellant only':
				issueCosts(appellantCostsBool);
				break;

			case 'lpa only':
				issueCosts(lpaCostsBool);
				break;

			case 'no costs':
				break;
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

	issueLinkedAppealDecisions(
		caseObj,
		decision,
		numOfChildren,
		appellantCostsBool = true,
		lpaCostsBool = true
	) {
		caseDetailsPage.clickIssueDecision();
		for (let i = 0; i <= numOfChildren; i++) {
			basePage.selectRadioButtonByValue(basePage.exactMatch(decision));
			basePage.clickButtonByText('Continue');
		}

		fileUploader.uploadFiles(sampleFiles.pdf);
		fileUploader.clickButtonByText('Continue');

		//Appellant costs
		if (appellantCostsBool) {
			basePage.selectRadioButtonByValue('Yes');
			basePage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			fileUploader.clickButtonByText('Continue');
		} else {
			basePage.selectRadioButtonByValue('No');
			basePage.clickButtonByText('Continue');
		}

		//LPA costs
		if (lpaCostsBool) {
			basePage.selectRadioButtonByValue('Yes');
			basePage.clickButtonByText('Continue');
			fileUploader.uploadFiles(sampleFiles.pdf);
			fileUploader.clickButtonByText('Continue');
		} else {
			basePage.selectRadioButtonByValue('No');
			basePage.clickButtonByText('Continue');
		}

		//CYA
		basePage.clickButtonByText('Issue decision');

		//Banner & inset text
		caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
		caseDetailsPage.checkStatusOfCase('Complete', 0);
	},

	issueAppellantCostsDecision() {
		caseDetailsPage.clickIssueAppellantCostsDecision();
		fileUploader.uploadFiles(sampleFiles.pdf);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Issue appellant costs decision');
	},

	issueLpaCostsDecision() {
		caseDetailsPage.clickIssueLpaCostsDecision();
		fileUploader.uploadFiles(sampleFiles.pdf);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Issue lpa costs decision');
	},

	addAppellantCostWithdrawal() {
		caseDetailsPage.clickAddAppellantWithdrawal();
		fileUploader.uploadFiles(pdf);
		fileUploader.clickButtonByText('Continue');
		fileUploader.clickButtonByText('Confirm');
		fileUploader.clickButtonByText('Confirm');
	},

	addLpaCostWithdrawal() {
		caseDetailsPage.clickAddLpaWithdrawal();
		fileUploader.uploadFiles(pdf);
		fileUploader.clickButtonByText('Continue');
		fileUploader.clickButtonByText('Confirm');
		fileUploader.clickButtonByText('Confirm');
	},

	addLinkedAppeal(leadcaseObj, childcaseObj, firstLink = true) {
		caseDetailsPage.clickAddLinkedAppeal();
		basePage.fillInput(childcaseObj.reference);
		basePage.clickButtonByText('Continue');

		if (firstLink) {
			basePage.selectRadioButtonByValue(leadcaseObj.reference);
			basePage.clickButtonByText('Continue');
		} else {
			basePage.verifyRowExists('Which is the lead appeal?', false);
		}

		//CYA
		basePage.clickButtonByText('Add linked appeal');

		//case details
		caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
	},

	changeAppealType(index) {
		caseDetailsPage.clickChangeAppealType();
		basePage.chooseRadioBtnByIndex(index);
		basePage.clickButtonByText('Continue');
		basePage.selectRadioButtonByValue('No');
		basePage.clickButtonByText('Continue');
		basePage.clickButtonByText('Update appeal type');
		caseDetailsPage.validateBannerMessage('Success', 'Appeal type updated');
	},

	changeAppealTypeResubmit(index) {
		caseDetailsPage.clickChangeAppealType();
		basePage.chooseRadioBtnByIndex(index);
		basePage.clickButtonByText('Continue');
		basePage.selectRadioButtonByValue('Yes');
		basePage.clickButtonByText('Continue');
		basePage.clickButtonByText('Continue');
		cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
			dateTimeSection.enterChangeAppealTypeResubmissionDate(futureDate);
		});
		basePage.clickButtonByText('Continue');
		basePage.clickButtonByText('Mark appeal as invalid');
		caseDetailsPage.validateBannerMessage('Success', 'Appeal marked as invalid');
	},

	addNetResidences(option, number) {
		caseDetailsPage.clickAddNetResidence();
		basePage.selectRadioButtonByValue(option);
		basePage.fillInput(number);
		basePage.clickButtonByText('Save and return');
		basePage.validateBannerMessage('Success', 'Number of residential units added');
	}
};

// 1) Reusable status constants
const STATUSES = {
	ASSIGN_CASE_OFFICER: 'ASSIGN_CASE_OFFICER',
	VALIDATION: 'VALIDATION',
	READY_TO_START: 'READY_TO_START',
	LPA_QUESTIONNAIRE: 'LPA_QUESTIONNAIRE',
	STATEMENTS: 'STATEMENTS',
	FINAL_COMMENTS: 'FINAL_COMMENTS',
	EVENT_READY_TO_SETUP: 'EVENT_READY_TO_SETUP',
	AWAITING_EVENT: 'AWAITING_EVENT',
	ISSUE_DECISION: 'ISSUE_DECISION',
	COMPLETE: 'COMPLETE'
};

// 2️⃣  Flows pick only the statuses they need (and order)
const FLOWS = {
	HAS: [
		STATUSES.ASSIGN_CASE_OFFICER,
		STATUSES.VALIDATION,
		STATUSES.READY_TO_START,
		STATUSES.LPA_QUESTIONNAIRE,
		STATUSES.EVENT_READY_TO_SETUP,
		STATUSES.AWAITING_EVENT,
		STATUSES.ISSUE_DECISION,
		STATUSES.COMPLETE
	],
	S78: [
		STATUSES.ASSIGN_CASE_OFFICER,
		STATUSES.VALIDATION,
		STATUSES.READY_TO_START,
		STATUSES.LPA_QUESTIONNAIRE,
		STATUSES.STATEMENTS,
		STATUSES.FINAL_COMMENTS,
		STATUSES.EVENT_READY_TO_SETUP,
		STATUSES.AWAITING_EVENT,
		STATUSES.ISSUE_DECISION,
		STATUSES.COMPLETE
	],
	S20: [
		STATUSES.ASSIGN_CASE_OFFICER,
		STATUSES.VALIDATION,
		STATUSES.READY_TO_START,
		STATUSES.LPA_QUESTIONNAIRE,
		STATUSES.STATEMENTS,
		STATUSES.FINAL_COMMENTS,
		STATUSES.EVENT_READY_TO_SETUP,
		STATUSES.AWAITING_EVENT,
		STATUSES.ISSUE_DECISION,
		STATUSES.COMPLETE
	]
};
//potentially add check
const baseActions = {
	[STATUSES.ASSIGN_CASE_OFFICER]: (caseObj) => {
		happyPathHelper.assignCaseOfficer(caseObj);
	},
	[STATUSES.VALIDATION]: (caseObj) => {
		happyPathHelper.reviewAppellantCase(caseObj);
	},
	[STATUSES.READY_TO_START]: (caseObj, appealType, procedureType) => {
		if (appealType === 'S78') {
			happyPathHelper.startS78Case(caseObj, procedureType);
		} else if (procedureType === 'S78') {
			happyPathHelper.startS78Case(caseObj, procedureType);
		} else {
			happyPathHelper.startCase(caseObj);
		}
	},
	[STATUSES.LPA_QUESTIONNAIRE]: (caseObj, appealType) => {
		if (appealType === 'S78' || appealType === 'S20') {
			happyPathHelper.reviewS78Lpaq(caseObj);
		} else {
			happyPathHelper.reviewLpaq(caseObj);
		}
	},
	[STATUSES.STATEMENTS]: (caseObj) => {
		happyPathHelper.addLpaStatement(caseObj);
		cy.simulateStatementsDeadlineElapsed(caseObj);
		cy.reload();
		caseDetailsPage.basePageElements.bannerLink().click();
		caseDetailsPage.clickButtonByText('Confirm');
	},
	[STATUSES.FINAL_COMMENTS]: (caseObj, _appealType, procedureType) => {
		if (procedureType === 'hearing') {
			cy.log('skip');
		} else {
			happyPathHelper.addLpaFinalComment(caseObj);
			cy.simulateFinalCommentsDeadlineElapsed(caseObj);
			cy.reload();
			caseDetailsPage.basePageElements.bannerLink().click();
			caseDetailsPage.clickButtonByText('Share final comments');
		}
	},
	[STATUSES.EVENT_READY_TO_SETUP]: (caseObj, _appealType, procedureType) => {
		if (procedureType === 'hearing') {
			happyPathHelper.setupSiteHearingFromBanner(caseObj);
		} else {
			happyPathHelper.setupSiteVisitFromBanner(caseObj);
		}
	},
	[STATUSES.AWAITING_EVENT]: (caseObj, _appealType, procedureType) => {
		if (procedureType === 'hearing') {
			cy.simulateHearingElapsed(caseObj);
			cy.reload();
		} else {
			cy.simulateSiteVisit(caseObj).then(() => {
				cy.reload();
			});
		}
	},
	[STATUSES.ISSUE_DECISION]: (caseObj) => {
		happyPathHelper.issueDecision('Allowed', 'both costs');
	}
};

// 4️⃣ Generic runner — actions run for the CURRENT status to move to the NEXT
function updateCase(
	caseObj,
	currentStatus,
	targetStatus,
	appealType = 'HAS',
	procedureType = 'hearing'
) {
	const flow = FLOWS[appealType] || FLOWS.BASE;

	const fromIndex = flow.indexOf(currentStatus);
	const toIndex = flow.indexOf(targetStatus);

	for (let i = fromIndex; i < toIndex; i++) {
		const current = flow[i];
		const fn = baseActions[current];
		if (fn) {
			fn(caseObj, appealType, procedureType);
		} else {
			cy.log(`⚠️ No action defined for ${current}`);
		}
	}
}

Cypress.Commands.add('updateCase', updateCase);
