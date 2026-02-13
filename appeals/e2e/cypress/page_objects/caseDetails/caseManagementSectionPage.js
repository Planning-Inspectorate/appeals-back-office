// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class CaseManagementSectionPage extends CaseDetailsPage {
	selectViewDetails(type) {
		cy.getByData('view-' + type).click();
	}
}
