// @ts-nocheck

import { Page } from './basePage';

export class ListCasesPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		reviewAppellantCase: 'review-appellant-case',
		changeSetVisitType: 'change-set-visit-type'
	};

	elements = {
		link: () => cy.get(this._selectors.link)
	};

	useBaseElementOrSelector() {
		// Methods that returns an element
		this.basePageElements.buttonByLabelText('Click me').click();

		// Methods that perform an action
		this.clickButtonByText('Click me');

		// Selectors from base page eg this.selectors
		cy.get(this.selectors.errorMessage).should('have.text', 'this is an error message');
	}

	/********************************************************
	 ************************ Actions ************************
	 *********************************************************/

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

	/***************************************************************
	 ************************ Verfifications ************************
	 ****************************************************************/

	verifySectionHeader(expectedText) {
		this.basePageElements.sectionHeader().filter('h1').should('have.text', expectedText);
	}

	verifyBannerTitle() {
		cy.contains(this.selectors.bannerTitle);
	}

	verifyBannerContent() {
		cy.contains(this.selectors.bannerContent);
	}

	// TODO Is this in use?
	verifyValueIsBlank(position) {
		this.clickAccordionByText('Case Team');
		this.basePageElements
			.summaryListValue()
			.eq(position - 1)
			.should('not.have.text');
	}
}
