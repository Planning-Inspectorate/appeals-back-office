// @ts-nocheck

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { ListCasesPage } from '../listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
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
	navigateToHearingSection(caseRef) {
		cy.clearAllSessionStorage();
		cy.clearAllCookies();
		cy.login(users.appeals.caseAdmin);
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
	}
	ensureHearingExists(caseRef, date) {
		return cy.loadAppealDetails(caseRef).then((appealDetails) => {
			if (appealDetails.hearing === undefined) {
				cy.addHearingDetails(caseRef, date).then((hearingDetails) => {
					expect(hearingDetails.hearingStartTime).to.be.eq(date.toISOString());
					expect(hearingDetails.hearingEndTime).to.be.eq(date.toISOString());
					return cy.addHearingDetails(caseRef, date);
				});
			}
		});
	}
	deleteHearingIfExists(caseRef) {
		cy.log(`Checking for hearing with case reference: ${caseRef}`);

		cy.loadAppealDetails(caseRef).then((appealDetails) => {
			cy.log('Appeal details:', appealDetails);

			// More thorough check for hearing existence
			if (appealDetails?.hearing?.hearingId) {
				cy.log(`Hearing exists with ID: ${appealDetails.hearing.hearingId}, deleting...`);

				cy.deleteHearing(caseRef).then((hearingDetails) => {
					expect(Number(hearingDetails.appealId)).to.equal(appealDetails.appealId);
					expect(Number(hearingDetails.hearingId)).to.equal(appealDetails.hearing.hearingId);
					cy.log('Hearing successfully deleted');
				});
			} else {
				cy.log('No hearing exists for this case');
			}
		});
	}
	verifyCaseHistory(hearingInformation) {
		caseDetailsPage.clickViewCaseHistory();
		hearingInformation.forEach((info) => {
			caseDetailsPage.verifyTableCellTextCaseHistory(info);
		});
	}

	verifyIssueDecision(caseRef) {
		cy.simulateHearingElapsed(caseRef);
		cy.reload();
		caseDetailsPage.validateBannerMessage('Important', 'Issue decision');
		caseDetailsPage.clickIssueDecision(caseRef);
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
