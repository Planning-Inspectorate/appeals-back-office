// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { InquirySectionPage } from '../../page_objects/caseDetails/inquirySectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';

const caseDetailsPage = new CaseDetailsPage();
const inquirySectionPage = new InquirySectionPage();

let caseObj;
let appeal;

let testAppealsIdsToDelete = [8543];

before(() => {});

after(() => {});

const mapAppeals = () => testAppealsIdsToDelete.map((appeal) => ({ id: appeal }));

describe('Delete appeals', () => {
	it('Delete appeals from specified list', () => {
		cy.login(users.appeals.caseAdmin);

		if (!testAppealsIdsToDelete.length) {
			cy.log('*** Did not find any appeals to delete ');
			return;
		}

		// delete specified appeals
		const appealsToDelete = mapAppeals();
		cy.log('*** Appeals to delete ', JSON.stringify(appealsToDelete));
		cy.deleteAppeals(appealsToDelete);

		cy.log(`Deleted ${appealsToDelete.length} appeals`);
	});
});
