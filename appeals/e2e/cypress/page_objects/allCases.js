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
		this.elements.planningApplicationRef(caseObj).contains(expectedText);
	}

	verifySiteAdress(caseObj, expectedText) {
		this.elements.siteAddress(caseObj).contains(expectedText);
	}

	verifyLocalPlanningAuthority(caseObj, expectedText) {
		this.elements.localPlanningAuthority(caseObj).contains(expectedText);
	}

	verifyappealType(caseObj, expectedText) {
		this.elements.appealType(caseObj).contains(expectedText);
	}

	verifyStatus(caseObj, expectedText, index = 0) {
		this.elements.status(caseObj).eq(index).should('have.text', expectedText);
	}
}
