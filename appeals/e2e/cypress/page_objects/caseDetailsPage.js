// @ts-nocheck
import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { Page } from './basePage';

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
		arrangeScheduleVisit: 'arrange-schedule-visit',
		readyToStart: 'ready-to-start',
		issueDetermination: 'issue-determination',
		addLinkedAppeal: 'add-linked-appeal',
		uploadFile: '#upload-file-1',
		changeAppealType: 'change-appeal-type',
		addAgreementToChangeDescriptionEvidence: 'add-agreement-to-change-description-evidence',
		manageAgreementToChangeDescriptionEvidence: 'manage-agreement-to-change-description-evidence',
		addCostsDecision: 'add-costs-decision'
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
		arrangeScheduleVisit: () => cy.getByData(this._cyDataSelectors.arrangeScheduleVisit),
		readyToStart: () => cy.getByData(this._cyDataSelectors.readyToStart),
		issueDecision: () => cy.getByData(this._cyDataSelectors.issueDetermination),
		addLinkedAppeal: () => cy.getByData(this._cyDataSelectors.addLinkedAppeal),
		uploadFile: () => cy.get(this.selectors.uploadFile),
		changeAppealType: () => cy.getByData(this._cyDataSelectors.changeAppealType),
		addAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.addAgreementToChangeDescriptionEvidence),
		manageAgreementToChangeDescriptionEvidence: () =>
			cy.getByData(this._cyDataSelectors.manageAgreementToChangeDescriptionEvidence),
		addCostsDecision: () => cy.getByData(this._cyDataSelectors.addCostsDecision),
		costDecisionStatus: () => cy.get('.govuk-table__cell appeal-costs-decision-status')
	};
	/********************************************************
	 ************************ Actions ************************
	 *********************************************************/

	searchForCaseOfficer(text) {
		this.fillInput(text);
		this.clickButtonByText('Search');
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

	clickChangeVisitTypeHasCaseTimetable() {
		this.clickAccordionByText('Timetable');
		this.elements.arrangeScheduleVisit().click();
	}

	clickIssueDecision() {
		this.elements.issueDecision().click();
	}

	clickAddLinkedAppeal() {
		this.elements.addLinkedAppeal().click();
	}

	clickChangeAppealType() {
		this.elements.changeAppealType().click();
	}

	clickAddCostsDecision() {
		this.elements.addCostsDecision().click();
	}

	uploadSamplePdf() {
		cy.get('#upload-file-1').selectFile('cypress/fixtures/sample-file.doc', { force: true });
	}
	uploadTestPdf() {
		cy.get('#upload-file-1').selectFile('cypress/fixtures/test.pdf', { force: true });
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

	/***************************************************************
	 ************************ Verfifications ************************
	 ****************************************************************/


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
}
