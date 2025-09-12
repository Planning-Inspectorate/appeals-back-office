// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

const caseDetailsPage = new CaseDetailsPage();

describe('link appeals', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Link an unlinked appeal to an unlinked appeal (from lead)', { tags: tag.smoke }, () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);

				//link appeal
				caseDetailsPage.clickAccordionByButton('Overview');
				happyPathHelper.addLinkedAppeal(leadCase, childCase);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//Notify
				const expectedNotifies = [
					{
						template: 'link-appeal',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'link-appeal',
						recipient: 'agent@test.com'
					}
				];

				cy.checkNotifySent(leadCase, expectedNotifies);
			});
		});
	});

	it('Link an unlinked appeal to an unlinked appeal (from child)', { tags: tag.smoke }, () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(childCase);

				//link appeal
				caseDetailsPage.clickAccordionByButton('Overview');
				happyPathHelper.addLinkedAppeal(leadCase, leadCase);
				caseDetailsPage.checkStatusOfCase('Child', 1);

				//Notify
				const expectedNotifies = [
					{
						template: 'link-appeal',
						recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
					},
					{
						template: 'link-appeal',
						recipient: 'agent@test.com'
					}
				];

				cy.checkNotifySent(childCase, expectedNotifies);
			});
		});
	});

	it('Visit the first linked appeal', () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase) => {
				happyPathHelper.assignCaseOfficer(leadCase);
				caseDetailsPage.clickAccordionByButton('Overview');

				//link appeal
				happyPathHelper.addLinkedAppeal(leadCase, childCase);
				caseDetailsPage.checkStatusOfCase('Lead', 1);

				//child appeal
				caseDetailsPage.clickLinkedAppeal(childCase);
				caseDetailsPage.verifyAppealRefOnCaseDetails(childCase);
			});
		});
	});

	it('As a lead appeal with a child, link another unlinked case', () => {
		cy.createCase().then((leadCase) => {
			cy.createCase().then((childCase1) => {
				cy.createCase().then((childCase2) => {
					happyPathHelper.assignCaseOfficer(leadCase);
					caseDetailsPage.clickAccordionByButton('Overview');

					happyPathHelper.addLinkedAppeal(leadCase, childCase1);
					caseDetailsPage.checkStatusOfCase('Lead', 1);

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCase2);
					caseDetailsPage.clickButtonByText('Continue');

					//CYA
					caseDetailsPage.verifyRowExists('Which is the lead appeal?', false);
					caseDetailsPage.clickButtonByText('Add linked appeal');

					//case details
					caseDetailsPage.validateBannerMessage('Success', 'Linked appeal added');
					caseDetailsPage.elements.linkedAppeal().should('have.length', 2);
				});
			});
		});
	});

	//Negative cases

	it('As a lead appeal, I am unable to link an already linked child case', () => {
		cy.createCase().then((leadCase1) => {
			cy.createCase().then((leadCase2) => {
				cy.createCase().then((childCase) => {
					happyPathHelper.assignCaseOfficer(leadCase1);
					caseDetailsPage.clickAccordionByButton('Overview');

					happyPathHelper.addLinkedAppeal(leadCase1, childCase);
					caseDetailsPage.checkStatusOfCase('Lead', 1);

					//2nd lead case
					happyPathHelper.assignCaseOfficer(leadCase2);
					caseDetailsPage.clickAccordionByButton('Overview');

					//link appeal
					caseDetailsPage.clickAddLinkedAppeal();
					caseDetailsPage.fillInput(childCase);
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.checkHeading(`You have already linked appeal ${childCase}`);
				});
			});
		});
	});

	it('As a lead appeal, I am unable to link to another lead appeal', () => {
		cy.createCase().then((leadCase1) => {
			cy.createCase().then((leadCase2) => {
				cy.createCase().then((childCase1) => {
					cy.createCase().then((childCase2) => {
						happyPathHelper.assignCaseOfficer(leadCase1);
						caseDetailsPage.clickAccordionByButton('Overview');

						happyPathHelper.addLinkedAppeal(leadCase1, childCase1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCase2);
						caseDetailsPage.clickAccordionByButton('Overview');

						happyPathHelper.addLinkedAppeal(leadCase2, childCase2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//link lead appeals together
						caseDetailsPage.clickAddLinkedAppeal();
						caseDetailsPage.fillInput(leadCase1);
						caseDetailsPage.clickButtonByText('Continue');

						//exit page
						caseDetailsPage.checkHeading(`You have already linked appeal ${leadCase1}`);
					});
				});
			});
		});
	});

	it('As a child appeal, I am unable to link to another child appeal', () => {
		cy.createCase().then((leadCase1) => {
			cy.createCase().then((leadCase2) => {
				cy.createCase().then((childCase1) => {
					cy.createCase().then((childCase2) => {
						happyPathHelper.assignCaseOfficer(leadCase1);
						caseDetailsPage.clickAccordionByButton('Overview');

						happyPathHelper.addLinkedAppeal(leadCase1, childCase1);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//2nd lead case
						happyPathHelper.assignCaseOfficer(leadCase2);
						caseDetailsPage.clickAccordionByButton('Overview');
						happyPathHelper.addLinkedAppeal(leadCase2, childCase2);
						caseDetailsPage.checkStatusOfCase('Lead', 1);

						//attempt to add a child appeal from a child appeal
						happyPathHelper.viewCaseDetails(childCase1);
						caseDetailsPage.clickAccordionByButton('Overview');
						caseDetailsPage.checkAddLinkedAppealDoesNotExist();
					});
				});
			});
		});
	});
});
