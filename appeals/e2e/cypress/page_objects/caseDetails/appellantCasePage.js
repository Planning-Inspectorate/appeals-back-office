// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class AppellantCasePage {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	elements = {
		appellantSection: () => cy.get('.appeal-appellant'),
		agentSection: () => cy.get('.appeal-agent')
	};

	/********************************************************
	 ******************** Navigation *************************
	 *********************************************************/

	navigateToAppellantCase(caseRef) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
	}

	/********************************************************
	 ******************** Assertions *************************
	 *********************************************************/

	assertAppellantDetails({ firstName, lastName, organisation, email, phone }) {
		this.elements
			.appellantSection()
			.should('contain', `${firstName} ${lastName}`)
			.and('contain', organisation)
			.and('contain', email)
			.and('contain', phone);
	}

	assertAgentDetails({ firstName, lastName, organisation, email, phone }) {
		this.elements
			.agentSection()
			.should('contain', `${firstName} ${lastName}`)
			.and('contain', organisation)
			.and('contain', email)
			.and('contain', phone);
	}

	assertFieldLabelAndValue(labelText, expectedValue) {
		// Step 1: Get the specific label element
		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.invoke('text')
			.then((text) => {
				expect(text.trim()).to.eq(labelText);
			});
		// Step 2: Assert the corresponding value
		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.siblings('.govuk-summary-list__value')
			.should('contain', expectedValue);
	}

	assertFieldNotPresent(labelText) {
		cy.contains('.govuk-summary-list__key', labelText).should('not.exist');
	}

	// Section 2 – Site details
	assertSiteAddress(value) {
		this.assertFieldLabelAndValue('What is the address of the appeal site?', value);
	}

	assertSiteArea(value) {
		this.assertFieldLabelAndValue('What is the area of the appeal site?', value);
	}

	assertGreenBelt(value) {
		this.assertFieldLabelAndValue('Is the appeal site in a green belt?', value);
	}

	assertOwnsAllLand(value) {
		this.assertFieldLabelAndValue(
			'Does the appellant own all of the land involved in the appeal?',
			value
		);
	}

	assertKnowsOwnership(value) {
		this.assertFieldLabelAndValue(
			'Does the appellant know who owns the land involved in the appeal?',
			value
		);
	}

	assertInspectorAccess(value) {
		this.assertFieldLabelAndValue('Will an inspector need to access your land or property?', value);
	}

	assertHealthAndSafety(value) {
		this.assertFieldLabelAndValue(
			'Are there any health and safety issues on the appeal site?',
			value
		);
	}

	// Section 3 – Application details
	assertLpaName(value) {
		this.assertFieldLabelAndValue(
			'Which local planning authority (LPA) do you want to appeal against?',
			value
		);
	}

	assertApplicationReference(value) {
		this.assertFieldLabelAndValue('What is the application reference number?', value);
	}

	assertApplicationDate(value) {
		this.assertFieldLabelAndValue('What date did you submit your application?', value);
	}

	assertDevelopmentDescription(value) {
		this.assertFieldLabelAndValue(
			'Enter the description of development that you submitted in your application',
			value
		);
	}

	assertOtherAppeals(value) {
		this.assertFieldLabelAndValue('Are there other appeals linked to your development?', value);
	}

	assertApplicationDecision(value) {
		this.assertFieldLabelAndValue('Was your application granted or refused?', value);
	}

	assertDecisionDate(value) {
		this.assertFieldLabelAndValue(
			'What’s the date on the decision letter from the local planning authority?​',
			value
		);
	}

	// Section 4 – Appeal details
	assertAppealType(value) {
		this.assertFieldLabelAndValue('What type of application is your appeal about?', value);
	}

	// Section 5 – Upload documents
	assertDocumentStatus(labelText, expectedValue) {
		this.assertFieldLabelAndValue(labelText, expectedValue);
	}

	assertApplicationFormLabel() {
		this.assertFieldLabelAndValue('Application form', '');
	}

	assertAgreementToChangeDescriptionLabel() {
		this.assertFieldLabelAndValue('Agreement to change the description of development', '');
	}

	assertAppealStatementLabel() {
		this.assertFieldLabelAndValue('Appeal statement', '');
	}

	assertCostsApplicationLabel() {
		this.assertFieldLabelAndValue('Application for an award of appeal costs', '');
	}

	assertAdditionalDocumentsLabel() {
		this.assertFieldLabelAndValue('Additional documents', '');
	}

	//s78

	assertAgriculturalHolding(value) {
		this.assertFieldLabelAndValue('Is the appeal site part of an agricultural holding?', value);
	}

	assertAgriculturalTenancy(value) {
		this.assertFieldLabelAndValue('Are you a tenant of the agricultural holding?', value);
	}

	assertOtherTenants(value) {
		this.assertFieldLabelAndValue('Are there any other tenants?', value);
	}

	assertDevelopmentType(value) {
		this.assertFieldLabelAndValue('Development type', value);
	}

	assertProcedurePreference(value) {
		this.assertFieldLabelAndValue('How would you prefer us to decide your appeal?', value);
	}

	assertProcedureReason(value) {
		this.assertFieldLabelAndValue('Why would you prefer this appeal procedure?', value);
	}

	assertInquiryDuration(value) {
		this.assertFieldLabelAndValue('How many days would you expect the inquiry to last?', value);
	}

	assertWitnessCount(value) {
		this.assertFieldLabelAndValue(
			'How many witnesses would you expect to give evidence at the inquiry?',
			value
		);
	}
	assertDecisionLetterLabel() {
		this.assertFieldLabelAndValue('Decision letter from the local planning authority', '');
	}

	assertPlanningObligationStatusLabel() {
		this.assertFieldLabelAndValue('What is the status of your planning obligation?', '');
	}

	assertPlanningObligationDocLabel() {
		this.assertFieldLabelAndValue('Planning obligation', '');
	}

	assertDraftStatementLabel() {
		this.assertFieldLabelAndValue('Draft statement of common ground', '');
	}

	assertOwnershipDeclarationLabel() {
		this.assertFieldLabelAndValue(
			'Separate ownership certificate and agricultural land declaration',
			''
		);
	}

	assertDesignAccessLabel() {
		this.assertFieldLabelAndValue('Design and access statement', '');
	}

	assertPlansListLabel() {
		this.assertFieldLabelAndValue('Plans, drawings and list of plans', '');
	}

	assertNewPlansLabel() {
		this.assertFieldLabelAndValue('New plans or drawings', '');
	}

	assertOtherSupportingDocsLabel() {
		this.assertFieldLabelAndValue('Other new supporting documents', '');
	}

	///negative tests
	assertAgriculturalHoldingNotPresent() {
		this.assertFieldNotPresent('Is the appeal site part of an agricultural holding?');
	}

	assertAgriculturalTenancyNotPresent() {
		this.assertFieldNotPresent('Are you a tenant of the agricultural holding?');
	}

	assertOtherTenantsNotPresent() {
		this.assertFieldNotPresent('Are there any other tenants?');
	}
}
