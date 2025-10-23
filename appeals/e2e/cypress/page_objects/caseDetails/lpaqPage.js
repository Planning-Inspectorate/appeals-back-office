// @ts-nocheck
import { Page } from '../basePage';
import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class LpaqPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		changeCorrectAppealType: 'change-is-correct-appeal-type',
		changeGreenBelt: 'change-site-within-green-belt',
		addConservationAreaMap: 'add-conservation-area-map-and-guidance',
		addRelatedAppeals: 'add-related-appeals'
	};

	elements = {
		addRelatedAppeal: () => cy.getByData(this._cyDataSelectors.addRelatedAppeals),
		relatedAppealValue: (caseObj) => cy.get(`[data-cy="related-appeal-${caseObj}"]`)
	};
	/********************************************************
	 ******************** Navigation *************************
	 *********************************************************/

	navigateToLpaq(caseObj) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.clickReviewLpaQuestionnaire(); // Assuming this exists
	}

	/********************************************************
	 ******************** Actions ****************************
	 *********************************************************/

	clickAddRelatedAppeals() {
		this.elements.addRelatedAppeal().click();
	}

	/********************************************************
	 ******************** Assertions *************************
	 *********************************************************/

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
}
