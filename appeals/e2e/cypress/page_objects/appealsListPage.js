// @ts-nocheck

import { Page } from './basePage';

export class AppealsListPage extends Page {
	_selectors = {
		input1: '.govuk-input',
		link: 'govuk-link',
		uniqueSelector: 'selector-name',
		summaryListValue: '.govuk-summary-list__value'
	};

	_cyDataSelectors = {
		reviewLpaQuestionnaire: 'review-lpa-questionnaire',
		reviewAppellantCase: 'review-appellant-case',
		changeSetVisitType: 'change-set-visit-type',
		changeCaseOfficer: 'change-case-officer',
		assignInspector: 'assign-inspector'
	};

	elements = {
		reviewLpaQuestionnaire: () => cy.getByData(this._cyDataSelectors.reviewLpaQuestionnaire),
		reviewAppeallantCase: () => cy.getByData(this._cyDataSelectors.reviewAppellantCase),
		changeSetVisitType: () => cy.getByData(this._cyDataSelectors.changeSetVisitType),
		changeCaseOfficer: () => cy.getByData(this._cyDataSelectors.changeCaseOfficer),
		assignInspector: () => cy.getByData(this._cyDataSelectors.assignInspector),
		answerCellAppeals: (answer) =>
			cy.contains(this._selectors.summaryListValue, answer, { matchCase: false }),
		link: () => cy.get(this._selectors.link),
		input1: () => cy.get(this._selectors.input1)
	};

	useBaseElementOrSelector() {
		// Methods that returns an element
		this.basePageElements.buttonByLabelText('Click me').click();

		// Methods that perform an action
		this.clickButtonByText('Click me');

		// Selectors from base page eg this.selectors
		cy.get(this.selectors.errorMessage).should('have.text', 'this is an error message');
	}

	//ELEMENTS

	appealsPageElements = {};

	inputCheckboxes = {
		input: () => cy.get(this.selectors.input1)
	};

	//ACTIONS

	clickAccordionByButton(text) {
		this.basePageElements.accordionButton(text).click();
	}

	clickAppealFromList(position) {
		this.basePageElements
			.tableRow()
			.eq(position - 1)
			.find(this.selectors.link)
			.click();
	}

	clickAppealByRef(ref) {
		cy.getByData(ref).click();
	}

	clickStartCaseBanner(text) {
		this.basePageElements.bannerLink(text).click();
	}

	clickReviewLpaq(position) {
		this.clickAccordionByButton('Documentation');
		this.elements.reviewLpaQuestionnaire().click();
	}

	clickReviewAppellantCase() {
		this.clickAccordionByButton('Documentation');
		this.elements.reviewAppeallantCase().click();
	}

	clickChangeVisitTypeHasSiteDetails() {
		this.clickAccordionByText('Site');
		this.elements.changeSetVisitType().click();
	}

	fillInput(text, index = 0) {
		this.basePageElements.input().eq(index).clear().type(text);
	}

	fillInput1(text, index = 1) {
		this.elements.input1().eq(index).clear().type(text);
	}

	fillInput2(text, index = 2) {
		this.basePageElements.input().eq(index).clear().type(text);
	}

	addAnotherButton() {
		cy.get('#conditional-incompleteReason-4 > .pins-add-another > .govuk-button').click();
	}

	addAnotherButtonLpaq() {
		cy.get('#conditional-incompleteReason-2 > .pins-add-another > .govuk-button').click();
	}

	nationalListSearch(text) {
		this.fillInput(text);
		this.clickButtonByText('Search');
	}

	selectAppellantOutcome(outcome) {
		this.clickAccordionByText('Documentation');
		cy.contains(this.selectors.tableHeader, 'Appellant case');
		this.clickAppealFromList(2); // TODO Change this to use clickAppealByRef()
		this.selectRadioButtonByValue(outcome);
	}

	selectLpaqOutcome(outcome) {
		this.clickAccordionByText('Documentation');
		cy.contains(this.selectors.tableHeader, 'LPA Questionnaire');
		this.clickAppealFromList(3); // TODO Change this to use clickAppealByRef()
		this.selectRadioButtonByValue(outcome);
	}

	clickCaseOfficer() {
		this.clickAccordionByText('Team');
		this.elements.changeCaseOfficer().click();
	}

	clickInspector() {
		this.clickAccordionByText('Team');
		this.elements.assignInspector().click();
	}

	checkAnswerSummaryValue(answer) {
		this.appealsPageElements.answerCellAppeals(answer).then(($elem) => {
			cy.wrap($elem)
				.invoke('text')
				.then((text) => expect(text.trim()).to.include(answer));
		});
	}

	checkValueIsBlank(position) {
		this.clickAccordionByText('Case Team');
		this.basePageElements
			.summaryListValue()
			.eq(position - 1)
			.should('not.have.text');
	}

	// ASSERTIONS
	verifySectionHeader(expectedText) {
		this.basePageElements.sectionHeader().filter('h1').should('have.text', expectedText);
	}

	verifyBannerTitle() {
		cy.contains(this.selectors.bannerTitle);
	}

	verifyBannerContent() {
		cy.contains(this.selectors.bannerContent);
	}
}
