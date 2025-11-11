// @ts-nocheck
/// <reference types="cypress"/>

import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';

const caseDetailsPage = new CaseDetailsPage();

describe('Create Test Data', () => {
	it.only('Update Decision Letter', () => {
		cy.createCase({
			//HAS (nothing)
			caseType: 'W', //S78 Planning
			caseType: 'Y', //S20
			caseType: 'ZP', //CAS Planning
			caseType: 'ZA' //CAS Advert
			//Full Adverts
		}).then((caseObj) => {
			cy.addLpaqSubmissionToCase(caseObj);
			cy.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'ISSUE_DECISION', 'S20');
		});
	});
});
