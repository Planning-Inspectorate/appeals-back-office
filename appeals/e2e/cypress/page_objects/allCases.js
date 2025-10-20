// @ts-nocheck
import { Page } from './basePage';

const basePage = new Page();

export class AllCases extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 ********************************************************/

	selectors = {};

	elements = {
		planningApplicationRef: (caseObj) => cy.getByData(caseObj.reference).parent().siblings().eq(0),

		siteAddress: (caseObj) => cy.getByData(caseObj.reference).parent().siblings().eq(1),

		localPlanningAuthority: (caseObj) => cy.getByData(caseObj.reference).parent().siblings().eq(2),

		appealType: (caseObj) => cy.getByData(caseObj.reference).parent().siblings().eq(3),

		status: (caseObj) => cy.getByData(caseObj.reference).parent().siblings().find('.govuk-tag')
	};

	/********************************************************
	 ************************ Verify *************************
	 ********************************************************/

	verifyPlanningApplicationRef(caseObj, expectedText) {
		this.elements
			.planningApplicationRef(caseObj)
			.invoke('text')
			.then((text) => {
				const cleanedText = text.replace(/[\n\t]/g, '').trim();
				expect(cleanedText).to.eq(expectedText);
			});
	}

	verifySiteAdress(caseObj, expectedText) {
		this.elements.siteAddress(caseObj).should('have.text', expectedText);
	}

	verifyLocalPlanningAuthority(caseObj, expectedText) {
		this.elements.localPlanningAuthority(caseObj).should('have.text', expectedText);
	}

	verifyappealType(caseObj, expectedText) {
		this.elements.appealType(caseObj).should('have.text', expectedText);
	}

	verifyStatus(caseObj, expectedText, index = 0) {
		this.elements.status(caseObj).eq(index).should('have.text', expectedText);
	}
}
