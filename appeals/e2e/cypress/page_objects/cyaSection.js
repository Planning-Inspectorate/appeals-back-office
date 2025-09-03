// @ts-nocheck
import { Page } from './basePage';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class CYASection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {};

	// E L E M E N T S

	elements = {};

	cyaSectionFields = {
		address: 'Address of where the inquiry will take place'
	};

	// A C T I O N S

	selectChangeAnswer(answer) {
		cy.getByData('change-' + answer).click();
	}

	verifyAnswerUpdated(fieldValue) {
		this.verifyCheckYourAnswers(fieldValue.field, fieldValue.value);
	}
}
