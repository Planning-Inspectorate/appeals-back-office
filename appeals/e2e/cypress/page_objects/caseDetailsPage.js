// @ts-nocheck

import { formatDateAndTime } from '../support/utils/format';
import { Page } from './basePage';
import { DateTimeSection } from './dateTimeSection.js';

const dateTimeSection = new DateTimeSection();
export class CaseDetailsPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		reviewLpaQuestionnaire: 'review-lpa-questionnaire-banner',
		viewLpaQuestionnaire: 'review-lpa-questionnaire',
		changeCaseOfficer: 'change-case-officer',
		assignCaseOfficer: 'assign-case-officer',
		assignInspector: 'assign-inspector',
		changeInspector: 'change-inspector',
		reviewAppellantCase: 'review-appellant-case',
		setUpSiteVisit: 'set up-site-visit',
		changeSetVisitType: 'change-set-visit-type',
		changeScheduleVisit: 'change-schedule-visit',
		arrangeScheduleVisit: 'arrange-schedule-visit',
		readyToStart: 'ready-to-start',
		issueDetermination: 'issue-determination',
		linkedAppeal: 'linked-appeal-',
		addLinkedAppeal: 'add-linked-appeal',
		manageLinkedAppeals: 'manage-linked-appeals',
		addRelatedAppeals: 'add-related-appeals',
		addCrossTeamCorrespondence: 'add-cross-team-correspondence',
		addInspectorCorrespondence: 'add-inspector-correspondence',
		addMainPartyCorrespondence: 'add-main-party-correspondence',
		issueAppellantCostsDecision: 'issue-appellant-costs-decision',
		issueLpaCostsDecision: 'issue-lpa-costs-decision',
		manageCrossTeamCorrespondence: 'manage-cross-team-correspondence',
		manageInspectorCorrespondence: 'manage-inspector-correspondence',
		manageMainPartyCorrespondence: 'manage-main-party-correspondence',
		manageRelatedAppeals: 'manage-related-appeals',
		changeAppealType: 'change-appeal-type',
		addAgreementToChangeDescriptionEvidence: 'add-agreement-to-change-description-evidence',
		addNotifyingParties: 'add-notifying-parties',
		manageNotifyingParties: 'manage-notifying-parties',
		manageAgreementToChangeDescriptionEvidence: 'manage-agreement-to-change-description-evidence',
		issueCostsDecision: 'issue-appellant-costs-decision',
		addAppellantApplication: 'add-costs-appellant-application',
		changeSiteOwnership: 'change-site-ownership',
		changeLpaqDueDate: 'change-lpa-questionnaire-due-date',
		changeStartDate: 'change-start-case-date',
		startAppealCancel: 'start-appeal-cancel',
		changeAppellant: 'change-appellant',
		changeAgent: 'change-agent',
		setupSiteVisitBanner: 'set-up-site-visit-banner',
		reviewIpComments: 'banner-review-ip-comments',
		reviewLpaStatement: 'banner-review-lpa-statement',
		changeApplicationReference: 'change-application-reference',
		viewCaseHistory: 'view-case-history',
		uploadFile: 'upload-file-button',
		setUpTimetableHearingDate: 'set up-timetable-hearing-date',
		hearingBannerLink: 'setup-hearing',
		hearingBannerAddressLink: 'add-hearing-address',
		inquiryBannerLink: 'setup-inquiry',
		pageHeading: 'h1',
		changeInquiryDate: 'change-inquiry-date',
		changeInquiryNumberOfDays: 'change-inquiry-expected-number-of-days',
		addAppellantWithdrawal: 'add-costs-appellant-withdrawal',
		addLpaWithdrawal: 'add-costs-lpa-withdrawal',
		addNetResidence: 'add-net-residence-change'
	};

	fixturesPath = 'cypress/fixtures/';

	sampleFiles = {
		document: 'sample-file.doc',
		document2: 'sample-file-2.doc',
		document3: 'sample-file-3.doc',
		img: 'sample-img.jpeg',
		pdf: 'test.pdf',
		pdf2: 'test-2.pdf'
	};

	elements = {
		reviewLpaQuestionnaire: () => cy.getByData(this._cyDataSelectors.reviewLpaQuestionnaire),
		viewLpaQuestionnaire: () => cy.getByData(this._cyDataSelectors.viewLpaQuestionnaire),
		changeCaseOfficer: () => cy.getByData(this._cyDataSelectors.changeCaseOfficer),
		assignCaseOfficer: () => cy.getByData(this._cyDataSelectors.assignCaseOfficer).last(),
		assignInspector: () => cy.getByData(this._cyDataSelectors.assignInspector),
		changeInspector: () => cy.getByData(this._cyDataSelectors.changeInspector),
		answerCellAppeals: (answer) =>
			cy.contains(this.selectors.summaryListValue, answer, { matchCase: false }),
		reviewAppeallantCase: () => cy.getByData(this._cyDataSelectors.reviewAppellantCase),
		setUpSiteVisit: () => cy.getByData(this._cyDataSelectors.setUpSiteVisit),
		changeSetVisitType: () => cy.getByData(this._cyDataSelectors.changeSetVisitType),
		changeScheduleVisit: () => cy.getByData(this._cyDataSelectors.changeScheduleVisit),
		arrangeScheduleVisit: () => cy.getByData(this._cyDataSelectors.arrangeScheduleVisit),
		readyToStart: () => cy.getByData(this._cyDataSelectors.readyToStart),
		issueDecision: () => cy.getByData(this._cyDataSelectors.issueDetermination),
		addLinkedAppeal: () => cy.getByData(this._cyDataSelectors.addLinkedAppeal),
		addRelatedAppeals: () => cy.getByData(this._cyDataSelectors.addRelatedAppeals),
		addCrossTeamCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.addCrossTeamCorrespondence),
		addInspectorCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.addInspectorCorrespondence),
		addMainPartyCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.addMainPartyCorrespondence),
		manageLinkedAppeals: () => cy.getByData(this._cyDataSelectors.manageLinkedAppeals),
		manageNotifyingParties: () => cy.getByData(this._cyDataSelectors.manageNotifyingParties),
		linkedAppeal: () => cy.get(`[data-cy^=${this._cyDataSelectors.linkedAppeal}]`),
		linkedAppealValue: () => cy.get('.appeal-linked-appeals .govuk-summary-list__value'),
		manageRelatedAppeals: () => cy.getByData(this._cyDataSelectors.manageRelatedAppeals),
		uploadFile: () => cy.getByData(this._cyDataSelectors.uploadFile),
		changeAppealType: () => cy.getByData(this._cyDataSelectors.changeAppealType),
		appealType: () => cy.get('.appeal-appeal-type .govuk-summary-list__value'),
		addAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.addAgreementToChangeDescriptionEvidence),
		addNotifiyingParties: () => cy.getByData(this._cyDataSelectors.addNotifyingParties),
		manageAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.manageAgreementToChangeDescriptionEvidence),
		issueAppellantCostsDecision: (index = 0) =>
			cy.getByData(this._cyDataSelectors.issueAppellantCostsDecision).eq(index),
		issueLpaCostsDecision: (index = 0) =>
			cy.getByData(this._cyDataSelectors.issueLpaCostsDecision).eq(index),
		addAppellantApplication: () => cy.getByData(this._cyDataSelectors.addAppellantApplication),
		costDecisionStatus: () => cy.get('.govuk-table__cell appeal-costs-decision-status'),
		changeSiteOwnership: () => cy.getByData(this._cyDataSelectors.changeSiteOwnership),
		changeLpaqDueDate: () => cy.getByData(this._cyDataSelectors.changeLpaqDueDate), // refactor this
		changeStartDate: () => cy.getByData(this._cyDataSelectors.changeStartDate),
		getTimetableDate: (timeTableRow) =>
			cy.get(`.appeal-${timeTableRow} > .govuk-summary-list__value`),
		getTimetableChangeLink: (timeTableRow) =>
			cy.get(`.appeal-${timeTableRow} > .govuk-summary-list__actions`),
		getAppealRefCaseDetails: () => cy.get('.govuk-caption-l'),
		removeFileUpload: () => cy.get('Button').contains('Remove'),
		fileUploadRow: () => cy.get('.govuk-heading-s'),
		caseNotes: () => cy.get('.govuk-details__summary-text'),
		inputCaseNotes: () => cy.get('textArea'),
		checkCaseNoteAdded: () => cy.get('section'),
		changeAppellant: () => cy.getByData(this._cyDataSelectors.changeAppellant),
		changeAgent: () => cy.getByData(this._cyDataSelectors.changeAgent),
		getCorrectioNotice: () => cy.get('#correction-notice'),
		getWarningText: () => cy.get('.govuk-warning-text__text'),
		manageCrossTeamCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.manageCrossTeamCorrespondence),
		manageInspectorCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.manageInspectorCorrespondence),
		manageMainPartyCorrespondence: () =>
			cy.getByData(this._cyDataSelectors.manageMainPartyCorrespondence),
		decisionOutcomeText: () => cy.get('.govuk-inset-text'),
		manageAppellantCostApplication: () =>
			cy
				.get('.govuk-table__row')
				.contains('Appellant application')
				.siblings()
				.eq(1)
				.children()
				.first()
				.children()
				.first(), //Returns the manage link next in the Costs decsion row under costs section

		manageAppellantCostWithdrawal: () =>
			cy
				.get('.govuk-table__row')
				.contains('Appellant withdrawal')
				.siblings()
				.eq(1)
				.children()
				.first()
				.children()
				.first(), //Returns the manage link next in the Costs decsion row under costs section

		manageLpaCostApplication: () =>
			cy
				.get('.govuk-table__row')
				.contains('LPA application')
				.siblings()
				.eq(1)
				.children()
				.first()
				.children()
				.first(), //Returns the manage link next in the Costs decsion row under costs section

		manageLpaCostWithdrawal: () =>
			cy
				.get('.govuk-table__row')
				.contains('LPA withdrawal')
				.siblings()
				.eq(1)
				.children()
				.first()
				.children()
				.first(), //Returns the manage link next in the Costs decsion row under costs section
		changeRedactionStatus: () =>
			cy.get('.govuk-summary-list__key').contains('Redaction status').siblings().eq(1).children(),
		changeDocFileName: () =>
			cy.get('.govuk-summary-list__key').contains('Name').siblings().eq(1).children(),
		redactionStatus: () =>
			cy.get('.govuk-summary-list__key').contains('Redaction status').siblings().eq(0),
		docVersionNumber: () => cy.get('.govuk-summary-list__key').contains('Version').siblings().eq(0),
		documentName: () => cy.get('.govuk-summary-list__key').contains('Name').siblings().eq(0),
		fileNameTextInput: () => cy.get('#file-name'),
		siteVisitBanner: () => cy.getByData(this._cyDataSelectors.setupSiteVisitBanner),
		ipCommentsReviewLink: () => cy.getByData(this._cyDataSelectors.reviewIpComments),
		lpaStatementReviewLink: () => cy.getByData(this._cyDataSelectors.reviewLpaStatement),
		caseStatusTag: () => cy.get('.govuk-grid-column-full > .govuk-grid-column-full > .govuk-tag'),
		rowChangeLink: (row) => cy.getByData(`change-${row}`),
		changeLinkByLabel: (label) =>
			cy
				.contains('.govuk-summary-list__row', label)
				.find('.govuk-summary-list__actions a.govuk-link'),
		viewLpaStatement: () => cy.getByData('view-lpa-statement'),
		showMoreToggle: () => cy.get('.pins-show-more__toggle-label'),
		showMoreContent: () => cy.get('.pins-show-more'),
		lPAStatementTableChangeLink: (row) =>
			cy.get('.govuk-summary-list__key').contains(row).siblings().children('a'),
		caseDetailsHearingSectionButton: () => cy.get('#case-details-hearing-section > .govuk-button'),
		caseDetailsHearingEstimateLink: () => cy.get('#case-details-hearing-section p > a'),
		changeApplicationReferenceLink: () =>
			cy.getByData(this._cyDataSelectors.changeApplicationReference),
		planningApplicationReferenceField: () => cy.get('#planning-application-reference'),
		viewCaseHistory: () => cy.getByData(this._cyDataSelectors.viewCaseHistory),
		cancelHearing: () => cy.get('#cancelHearing'),
		hearingBannerLink: () => cy.getByData(this._cyDataSelectors.hearingBannerLink),
		inquiryBannerLink: () => cy.getByData(this._cyDataSelectors.inquiryBannerLink),
		hearingBannerAddressLink: () => cy.getByData(this._cyDataSelectors.hearingBannerAddressLink),
		setUpTimetableHearingDate: () => cy.getByData(this._cyDataSelectors.setUpTimetableHearingDate),
		timeTableRows: () => cy.get('.appeal-case-timetable dt'),
		personalListFilterDropdown: () => cy.get('.govuk-select'),
		caseDetailsSections: () => cy.get('#main-content'),
		pageHeading: () => cy.get(this._cyDataSelectors.pageHeading),
		inquiryEstimatedDaysInput: () => cy.get('#inquiry-estimation-days'),
		line1: () => cy.get('#address-line-1'),
		line2: () => cy.get('#address-line-2'),
		town: () => cy.get('#town'),
		county: () => cy.get('#county'),
		postcode: () => cy.get('#post-code'),
		changeInquiryDate: () => cy.getByData(this._cyDataSelectors.changeInquiryDate),
		changeInquiryExpectedDays: () => cy.getByData(this._cyDataSelectors.changeInquiryNumberOfDays),
		relatedAppealValue: (caseObj) => cy.get(`[data-cy="related-appeal-${caseObj}"]`),
		estimatedPreparationTime: () => cy.get('#preparation-time'),
		estimatedSittingTime: () => cy.get('#sitting-time'),
		estimatedReportingTime: () => cy.get('#reporting-time'),
		caseDetailsInquiryEstimateLink: () => cy.get('#addInquiryEstimates'),
		caseOfficerValue: () => cy.get('.appeal-case-officer .govuk-summary-list__value'),
		addAppellantWithdrawal: () => cy.getByData(this._cyDataSelectors.addAppellantWithdrawal),
		addLpaWithdrawal: () => cy.getByData(this._cyDataSelectors.addLpaWithdrawal),
		addNetResidence: () => cy.getByData(this._cyDataSelectors.addNetResidence)
	};
	/********************************************************
	 ************************ Actions ************************
	 *********************************************************/

	clickViewLpaQuestionnaire() {
		this.elements.viewLpaQuestionnaire().click();
	}

	clickManageAppellantCostApplication() {
		this.elements.manageAppellantCostApplication().click();
	}

	clickManageAppellanCostWithdrawal() {
		this.elements.manageAppellantCostWithdrawal().click();
	}

	clickManageLpaCostApplication() {
		this.elements.manageLpaCostApplication().click();
	}

	clickManageLpaCostWithdrawal() {
		this.elements.manageLpaCostWithdrawal().click();
	}

	checkDocVersionNumber(versionNumber) {
		let version = this.elements.docVersionNumber().invoke('prop', 'innerText');
		version.should('eq', versionNumber);
	}

	checkFileName(fileName) {
		let nameOfFile = this.elements.documentName().invoke('prop', 'innerText');
		nameOfFile.should('eq', fileName);
	}

	clickChangeRedactionStatus() {
		this.elements.changeRedactionStatus().click();
	}

	clickChangeFileName() {
		this.elements.changeDocFileName().click();
	}

	updateFileName(newFileName) {
		this.elements.fileNameTextInput().clear();
		this.elements.fileNameTextInput().type(newFileName);
	}

	checkRedactionStatus(status) {
		let redactionStatus = this.elements.redactionStatus().invoke('prop', 'innerText');
		redactionStatus.should('eq', status);
	}

	searchForCaseOfficer(text) {
		this.fillUsersInput(text);
		this.clickButtonByText('Continue');
	}

	clickAddAdditionalDocs() {
		this.basePageElements.additionalDocumentsAdd().click();
	}

	clickManageAdditionalDocs() {
		this.basePageElements.additonalDocumentManage().click();
	}

	clickChooseCaseOfficerResult(email) {
		cy.getByData(email.toLocaleLowerCase()).click();
	}

	clickReviewLpaq() {
		this.elements.reviewLpaQuestionnaire().click();
	}

	clickAssignCaseOfficer() {
		this.elements.assignCaseOfficer().click();
	}

	clickAssignInspector() {
		this.elements.assignInspector().click();
	}

	clickReviewAppellantCase() {
		this.elements.reviewAppeallantCase().click();
	}

	clickSetUpSiteVisitType() {
		this.clickButtonByText('Set up site visit');
	}

	clickReadyToStartCase() {
		this.elements.readyToStart().click();
	}

	clickCaseNotes() {
		this.elements.caseNotes().click();
	}

	clickIssueAppellantCostsDecision() {
		this.elements.issueAppellantCostsDecision().click({ force: true });
	}

	clickIssueLpaCostsDecision() {
		this.elements.issueLpaCostsDecision().click({ force: true });
	}
	clickChangeInquiryDate() {
		this.elements.changeInquiryDate().click();
	}
	clickChangeInquiryEstimatedDays() {
		this.elements.changeInquiryExpectedDays().click();
	}

	inputCaseNotes(text, index = 0) {
		this.elements.inputCaseNotes().eq(index).clear().type(text);
	}

	checkCaseNoteAdded(text) {
		this.elements.checkCaseNoteAdded().contains(text);
	}

	clickArrangeVisitTypeHasCaseTimetable() {
		this.elements.arrangeScheduleVisit().click();
	}

	clickChangeVisitTypeHasCaseTimetable() {
		this.elements.changeScheduleVisit().click();
	}

	clickIssueDecision() {
		this.elements.issueDecision().click();
	}

	clickAddLinkedAppeal() {
		this.elements.addLinkedAppeal().click();
	}

	clickManageLinkedAppeals() {
		this.elements.manageLinkedAppeals().click();
	}

	clickAddRelatedAppeals() {
		this.elements.addRelatedAppeals().click();
	}

	clickManageRelatedAppeals() {
		this.elements.manageRelatedAppeals().click();
	}

	clickAddCrossTeamCorrespondence() {
		this.elements.addCrossTeamCorrespondence().click();
	}

	clickAddNotifyingParties() {
		this.elements.addNotifiyingParties().click();
	}

	clickManageNotifyingParties() {
		this.elements.manageNotifyingParties().click();
	}

	clickAddInspectorCorrespondence() {
		this.elements.addInspectorCorrespondence().click();
	}

	clickAddMainPartyCorrespondence() {
		this.elements.addMainPartyCorrespondence().click();
	}

	clickManageInspectorCorrespondence() {
		this.elements.manageInspectorCorrespondence().click();
	}

	clickManageCrossTeamCorrespondence() {
		this.elements.manageCrossTeamCorrespondence().click();
	}

	clickManageMainPartyCorrespondence() {
		this.elements.manageMainPartyCorrespondence().click();
	}

	clickChangeAppealType() {
		this.elements.changeAppealType().click();
	}

	clickIssueAppellantCostsDecision() {
		this.elements.issueAppellantCostsDecision().click();
	}

	clickAddAppellantApplication() {
		this.elements.addAppellantApplication().click();
	}

	clickAddAppellantWithdrawal() {
		this.elements.addAppellantWithdrawal().click();
	}

	clickAddLpaWithdrawal() {
		this.elements.addLpaWithdrawal().click();
	}

	clickChangeSiteOwnership() {
		this.elements.changeSiteOwnership().click();
	}

	clickChangeLpaqDueDate() {
		this.elements.changeLpaqDueDate().click();
	}
	clickChangeStartDate() {
		this.elements.changeStartDate().click();
	}

	clickStartAppealCancel() {
		this.elements.startAppealCancel().click();
	}

	clickChangeAppellant() {
		this.elements.changeAppellant().click();
	}

	clickChangeAgent() {
		this.elements.changeAgent().click();
	}

	uploadSampleFile(fileName) {
		this.elements
			.uploadFile()
			.click()
			.selectFile(this.fixturesPath + fileName, { action: 'drag-drop' }, { force: true });
	}

	inputAppellantEmailAddress(text) {
		this.elements.getAppellantEmailAddress().click().clear().type(text);
	}

	inputAgentEmailAddress(text) {
		this.elements.getAgentEmailAddress().click().clear().type(text);
	}
	// TODO Get this to use the vanilla 'clickButtonByText()' function
	// This currently doesn't work, as there are multiple matches and some of not invisible
	clickAddAnother() {
		cy.get(this.selectors.button).filter(':visible').contains('Add another').click();
	}
	addHearingLocationAddress(address) {
		this.elements.line1().clear().type(address.line1);
		this.elements.line2().clear().type(address.line2);
		this.elements.town().clear().type(address.town);
		this.elements.county().clear().type(address.county);
		this.elements.postcode().clear().type(address.postcode);
		this.clickButtonByText('Continue');
	}

	addInquiryAddress(address) {
		this.elements.line1().clear().type(address.line1);
		this.elements.line2().clear().type(address.line2);
		this.elements.town().clear().type(address.town);
		this.elements.county().clear().type(address.county);
		this.elements.postcode().clear().type(address.postcode);
	}

	addEstimates(preparationTime, sittingTime, reportingTime) {
		this.elements.estimatedPreparationTime().clear().type(preparationTime);
		this.elements.estimatedSittingTime().clear().type(sittingTime);
		this.elements.estimatedReportingTime().clear().type(reportingTime);
		this.clickButtonByText('Continue');
	}

	clickAddAgreementToChangeDescriptionEvidence() {
		this.elements.addAgreementToChangeDescriptionEvidence().click();
	}

	clickManageAgreementToChangeDescriptionEvidence() {
		this.elements.manageAgreementToChangeDescriptionEvidence().click();
	}

	confirmCostDecisionStatus(text) {
		this.elements.costDecisionStatus().contains(text);
	}

	clickRemoveRelatedAppealByRef(caseObjToRelate) {
		cy.log(caseObjToRelate);
		cy.getByData('remove-appeal-' + caseObjToRelate).click();
	}

	clickLinkedAppeal(caseObj) {
		cy.getByData(this._cyDataSelectors.linkedAppeal + caseObj.reference).click();
	}

	clickRemoveFileUpload(fileName) {
		this.elements.fileUploadRow().contains(fileName).next().click();
	}

	changeFileManageDocuments(rowName) {
		this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.next()
			.invoke('prop', 'firstChildElement', 'href')
			.click();
	}

	viewDecisionLetter(text) {
		this.basePageElements.linkByText(text);
	}

	clickViewDecisionLetter(text) {
		this.basePageElements.linkByText(text).click();
	}

	clickSiteVisitBanner(caseObj) {
		this.elements.siteVisitBanner(caseObj).click();
	}

	clickRowChangeLink(row) {
		this.elements.rowChangeLink(row).click();
	}

	clickChangeLinkByLabel(label) {
		this.elements.changeLinkByLabel(label).click();
	}

	clickLpaStatementChangeLink(row) {
		this.elements.lPAStatementTableChangeLink(row).click();
	}

	clickHearingButton() {
		this.elements.caseDetailsHearingSectionButton().click();
	}

	clickHearingEstimateLink() {
		this.elements.caseDetailsHearingEstimateLink().click();
	}

	clickInquiryEstimateLink() {
		this.elements.caseDetailsInquiryEstimateLink().click();
	}

	clickViewCaseHistory() {
		this.elements.viewCaseHistory().click();
	}

	clickCancelHearing() {
		this.elements.cancelHearing().click();
	}

	clickHearingBannerLink() {
		this.elements.hearingBannerLink().click();
	}

	clickInquiryBannerLink() {
		this.elements.inquiryBannerLink().click();
	}

	clickHearingBannerAddressLink() {
		this.elements.hearingBannerAddressLink().click();
	}

	clickSetUpTimetableHearingDate() {
		this.elements.setUpTimetableHearingDate().click();
	}

	clickIndividualLinkWhenMultiple(area, linkText) {
		cy.contains(area)
			.parents('.govuk-summary-card__title-wrapper')
			.within(() => {
				cy.contains('a', linkText).click();
			});
	}

	clickIndividualLinkWhenMultipleTable(area, linkText) {
		cy.contains('.govuk-table__header', area)
			.closest('tr')
			.within(() => {
				cy.contains('a', linkText).click();
			});
	}

	filterPersonalList(text) {
		this.basePageElements.summaryDetails().click();
		this.elements.personalListFilterDropdown().select(text);
		this.clickButtonByText('Apply');
	}

	inputEstimatedInquiryDays(estimatedInquiryDays) {
		this.elements.inquiryEstimatedDaysInput().type(estimatedInquiryDays.toString());
	}

	inputCorrectionNotice(correctionNotice) {
		this.elements.getCorrectioNotice().click().clear().type(correctionNotice);
	}

	clickAddNetResidence() {
		this.elements.addNetResidence().click();
	}

	/***************************************************************
	 ************************ Verification ************************
	 ****************************************************************/

	assertRelatedAppealValue(caseObj) {
		this.elements.relatedAppealValue(caseObj).should('be.visible');
	}

	checkAdditonalDocsAppellantCase(value) {
		this.basePageElements.summaryListValue().last().contains(value).should('be.visible');
	}

	checkFileNameDisplays(fileName) {
		cy.get('p').contains(fileName).should('be.visible');
	}

	checkFileNameRemoved(fileName) {
		let savedFile = cy.get('p').contains(fileName);
		savedFile.should('not.exist');
	}

	checkAnswerRedactionStatus(rowName, rowAnswer) {
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.invoke('prop', 'innerText');
		answer.should('eq', rowAnswer);
	}

	checkCorrectAnswerDisplays(rowName, rowAnswer) {
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.invoke('prop', 'innerText');
		answer.should('eq', rowAnswer);
	}

	checkAnswerCorrespondenceDoc(rowName, rowAnswer) {
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.children()
			.invoke('prop', 'textContent');
		answer.should('eq', rowAnswer);
	}

	checkAnswerNotifyingParties(rowName, rowAnswer) {
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.invoke('prop', 'textContent');
		answer.should('include', rowAnswer);
	}

	checkDecisionOutcome(text) {
		this.elements.decisionOutcomeText().contains(text, { matchCase: false });
	}

	checkAddLinkedAppealDoesNotExist() {
		this.elements.addLinkedAppeal().should('not.exist');
	}

	verifyNumberOfLinkedAppeals(num) {
		this.elements.linkedAppeal().should('have.length', num);
	}

	checkViewDecisionLetterIsLink(text) {
		this.elements.decisionOutcomeText().contains(this.basePageElements.link, text);
	}

	getCaseOfficer() {
		return this.elements
			.caseOfficerValue()
			.invoke('text')
			.then((text) => text.split('\n')[0].trim());
	}

	verifyAnswerSummaryValue(answer) {
		this.elements.answerCellAppeals(answer).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((text) =>
					expect(text.trim().toLocaleLowerCase()).to.include(answer.toLocaleLowerCase())
				);
		});
	}

	verifyTableCellTextCaseHistory(answer, isIncluded = true) {
		const expectedText = answer.toLocaleLowerCase();

		this.basePageElements.tableCell(answer).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((t) => {
					const text = t.trim().toLocaleLowerCase();
					const assertionBase = isIncluded ? expect(text).to : expect(text).to.not;
					const errorMessage = isIncluded
						? `${answer} is not included`
						: `${answer} should not be included`;
					assertionBase.include(expectedText, errorMessage);
				});
		});
	}

	verifyDateChanges(timeTableRow, date) {
		const formattedDate = formatDateAndTime(date).date;
		this.elements
			.getTimetableDate(timeTableRow)
			.invoke('text')
			.then((dateText) => {
				expect(dateText.trim()).to.equal(formattedDate);
			});
	}

	verifyDatesChanged(timeTableRows, startDate, intervalDays) {
		timeTableRows.forEach((row, index) => {
			if (!row.editable) return;

			const expectedDate = new Date(startDate);
			expectedDate.setDate(expectedDate.getDate() + index * intervalDays);

			const formattedExpected = formatDateAndTime(expectedDate).date;

			this.elements
				.getTimetableDate(row.row)
				.invoke('text')
				.then((dateText) => {
					expect(dateText.trim()).to.equal(formattedExpected);
				});
		});
	}

	verifyCaseDetailsValue(rowName, text) {
		this.basePageElements
			.summaryListKey()
			.then(($elem) => {
				return $elem.filter((index, el) => el.innerText.trim() === rowName);
			})
			.next()
			.contains(text);
	}

	verifyCheckYourAnswerDate(rowName, dateToday) {
		//verify the date on check your answer page is correct
		const formattedDate = formatDateAndTime(dateToday).date;
		this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.invoke('prop', 'innerText')
			.then((dateText) => {
				expect(dateText.toString().trim()).to.equal(formattedDate);
			});
	}

	verifyAppealRefOnCaseDetails(caseObj) {
		this.elements.getAppealRefCaseDetails().contains(caseObj);
	}

	verifyCheckYourAnswers(label, value) {
		cy.contains('dt.govuk-summary-list__key', label)
			.parents('.govuk-summary-list__row')
			.find('dd.govuk-summary-list__value')
			.invoke('text')
			.then((t) => t.trim())
			.should('contain', value); // or .should('equal', expected) if exact
	}

	verifyWarningText(text) {
		this.elements.getWarningText().contains(text);
	}

	reviewIpComments(valid) {
		const rbValue = valid ? 'Accept comment' : 'Reject comment';
		this.elements.ipCommentsReviewLink().click();
		this.clickLinkByText('Review');
		this.selectRadioButtonByValue(rbValue);
		this.clickButtonByText('Confirm');
		if (valid === false) {
			this.chooseCheckboxByText('Not relevant to this appeal');
			this.clickButtonByText('Continue');
			this.selectRadioButtonByValue('No');
			this.clickButtonByText('Continue');
			this.clickButtonByText('Reject comment');
		}
	}

	reviewLpaStatement(isAllocationPageExist = true) {
		this.elements.lpaStatementReviewLink().click();
		this.selectRadioButtonByValue('Accept statement');
		this.clickButtonByText('Continue');
		if (isAllocationPageExist) {
			this.selectRadioButtonByValue('A');
			this.clickButtonByText('Continue');
			this.selectCheckbox();
		} else {
			this.selectRadioButtonByValue('No');
		}
		this.clickButtonByText('Continue');
		this.clickButtonByText('Confirm');
	}

	reviewFinalComment(type) {
		cy.reload();
		this.basePageElements.bannerLink().click();
		this.selectRadioButtonByValue('Accept final comment');
		this.clickButtonByText('Continue');
		this.clickButtonByText(`Accept ${type} final comment`);
	}

	checkTimetableDueDatesAndChangeLinks(timetableItems) {
		timetableItems.forEach((timetableItem) => {
			this.elements.getTimetableDate(timetableItem.row).should('be.visible');
			if (timetableItem.editable) {
				this.elements.getTimetableChangeLink(timetableItem.row).should('be.visible');
			}
		});
	}

	changeTimetableDates(timetableItems, date, intervalDays) {
		dateTimeSection.enterDueDates(timetableItems, date, intervalDays);
		this.clickButtonByText('Continue');
	}

	enterTimeTableDueDatesCaseStart(timetableItems, date, intervalDays) {
		dateTimeSection.enterInquiryDueDates(timetableItems, date, intervalDays);
	}

	clickUpdateTimetableDueDates(date) {
		this.clickButtonByText('Update timetable due dates');
	}

	acceptLpaStatement(caseObj, updateAllocation, representation) {
		cy.log('problem is here');
		cy.addRepresentation(caseObj, 'lpaStatement', null, representation).then((caseObj) => {
			cy.reload();
		});
		this.elements.lpaStatementReviewLink().click();
		this.selectRadioButtonByValue('Accept statement');
		this.clickButtonByText('Continue');
		this.selectRadioButtonByValue(updateAllocation);
		this.clickButtonByText('Continue');
	}

	verifyStatementIsDisplayed(statement, isToggleDisplayed) {
		if (isToggleDisplayed) {
			this.elements.showMoreToggle().contains('Read more').should('be.visible');
			this.elements.showMoreToggle().click();
			this.elements.showMoreToggle().contains('Close').should('be.visible');
		} else {
			this.elements.showMoreToggle().should('not.exist');
		}
		this.elements.showMoreContent().should('contain.text', statement);
	}

	verifyHearingEstimateSectionIsDisplayed() {
		this.elements.caseDetailsHearingEstimateLink().should('contain.text', 'Add hearing estimates');
	}

	verifyHearingSectionIsDisplayed() {
		this.elements.caseDetailsHearingSectionButton().should('be.visible');
	}

	clickChangeApplicationReferenceLink() {
		this.elements.changeApplicationReferenceLink().click();
	}

	updatePlanningApplicationReference(reference) {
		this.elements.planningApplicationReferenceField().clear().type(reference);
		this.clickButtonByText('Continue');
	}

	shareIpAndLpaComments() {
		this.basePageElements.bannerLink().click();
		this.clickButtonByText('Confirm');
	}

	verifyTimeTableRows = (expectedRows) => {
		const actualRows = [];

		this.elements
			.timeTableRows()
			.each(($el) => actualRows.push($el.text().trim()))
			.then(() => expect(actualRows).to.deep.equal(expectedRows));
	};

	verifyCaseDetailsSection = (expectedSections) => {
		this.elements
			.caseDetailsSections()
			.find('h2.govuk-heading-l')
			.should(($h1s) => {
				const actual = [...$h1s].map((h) => h.textContent.replace(/\s+/g, ' ').trim());

				expect(actual).to.deep.equal(expectedSections);
			});
	};

	verifyAppealType(expectedAppealType) {
		this.elements.appealType().should('contain', expectedAppealType);
	}

	checkHeading = (expectedText) => {
		this.elements.pageHeading().should('have.text', expectedText);
	};

	verifyChangeLinkVisibility = (row, shouldBeVisibile = true) => {
		const visibilityAssertion = shouldBeVisibile ? 'be.visible' : 'not.exist';
		this.elements.rowChangeLink(row).should(visibilityAssertion);
	};
}
