// @ts-nocheck
import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { Page } from './basePage';
import { DateTimeSection } from './dateTimeSection.js';

const dateTimeSection = new DateTimeSection();
export class CaseDetailsPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		reviewLpaQuestionnaire: 'review-lpa-questionnaire',
		changeCaseOfficer: 'change-case-officer',
		assignCaseOfficer: 'assign-case-officer',
		assignInspector: 'assign-inspector',
		changeInspector: 'change-inspector',
		reviewAppellantCase: 'review-appellant-case',
		changeSetVisitType: 'change-set-visit-type',
		changeScheduleVisit: 'change-schedule-visit',
		arrangeScheduleVisit: 'arrange-schedule-visit',
		readyToStart: 'ready-to-start',
		issueDetermination: 'issue-determination',
		addLinkedAppeal: 'add-linked-appeal',
		manageLinkedAppeals: 'manage-linked-appeals',
		addRelatedAppeals: 'add-related-appeals',
		addCrossTeamCorrespondence: 'add-cross-team-correspondence',
		addInspectorCorrespondence: 'add-inspector-correspondence',
		manageRelatedAppeals: 'manage-related-appeals',
		changeAppealType: 'change-appeal-type',
		addAgreementToChangeDescriptionEvidence: 'add-agreement-to-change-description-evidence',
		addNotifyingParties: 'add-notifying-parties',
		manageNotifyingParties: 'manage-notifying-parties',
		manageAgreementToChangeDescriptionEvidence: 'manage-agreement-to-change-description-evidence',
		addCostsDecision: 'add-costs-decision',
		changeSiteOwnership: 'change-site-ownership',
		changeLpaqDueDate: 'change-lpa-questionnaire-due-date',
		changeStartDate: 'change-start-case-date',
		startAppealWithdrawal: 'start-appeal-withdrawal',
		viewAppealWithdrawal: 'view-appeal-withdrawal'
	};

	fixturesPath = 'cypress/fixtures/';

	sampleFiles = {
		document: 'sample-file.doc',
		img: 'sample-img.jpeg',
		pdf: 'test.pdf'
	};

	elements = {
		reviewLpaQuestionnaire: () => cy.getByData(this._cyDataSelectors.reviewLpaQuestionnaire),
		changeCaseOfficer: () => cy.getByData(this._cyDataSelectors.changeCaseOfficer),
		assignCaseOfficer: () => cy.getByData(this._cyDataSelectors.assignCaseOfficer),
		assignInspector: () => cy.getByData(this._cyDataSelectors.assignInspector),
		changeInspector: () => cy.getByData(this._cyDataSelectors.changeInspector),
		answerCellAppeals: (answer) =>
			cy.contains(this.selectors.summaryListValue, answer, { matchCase: false }),
		reviewAppeallantCase: () => cy.getByData(this._cyDataSelectors.reviewAppellantCase),
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
		manageLinkedAppeals: () => cy.getByData(this._cyDataSelectors.manageLinkedAppeals),
		manageNotifyingParties: () => cy.getByData(this._cyDataSelectors.manageNotifyingParties),
		clickLinkedAppeal: () => cy.getByData(this._cyDataSelectors.clickLinkedAppeal),
		manageRelatedAppeals: () => cy.getByData(this._cyDataSelectors.manageRelatedAppeals),
		uploadFile: () => cy.get('#upload-file-1'),
		changeAppealType: () => cy.getByData(this._cyDataSelectors.changeAppealType),
		addAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.addAgreementToChangeDescriptionEvidence),
		addNotifiyingParties: () => cy.getByData(this._cyDataSelectors.addNotifyingParties),
		manageAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.manageAgreementToChangeDescriptionEvidence),
		addCostsDecision: () => cy.getByData(this._cyDataSelectors.addCostsDecision),
		costDecisionStatus: () => cy.get('.govuk-table__cell appeal-costs-decision-status'),
		changeSiteOwnership: () => cy.getByData(this._cyDataSelectors.changeSiteOwnership),
		changeLpaqDueDate: () => cy.getByData(this._cyDataSelectors.changeLpaqDueDate),
		changeStartDate: () => cy.getByData(this._cyDataSelectors.changeStartDate),
		getAppealStartDate: () => cy.get('.appeal-start-date > .govuk-summary-list__value'),
		startAppealWithdrawal: () => cy.getByData(this._cyDataSelectors.startAppealWithdrawal),
		getAppealRefCaseDetails: () => cy.get('.govuk-caption-l'),
		removeFileUpload: () => cy.get('Button').contains('Remove'),
		fileUploadRow: () => cy.get('.govuk-heading-s'),
		viewAppealWithdrawal: () => cy.getByData(this._cyDataSelectors.viewAppealWithdrawal)
	};
	/********************************************************
	 ************************ Actions ************************
	 *********************************************************/

	searchForCaseOfficer(text) {
		this.fillInput(text);
		this.clickButtonByText('Search');
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
		this.clickAccordionByText('Team');
		this.elements.assignCaseOfficer().click();
	}

	clickChangeCaseOfficer() {
		this.clickAccordionByText('Team');
		this.elements.changeCaseOfficer().click();
	}

	clickAssignInspector() {
		this.clickAccordionByText('Team');
		this.elements.assignInspector().click();
	}

	clickChangeInspector() {
		this.clickAccordionByText('Team');
		this.elements.changeInspector().click();
	}

	clickReviewAppellantCase() {
		this.clickAccordionByButton('Documentation');
		this.elements.reviewAppeallantCase().click();
	}

	clickChangeVisitTypeHasSiteDetails() {
		this.clickAccordionByButton('Site');
		this.elements.changeSetVisitType().click();
	}

	clickReadyToStartCase() {
		this.elements.readyToStart().click();
	}

	clickArrangeVisitTypeHasCaseTimetable() {
		this.clickAccordionByText('Timetable');
		this.elements.arrangeScheduleVisit().click();
	}

	clickChangeVisitTypeHasCaseTimetable() {
		this.clickAccordionByText('Timetable');
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

	clickChangeAppealType() {
		this.elements.changeAppealType().click();
	}

	clickAddCostsDecision() {
		this.elements.addCostsDecision().click();
	}

	clickChangeSiteOwnership() {
		this.elements.changeSiteOwnership().click();
	}

	clickChangeLpaqDueDate() {
		this.clickAccordionByText('Timetable');
		this.elements.changeLpaqDueDate().click();
	}
	clickChangeStartDate() {
		this.clickAccordionByText('Timetable');
		this.elements.changeStartDate().click();
	}

	clickStartAppealWithdrawal() {
		this.elements.startAppealWithdrawal().click();
	}

	uploadSampleFile(fileName) {
		this.elements.uploadFile().selectFile(this.fixturesPath + fileName, { force: true });
	}

	clickViewAppealWithdrawal() {
		this.elements.viewAppealWithdrawal().click();
	}

	// TODO Get this to use the vanilla 'clickButtonByText()' function
	// This currently doesn't work, as there are multiple matches and some of not invisible
	clickAddAnother() {
		cy.get(this.selectors.button).filter(':visible').contains('Add another').click();
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

	clickRemoveRelatedAppealByRef(caseRefToRelate) {
		cy.log(caseRefToRelate);
		cy.getByData('remove-appeal-' + caseRefToRelate).click();
	}

	clickLinkedAppeal(caseRef) {
		cy.getByData('linked-appeal-' + caseRef).click();
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

	/***************************************************************
	 ************************ Verfifications ************************
	 ****************************************************************/

	checkAdditonalDocsAppellantCase(value) {
		this.basePageElements.summaryListValue().last().contains(value).should('be.visible');
	}

	checkErrorMessageDisplays(errorMessage) {
		cy.get('li').contains(errorMessage).should('be.visible');
	}

	checkFileNameDisplays(fileName) {
		cy.get('p').contains(fileName).should('be.visible');
	}

	checkFileNameRemoved(fileName) {
		let savedFile = cy.get('p').contains(fileName);
		savedFile.should('not.exist');
	}

	checkAnswerWithdrawalRequest(rowName, rowAnswer) {
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.children()
			.invoke('prop', 'textContent');
		answer.should('eq', rowAnswer);
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

	verifyAnswerSummaryValue(answer) {
		this.elements.answerCellAppeals(answer).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((text) =>
					expect(text.trim().toLocaleLowerCase()).to.include(answer.toLocaleLowerCase())
				);
		});
	}

	verifyTableCellTextCaseHistory(answer) {
		this.basePageElements.tableCell(answer).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((text) =>
					expect(text.trim().toLocaleLowerCase()).to.include(answer.toLocaleLowerCase())
				);
		});
	}

	verifyChangeStartDate() {
		const dateToday = new Date();
		const formattedDate = dateTimeSection.formatDate(dateToday);
		this.elements
			.getAppealStartDate()
			.invoke('text')
			.then((dateText) => {
				expect(dateText.trim()).to.equal(formattedDate);
			});
	}

	verifyCheckYourAnswerDate(rowName, dateToday) {
		//verifys the date on check your answer page is correct
		const formattedDate = dateTimeSection.formatDate(dateToday);
		let answer = this.basePageElements
			.summaryListKey()
			.contains(rowName)
			.next()
			.invoke('prop', 'innerText')
			.then((dateText) => {
				expect(dateText.trim()).to.equal(formattedDate);
			});
	}

	verifyAppealRefOnCaseDetails(caseRef) {
		this.elements.getAppealRefCaseDetails().contains(caseRef);
	}
}
