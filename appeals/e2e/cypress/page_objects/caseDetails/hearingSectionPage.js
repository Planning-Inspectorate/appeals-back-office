// @ts-nocheck

import { users } from '../../fixtures/users';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { AddressSection } from '../addressSection.js';
import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { EstimatedDaysSection } from '../estimatedDaysSection.js';
import { ListCasesPage } from '../listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();
const dateTimeSection = new DateTimeSection();
const estimatedDaysSection = new EstimatedDaysSection();
const addressSection = new AddressSection();

export class HearingSectionPage extends CaseDetailsPage {
	hearingSectionElements = {
		...this.elements, // Inherit parent elements
		changeHearingDate: () => cy.getByData('change-date'),
		changeHearingEstimate: () => cy.get('#addHearingEstimates'),
		changeHearingAddress: () => cy.getByData('change-whether-the-address-is-known-or-not'),
		updateAddress: () => cy.getByData('change-address'),
		changeHearing: () => cy.get('.govuk-summary-list__actions > .govuk-link').last(),
		keepHearing: () => cy.get('#keepHearing'),
		cancelHearing: () => cy.get('#cancelHearing')
	};

	clickChangeHearingDate() {
		this.hearingSectionElements.changeHearingDate().click();
	}

	clickChangeHearingEstimates() {
		this.hearingSectionElements.changeHearingEstimate().click();
	}

	clickChangeHearing() {
		this.hearingSectionElements.changeHearing().click();
	}

	clickCancelHearing() {
		this.hearingSectionElements.cancelHearing().click();
	}

	clickKeepHearing() {
		this.hearingSectionElements.keepHearing().click();
	}

	clearHearingDateAndTime() {
		dateTimeSection.clearHearingDateAndTime();
	}

	setUpHearing(date, hour, minute) {
		if (date) {
			dateTimeSection.enterHearingDate(date);
		}
		dateTimeSection.enterHearingTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	setUpHearingWithAddress({ date, estimatedDays = null, address = '' } = {}) {
		this.setUpHearing(date, date.getHours(), date.getMinutes());

		const estimatedDaysOption = estimatedDays ? 'Yes' : 'No';
		estimatedDaysSection.selectEstimatedDaysOption(estimatedDaysOption);
		caseDetailsPage.clickButtonByText('Continue');

		if (estimatedDays) {
			estimatedDaysSection.enterEstimatedDays(estimatedDays);
			caseDetailsPage.clickButtonByText('Continue');
		}

		const addressKnownOption = address ? 'Yes' : 'No';
		addressSection.selectAddressOption(addressKnownOption);

		caseDetailsPage.clickButtonByText('Continue');
	}

	changeHearingAddress({ address = {}, addressKnown = true } = {}) {
		this.hearingSectionElements.changeHearingAddress().click();

		addressSection.selectAddressOption(addressKnown ? 'Yes' : 'No');
		addressSection.clickButtonByText('Continue');

		if (addressKnown) {
			addressSection.enterAddress(address);
			addressSection.clickButtonByText('Continue');
		}
	}

	updateHearingAddress(address) {
		this.hearingSectionElements.updateAddress().click();
		addressSection.enterAddress(address);
		addressSection.clickButtonByText('Continue');
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

	verifyHearingSectionIsDisplayed() {
		this.hearingSectionElements.cancelHearing().should('be.visible');
	}

	verifyHearingIsDisplayed(displayed = true) {
		// setup hearing button
		this.hearingSectionElements
			.caseDetailsHearingSectionButton()
			.should(displayed ? 'not.exist' : 'be.visible');

		// cancel hearing button
		this.hearingSectionElements.cancelHearing().should(displayed ? 'be.visible' : 'not.exist');
	}

	verifyHearingEstimateSectionIsDisplayed() {
		this.hearingSectionElements.changeHearingEstimate().should('be.visible');
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
					cy.reload();
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
