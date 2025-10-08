// @ts-nocheck

import { Page } from '../basePage';
import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class AppellantCasePage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		changeAppellant: 'appellant',
		changeAgent: 'change-agent',
		changeSiteOwnership: 'change-site-ownership',
		changeInspectorAccess: 'change-site-access',
		changeHealthSafety: 'change-site-safety',
		changeAppRef: 'change-application-reference',
		changeLpaName: 'change-lpa-name',
		changeDecision: 'change-application-decision',
		addRelatedAppeals: 'add-related-appeals',
		changeRelatedAppeals: 'manage-related-appeals'
	};

	elements = {
		appellantSection: () => cy.get('.appeal-appellant'),
		agentSection: () => cy.get('.appeal-agent'),
		addRelatedAppeal: () => cy.getByData(this._cyDataSelectors.addRelatedAppeals),
		changeRelatedAppeal: () => cy.getByData(this._cyDataSelectors.changeRelatedAppeals),
		relatedAppealValue: (caseObj) => cy.get(`[data-cy="related-appeal-${caseObj}"]`)
	};

	/*********************************************************
	 ******************** Navigation **************************
	 *********************************************************/

	navigateToAppellantCase(caseObj) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.clickReviewAppellantCase();
	}

	/********************************************************
	 ******************** Actions ****************************
	 ********************************************************/

	clickAddRelatedAppeals() {
		this.elements.addRelatedAppeal().click();
	}

	clickChangeRelatedAppeals() {
		this.elements.changeRelatedAppeal().click();
	}

	/*********************************************************
	 ******************** Assertions **************************
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
		cy.get('.govuk-summary-list__key')
			.contains(labelText)
			.invoke('text')
			.then((text) => {
				expect(text.trim()).to.eq(labelText);
			});

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

	assertNotReceivedDecisionDate(value) {
		this.assertFieldLabelAndValue(
			'What date was your decision due from the local planning authority?',
			value
		);
	}

	// Section 4 – Appeal details
	assertAppealType(value) {
		this.assertFieldLabelAndValue('What type of application is your appeal about?', value);
	}

	// Section 5 – Upload documents (label checks only)
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

	// Planning-specific upload labels
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

	// Section 6 – S78-specific fields
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

	/********************************************************
	 *************** Negative Field Assertions ***************
	 ********************************************************/

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
