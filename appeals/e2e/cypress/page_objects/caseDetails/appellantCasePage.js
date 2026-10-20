// @ts-nocheck

import { Page } from '../basePage';
import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class AppellantCasePage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		changeAppellant: 'appellant',
		changeAgent: 'change-agent',
		changeSiteOwnership: 'change-site-ownership',
		changeInspectorAccess: 'change-site-access',
		changeHealthSafety: 'change-site-safety',
		changeAppRef: 'change-application-reference',
		changeLpaName: 'change-lpa-name',
		changeDecision: 'change-application-decision',
		addRelatedAppeals: 'add-related-appeals',
		changeRelatedAppeals: 'manage-related-appeals'
	};

	elements = {
		appellantSection: () => cy.get('.appeal-appellant'),
		agentSection: () => cy.get('.appeal-agent'),
		addRelatedAppeal: () => cy.getByData(this._cyDataSelectors.addRelatedAppeals),
		changeRelatedAppeal: () => cy.getByData(this._cyDataSelectors.changeRelatedAppeals),
		relatedAppealValue: (caseObj) => cy.get(`[data-cy="related-appeal-${caseObj}"]`)
	};

	/*********************************************************
	 ******************** Navigation **************************
	 *********************************************************/

	navigateToAppellantCase(caseObj) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.clickReviewAppellantCase();
	}

	/********************************************************
	 ******************** Actions ****************************
	 ********************************************************/

	clickAddRelatedAppeals() {
		this.elements.addRelatedAppeal().click();
	}

	clickChangeRelatedAppeals() {
		this.elements.changeRelatedAppeal().click();
	}

	selectChangeLink(selector) {
		cy.getByData(selector).click();
	}

	/*********************************************************
	 ******************** Assertions **************************
	 *********************************************************/

	assertAppellantDetails({ firstName, lastName, organisation, email, phone }) {
		this.elements
			.appellantSection()
			.should('contain', `${firstName} ${lastName}`)
			.and('contain', organisation)
			.and('contain', email)
			.and('contain', phone);
	}

	assertAgentDetails({ firstName, lastName, organisation, email, phone }) {
		this.elements
			.agentSection()
			.should('contain', `${firstName} ${lastName}`)
			.and('contain', organisation)
			.and('contain', email)
			.and('contain', phone);
	}

	/**
	 * Asserts that row exists with the given label and value
	 * @param {string} labelText row label text
	 * @param {string} expectedValue row value
	 * @param {boolean} isLink whether the value should be displayed as a link
	 */
	assertFieldLabelAndValue(labelText, expectedValue, isLink = false) {
		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.invoke('text')
			.then((text) => {
				expect(text.trim().toLowerCase()).to.eq(labelText.toLowerCase());
			});

		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.siblings('.govuk-summary-list__value')
			.then(($value) => {
				cy.writeLog(
					`Asserting field value for label "${labelText}" is "${expectedValue}", expecting link: ${isLink}`
				);

				// If the value is a link, we need to check the text of the link instead of the value itself
				if (isLink) {
					cy.wrap($value)
						.find('a')
						.should('be.visible')
						.invoke('text')
						.then((text) => {
							expect(text.trim().startsWith(expectedValue)).to.be.true;
						});
				} else {
					cy.wrap($value)
						.invoke('text')
						.then((text) => {
							expect(text.trim().toLowerCase()).to.contain(expectedValue.toLowerCase());
						});
				}
			});
	}

	assertFieldNotPresent(labelText) {
		cy.contains('.govuk-summary-list__key', labelText).should('not.exist');
	}

	// Section 2 – Site details
	assertSiteAddress(value) {
		this.assertFieldLabelAndValue('What is the address of the appeal site?', value);
	}

	assertSiteArea(value) {
		this.assertFieldLabelAndValue('What is the area of the appeal site?', value);
	}
}
