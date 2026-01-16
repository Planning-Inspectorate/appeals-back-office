// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class SiteDetailsSectionPage extends CaseDetailsPage {
	siteDetailsSectionFields = {
		interestedPartyNeighbourAddresses: 'Interested party and neighbour addresses'
	};

	verifyAddresses(field, addresses) {
		this.checkCorrectAnswerDisplays(field, addresses);
	}
}
