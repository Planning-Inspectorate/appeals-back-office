// @ts-nocheck

import { Page } from './basePage';

export class AppealsListPage extends Page {
	// Examples

	_selectors = {
		input1: '.govuk-input',
		link: 'govuk-link',
		uniqueSelector: 'selector-name',
		summaryListValue: '.govuk-summary-list__value'
	};

	clickMyUniqueElement() {
		// Selector from this class this._selectors
		cy.get(this._selectors.uniqueSelector).click();
	}

	useBaseElementOrSelector() {
		// Methods that returns an element
		this.basePageElements.buttonByLabelText('Click me').click();

		// Methods that perform an action
		this.clickButtonByText('Click me');

		// Selectors from base page eg this.selectors
		cy.get(this.selectors.errorMessage).should('have.text', 'this is an error message');
	}

	//ELEMENTS

	appealsPageElements = {
		answerCellAppeals: (answer) =>
			cy.contains(this.selectors.summaryListValue, answer, { matchCase: false }),
		link: () => cy.get(this._selectors.link),
		input1: () => cy.get(this._selectors.input1)
	};

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

	clickStartCaseBanner(text) {
		this.basePageElements.bannerLink(text).click();
	}

	clickReviewLpaq(position) {
		this.clickAccordionByButton('Documentation');
		this.basePageElements
			.tableCell()
			.eq(position - 2)
			.find(this.selectors.link)
			.click();
	}

	clickReviewAppellantCase(position) {
		this.clickAccordionByButton('Documentation');
		this.basePageElements
			.tableCell()
			.eq(position - 1)
			.find(this.selectors.link)
			.click();
	}

	clickChangeVisitTypeHasCaseTimetable() {
		this.clickAccordionByText('Timetable');
		cy.get('.appeal-site-visit > .govuk-summary-list__actions > .govuk-link').click();
	}

	clickChangeVisitTypeHasSiteDetails() {
		this.clickAccordionByText('Site');
		cy.get(
			':nth-child(3) > .govuk-accordion__section-header > .govuk-accordion__section-heading > .govuk-accordion__section-button'
		)
			//cy.get('.appeal-site-visit > .govuk-summary-list__actions > .govuk-link')
			.click();
	}
	fillInput(text, index = 0) {
		this.basePageElements.input().eq(index).clear().type(text);
	}

	fillInput1(text, index = 2) {
		this.appealsPageElements.input1().eq(index).clear().type(text);
	}

	fillInput2(text, index = 2) {
		this.AppealsListPage.input().eq(index).clear().type(text);
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
		this.clickAppealFromList(2);
		this.selectRadioButtonByValue(outcome);
	}

	selectLpaqOutcome(outcome) {
		this.clickAccordionByText('Documentation');
		cy.contains(this.selectors.tableHeader, 'LPA Questionnaire');
		this.clickAppealFromList(3);
		this.selectRadioButtonByValue(outcome);
	}

	verifyBannerTitle() {
		cy.contains(this.selectors.bannerTitle);
	}

	verifyBannerContent() {
		cy.contains(this.selectors.bannerContent);
	}

	clickCaseOfficer() {
		this.clickAccordionByText('Case Team');
		cy.get('.govuk-summary-list > :nth-child(1) > .govuk-summary-list__actions > .govuk-link')
			.last()
			.click();
	}
	clickInspector() {
		this.clickAccordionByText('Case Team');
		cy.get('.govuk-summary-list > :nth-child(2) > .govuk-summary-list__actions > .govuk-link')
			.last()
			.click();
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
	verifySectionHeader(expectedText) {
		this.basePageElements.sectionHeader().filter('h1').should('have.text', expectedText);
	}
}

//ASSERTIONS
