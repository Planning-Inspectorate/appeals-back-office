// @ts-nocheck
import { Page } from '../basePage';
import { CaseDetailsPage } from '../caseDetailsPage';
import { ListCasesPage } from '../listCasesPage';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();

export class LpaqPage extends Page {
	/********************************************************
	 ************************ Locators ***********************
	 *********************************************************/

	_cyDataSelectors = {
		changeCorrectAppealType: 'change-is-correct-appeal-type',
		changeGreenBelt: 'change-site-within-green-belt',
		addConservationAreaMap: 'add-conservation-area-map-and-guidance',
		addRelatedAppeals: 'add-related-appeals'
	};

	elements = {
		addRelatedAppeal: () => cy.getByData(this._cyDataSelectors.addRelatedAppeals),
		relatedAppealValue: (caseRef) => cy.get(`[data-cy="related-appeal-${caseRef}"]`)
	};
	/********************************************************
	 ******************** Navigation *************************
	 *********************************************************/

	navigateToLpaq(caseRef) {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewLpaQuestionnaire(); // Assuming this exists
	}

	/********************************************************
	 ******************** Actions ****************************
	 *********************************************************/

	clickAddRelatedAppeals() {
		this.elements.addRelatedAppeal().click();
	}

	/********************************************************
	 ******************** Assertions *************************
	 *********************************************************/

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

	assertCorrectAppealType(value) {
		this.assertFieldLabelAndValue('Is householder the correct type of appeal?', value);
	}

	assertAffectsListedBuilding(value) {
		this.assertFieldLabelAndValue(
			'Does the development affect the setting of listed buildings?',
			value
		);
	}

	assertConservationAreaMapLabel(value) {
		this.assertFieldLabelAndValue('Conservation area map and guidance', value);
	}

	assertGreenBelt(value) {
		this.assertFieldLabelAndValue('Green belt', value);
	}

	assertNotifiedWho(value) {
		this.assertFieldLabelAndValue('Who did you notify about this application?', value);
	}

	assertNotifiedHow(value) {
		this.assertFieldLabelAndValue(
			'How did you notify relevant parties about this application?',
			value
		);
	}

	assertSiteNoticeLabel(value) {
		this.assertFieldLabelAndValue('Site notice', value);
	}

	assertEmailNotificationLabel(value) {
		this.assertFieldLabelAndValue('Letter or email notification', value);
	}

	assertPressAdvertLabel(value) {
		this.assertFieldLabelAndValue('Press advertisement', value);
	}

	assertNotificationLetterLabel(value) {
		this.assertFieldLabelAndValue('Appeal notification letter', value);
	}

	assertRepresentationsLabel(value) {
		this.assertFieldLabelAndValue(
			'Representations from members of the public or other parties',
			value
		);
	}

	assertPlanningOfficerReportLabel(value) {
		this.assertFieldLabelAndValue('Planning officer’s report', value);
	}

	assertPlansDrawingsLabel(value) {
		this.assertFieldLabelAndValue('Plans, drawings and list of plans', value);
	}

	assertStatutoryPoliciesLabel(value) {
		this.assertFieldLabelAndValue('Relevant policies from statutory development plan', value);
	}

	assertSupplementaryDocsLabel(value) {
		this.assertFieldLabelAndValue('Supplementary planning documents', value);
	}

	assertEmergingPlanLabel(value) {
		this.assertFieldLabelAndValue('Emerging plan relevant to appeal', value);
	}

	assertInspectorAccess(value) {
		this.assertFieldLabelAndValue(
			'Might the inspector need access to the appellant’s land or property?',
			value
		);
	}

	assertNeighbourAddress(value) {
		this.assertFieldLabelAndValue('Address of the neighbour’s land or property', value);
	}

	assertSafetyRisks(value) {
		this.assertFieldLabelAndValue('Are there any potential safety risks?', value);
	}

	assertOngoingAppeals(value) {
		this.assertFieldLabelAndValue(
			'Are there any other ongoing appeals next to, or close to the site?',
			value
		);
	}

	assertNewConditions(value) {
		this.assertFieldLabelAndValue('Are there any new conditions?', value);
	}

	assertAdditionalDocumentsLabel(value) {
		this.assertFieldLabelAndValue('Additional documents', value);
	}

	assertNeighbourSiteAddress({ line1, line2, town, county, postcode }) {
		const expectedLines = [line1, line2, town, county, postcode];

		cy.contains('Address of the neighbour’s land or property')
			.siblings('.govuk-summary-list__value')
			.invoke('text')
			.then((text) => {
				const normalized = text.replace(/\s+/g, ' ').trim();

				expectedLines.forEach((line) => {
					expect(normalized).to.include(line);
				});
			});
	}

