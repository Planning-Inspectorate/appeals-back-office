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

	assertFieldLabelAndValue(labelText, expectedValue) {
		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.invoke('text')
			.then((text) => {
				expect(text.trim()).to.eq(labelText);
			});

		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.siblings('.govuk-summary-list__value')
			.should('contain', expectedValue);
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
