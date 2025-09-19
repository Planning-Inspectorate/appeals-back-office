// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class DocumentationSectionPage extends CaseDetailsPage {
	selectAddDocument(type) {
		cy.getByData('add-' + type).click();
	}
}
