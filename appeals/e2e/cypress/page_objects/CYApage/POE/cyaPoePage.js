import { CyaBaseElements } from '../cyaBaseElements';
import { cyaBaseLocators } from '../cyaBaseLocators';
import { cyaBasePage } from '../cyaBasePage';

const cyaPageObj = new cyaBasePage();
const cyaLocatorsObj = new cyaBaseLocators();
const cyaElementsObj = new CyaBaseElements();

export class CyaPoePage extends cyaBasePage {
	checkPageContent(
		appealReference,
		rule6PartyName,
		isReject = false,
		supportingDoc = false,
		other = false,
		otherText = ''
	) {
		cyaPageObj.checkStaticContent(appealReference, rule6PartyName);
		this.checkInputData(rule6PartyName, isReject, supportingDoc, other, otherText);
	}

	checkInputData(
		rule6PartyName,
		isReject = false,
		supportingDoc = false,
		other = false,
		otherText = ''
	) {
		if (isReject) {
			cy.get(cyaLocatorsObj.Selectors.inputDataSelector).should(
				'contain.text',
				cyaElementsObj.Elements.rejectTextContent
			);
			if (supportingDoc) {
				cy.get(cyaLocatorsObj.Selectors.inputDataSelector).should(
					'contain.text',
					cyaElementsObj.Elements.reasonTextSupportingDocTextContent
				);
			}
			if (other) {
				cy.get(cyaLocatorsObj.Selectors.inputDataSelector).should(
					'contain.text',
					cyaElementsObj.Elements.reasonTextOtherTextContent
				);
				cy.get(cyaLocatorsObj.Selectors.inputDataSelector).should('contain.text', otherText);
			}
			cy.get(cyaLocatorsObj.Selectors.button).should(
				'contain.text',
				`${cyaElementsObj.Elements.submitRejectButton}`
			);
		} else {
			cy.get(cyaLocatorsObj.Selectors.inputDataSelector).should(
				'contain.text',
				cyaElementsObj.Elements.acceptTextContent
			);
			cy.get(cyaLocatorsObj.Selectors.button).should(
				'contain.text',
				`${cyaElementsObj.Elements.submitAcceptButton} ${rule6PartyName} proof of evidence and witnesses`
			);
		}
	}
}
