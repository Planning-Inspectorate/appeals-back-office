// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';

const caseDetailsPage = new CaseDetailsPage();

describe('Start case', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Start case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});
		});
	});

	it('Start S78 case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});
		});
	});

	it('Start S20 Listed Building case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'Y'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.clickAccordionByButton('Overview');
			caseDetailsPage.verifyAppealType('Planning listed building and conservation area appeal');
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});
		});
	});
});
