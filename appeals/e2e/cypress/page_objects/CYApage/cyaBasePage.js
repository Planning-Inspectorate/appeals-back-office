import { CaseDetailsPage } from '../caseDetailsPage';
import { CyaBaseElements } from './cyaBaseElements';
import { cyaBaseLocators } from './cyaBaseLocators';

const caseDetailsPage = new CaseDetailsPage();
const cyaElementsObj = new CyaBaseElements();
const cyaLocatorsObj = new cyaBaseLocators();

export class cyaBasePage extends CaseDetailsPage {
	checkStaticContent(appealReference, rule6PartyName) {
		caseDetailsPage.verifyPageCaption(`Appeal ${appealReference}`);
		this.checkBackLink();
		this.checkHeading(rule6PartyName);
	}

	checkHeading(rule6PartyName) {
		cy.get('h1').should(
			'contain.text',
			`Check details and accept ${rule6PartyName} proof of evidence and witnesses`
		);
		this.checkSubheadingsAndChangeLinks(false, rule6PartyName);
	}

	_verifySubheadingAndChangeLink(subheading) {
		cy.get(cyaLocatorsObj.Selectors.subheadingSelector).should('contain.text', subheading);
		cy.contains(cyaLocatorsObj.Selectors.subheadingSelector, subheading)
			.parents(cyaLocatorsObj.Selectors.summaryRowSelector)
			.find(cyaLocatorsObj.Selectors.summaryActionLinkSelector)
			.should('be.visible')
			.and('contain.text', 'Change');
	}

	checkSubheadingsAndChangeLinks(isReject = false, rule6PartyName) {
		this._verifySubheadingAndChangeLink(cyaElementsObj.Elements.POEsubheading);
		this._verifySubheadingAndChangeLink(cyaElementsObj.Elements.ReviewDecisions);

		if (isReject) {
			const rejectSubheading = `${cyaElementsObj.Elements.rejectReasonSubheading}${rule6PartyName} proof of evidence and witnesses`;
			this._verifySubheadingAndChangeLink(rejectSubheading);
			cy.get(cyaLocatorsObj.Selectors.captionSelector).should(
				'contain.text',
				cyaElementsObj.Elements.rejectCaption
			);
		}
	}
}
