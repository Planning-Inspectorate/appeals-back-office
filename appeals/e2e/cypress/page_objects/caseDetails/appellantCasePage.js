// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class AppellantCasePage {
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
		changeDecision: 'change-application-decision'
	};

	elements = {
		appellantSection: () => cy.get('.appeal-appellant'),
		agentSection: () => cy.get('.appeal-agent')
	};

	/********************************************************
	 ******************** Navigation *************************
	 *********************************************************/

	navigateToAppellantCase(caseRef) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
	}

	/********************************************************
	 ******************** Assertions *************************
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
		cy.get('.govuk-summary-list__key').should('contain', labelText);

		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.siblings('.govuk-summary-list__value')
			.should('contain', expectedValue);
	}
}