	//S78 specific assertions
	// Constraints, designations and other issues
	assertPlanningAppealType(value) {
		this.assertFieldLabelAndValue('Is planning appeal the correct type of appeal?', value);
	}

	assertListedBuildingChange(value) {
		this.assertFieldLabelAndValue('Does the development change a listed building?', value);
	}

	assertAffectsListedBuildings(value) {
		this.assertFieldLabelAndValue(
			'Does the development affect the setting of listed buildings?',
			value
		);
	}

	assertScheduledMonument(value) {
		this.assertFieldLabelAndValue('Would the development affect a scheduled monument?', value);
	}

	assertConservationAreaMapLabel(value) {
		this.assertFieldLabelAndValue('Conservation area map and guidance', value);
	}

	assertProtectedSpecies(value) {
		this.assertFieldLabelAndValue('Would the development affect a protected species?', value);
	}

	assertGreenBelt(value) {
		this.assertFieldLabelAndValue('Green belt', value);
	}

	assertAONB(value) {
		this.assertFieldLabelAndValue('Is the site in an area of outstanding natural beauty?', value);
	}

	assertDesignatedSites(value) {
		this.assertFieldLabelAndValue(
			'Is the development in, near or likely to affect any designated sites?',
			value
		);
	}

	assertTreePreservationOrder(value) {
		this.assertFieldLabelAndValue('Tree Preservation Order', value);
	}

	assertGypsyTraveller(value) {
		this.assertFieldLabelAndValue(
			'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
			value
		);
	}

	assertDefinitiveMapLabel(value) {
		this.assertFieldLabelAndValue('Definitive map and statement extract', value);
	}

	// Environmental impact assessment
	assertDevelopmentCategory(value) {
		this.assertFieldLabelAndValue('What is the development category?', value);
	}

	assertThresholdMet(value) {
		this.assertFieldLabelAndValue(
			'Does the development meet or exceed the threshold or criteria in column 2?',
			value
		);
	}

	assertEIAStatementRequired(value) {
		this.assertFieldLabelAndValue(
			'Did your screening opinion say the development needed an environmental statement?',
			value
		);
	}

	assertEnvironmentalStatementLabel(value) {
		this.assertFieldLabelAndValue('Environmental statement and supporting information', value);
	}

	assertScreeningOpinionDocsLabel(value) {
		this.assertFieldLabelAndValue('Screening opinion documents', value);
	}

	assertScreeningDirectionDocsLabel(value) {
		this.assertFieldLabelAndValue('Screening direction documents', value);
	}

	assertScopingOpinionDocsLabel(value) {
		this.assertFieldLabelAndValue('Scoping opinion documents', value);
	}

	assertEIADevelopmentDescription(value) {
		this.assertFieldLabelAndValue('Description of development', value);
	}

	assertSensitiveArea(value) {
		this.assertFieldLabelAndValue(
			'Is the development in, partly in, or likely to affect a sensitive area?',
			value
		);
	}

	// Community Infrastructure Levy (CIL)
	assertCommunityInfrastructureLevy(value) {
		this.assertFieldLabelAndValue('Community infrastructure levy', value);
	}

	assertCILDocumentsLabel(value) {
		this.assertFieldLabelAndValue('Community infrastructure levy', value); // Intentional duplication if label reused
	}

	assertCILAdopted(value) {
		this.assertFieldLabelAndValue('Is the community infrastructure levy formally adopted?', value);
	}

	assertCILAdoptedDate(value) {
		this.assertFieldLabelAndValue(
			'When was the community infrastructure levy formally adopted?',
			value
		);
	}

	assertCILExpectedDate(value) {
		this.assertFieldLabelAndValue(
			'When do you expect to formally adopt the community infrastructure levy?',
			value
		);
	}

	//s20 specific assertions
	assertListedBuildingAppealType(value) {
		this.assertFieldLabelAndValue(
			'Is planning listed building and conservation area appeal the correct type of appeal?',
			value
		);
	}

	assertGrantOrLoanLabel(value) {
		this.assertFieldLabelAndValue(
			'Was a grant or loan made to preserve the listed building at the appeal site?',
			value
		);
	}

	assertHistoricEnglandLabel(value) {
		this.assertFieldLabelAndValue('Historic England consultation', value);
	}
}
