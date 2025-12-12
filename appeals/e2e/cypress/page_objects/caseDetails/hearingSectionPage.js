// @ts-nocheck

import { users } from '../../fixtures/users';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { ListCasesPage } from '../listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
const dateTimeSection = new DateTimeSection();

export class HearingSectionPage extends CaseDetailsPage {
	hearingSectionElements = {
		...this.elements, // Inherit parent elements
		changeHearing: () => cy.get('.govuk-summary-list__actions > .govuk-link').last(),
		keepHearing: () => cy.get('#keepHearing'),
		cancelHearing: () => cy.get('#cancelHearing')
	};

	clickChangeHearing() {
		this.hearingSectionElements.changeHearing().click();
	}

	clickCancelHearing() {
		this.hearingSectionElements.cancelHearing().click();
	}

	clickKeepHearing() {
		this.hearingSectionElements.keepHearing().click();
	}

	setUpHearing(date, hour, minute) {
		dateTimeSection.enterHearingDate(date);
		dateTimeSection.enterHearingTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	verifyHearingEstimate(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.hearingSectionElements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}

	verifyHearingValues(hearingField, expectedText, isAddressKnown = false, address = []) {
		const fieldElement = this.hearingSectionElements
			.rowChangeLink(hearingField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible');

		if (isAddressKnown) {
			fieldElement.then(($el) => {
				address.forEach((addressLine) => {
					cy.wrap($el).should('contain.text', addressLine);
				});
			});
		} else {
			fieldElement.should('contain.text', expectedText);
		}
	}

	verifyHearingHeader(sectionHeader) {
		this.elements.pageHeading().should('contain.text', sectionHeader);
	}

	verifyYouCannotCheckTheseAnswersPage() {
		this.basePageElements.xlHeader().contains('You cannot check these answers');
		this.basePageElements.link().contains('appeal details');
	}
	navigateToHearingSection(caseObj) {
		cy.clearAllSessionStorage();
		cy.clearAllCookies();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
	}
	ensureHearingExists(caseObj, date) {
		return cy.loadAppealDetails(caseObj).then((appealDetails) => {
			if (appealDetails.hearing === undefined) {
				cy.addHearingDetails(caseObj, date).then((hearingDetails) => {
					return hearingDetails;
				});
			}
		});
	}
	deleteHearingIfExists(caseObj) {
		cy.log(`Checking for hearing with case reference: ${caseObj.reference}`);

		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			cy.log('Appeal details:', appealDetails);

			// More thorough check for hearing existence
			if (appealDetails?.hearing?.hearingId) {
				cy.log(`Hearing exists with ID: ${appealDetails.hearing.hearingId}, deleting...`);

				cy.deleteHearing(caseObj).then((hearingDetails) => {
					cy.log(`Successfully deleted hearing with id ${hearingDetails.hearingId}`);
				});
			} else {
				cy.log('No hearing exists for this case');
			}
		});
	}
	verifyCaseHistory(hearingInformation) {
		caseDetailsPage.clickViewCaseHistory();
		hearingInformation.forEach((info) => {
			caseHistoryPage.verifyCaseHistoryValue(info);
		});
	}

	verifyIssueDecision(caseObj) {
		cy.simulateHearingElapsed(caseObj);
		cy.reload();
		caseDetailsPage.validateBannerMessage('Important', 'Issue decision');
		caseDetailsPage.clickIssueDecision(caseObj.reference);
		caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Allowed'));
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.uploadSampleFile(caseDetailsPage.sampleFiles.pdf);
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Issue Decision');
		caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
		caseDetailsPage.checkStatusOfCase('Complete', 0);
		caseDetailsPage.checkDecisionOutcome('Allowed');
		caseDetailsPage.viewDecisionLetter('View decision');
		caseDetailsPage.validateBannerMessage('Success', 'Decision issued');
	}

	getTimeUpToMinutes(date) {
		return new Date(date).toUTCString().slice(0, 16);
	}
}
