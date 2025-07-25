// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();

const { users: apiUsers, casedata } = appealsApiRequests.caseSubmission;

describe('Managing Appellant Case Details', () => {
	const fieldId = 'planning-application-reference';
	const testReference = 'TEST-REF-123!.#@,/|:;?()_';
	const maxLengthReference = testReference.repeat(10).substring(0, 100);
	const exceededLengthReference = testReference.repeat(10).substring(0, 101);

	const appealTypes = {
		D: 'householder',
		W: 'planning appeal',
		Y: 'S20 appeal'
	};

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('should reject empty value for the LPA application number', () => {
		cy.createCase({ caseType: 'D' }).then((caseRef) => {
			navigateToReferenceUpdate(caseRef);
			caseDetailsPage.updatePlanningApplicationReference(' ');
			verifyError('Enter the application reference number');
		});
	});

	it('should reject reference exceeding 100 characters for the LPA application number', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			navigateToReferenceUpdate(caseRef);
			caseDetailsPage.updatePlanningApplicationReference(exceededLengthReference);
			verifyError('Application reference number must be 100 characters or less');
		});
	});

	Object.entries(appealTypes).forEach(([caseType, description]) => {
		it(`should update ${description} LPA application reference`, () => {
			cy.createCase({ caseType }).then((caseRef) => {
				navigateToReferenceUpdate(caseRef);
				caseDetailsPage.updatePlanningApplicationReference(maxLengthReference);

				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal updated');
				cy.loadAppealDetails(caseRef)
					.its('planningApplicationReference')
					.should('eq', maxLengthReference);
			});
		});
	});

	it('should display expected fields for householder (D) case', () => {
		cy.createCase().then((caseRef) => {
			appellantCasePage.navigateToAppellantCase(caseRef);
			// ✅ Appellant section
			appellantCasePage.assertAppellantDetails({
				firstName: apiUsers[0].firstName,
				lastName: apiUsers[0].lastName,
				organisation: apiUsers[0].organisation,
				email: apiUsers[0].emailAddress,
				phone: apiUsers[0].telephoneNumber
			});

			// ✅ Agent section
			appellantCasePage.assertAgentDetails({
				firstName: apiUsers[1].firstName,
				lastName: apiUsers[1].lastName,
				organisation: apiUsers[1].organisation,
				email: apiUsers[1].emailAddress,
				phone: apiUsers[1].telephoneNumber
			});
			//Site Details
			appellantCasePage.assertSiteAddress(
				`${casedata.siteAddressLine1}, ${casedata.siteAddressLine2}, ${casedata.siteAddressTown}, ${casedata.siteAddressCounty}, ${casedata.siteAddressPostcode}`
			);
			appellantCasePage.assertSiteArea(`${casedata.siteAreaSquareMetres}`);
			appellantCasePage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');
			appellantCasePage.assertOwnsAllLand(casedata.ownsAllLand ? 'Fully owned' : 'Partially owned');
			appellantCasePage.assertKnowsOwnership(casedata.knowsAllOwners);
			appellantCasePage.assertInspectorAccess(casedata.siteAccessDetails[0]);
			appellantCasePage.assertHealthAndSafety(casedata.siteSafetyDetails[0]);
			// Application details
			appellantCasePage.assertApplicationReference(casedata.applicationReference);
			appellantCasePage.assertApplicationDate(formatDate(casedata.applicationDate));
			appellantCasePage.assertDevelopmentDescription(casedata.originalDevelopmentDescription);
			appellantCasePage.assertOtherAppeals(casedata.nearbyCaseReferences.length ? 'Yes' : 'No');
			appellantCasePage.assertApplicationDecision(capitalize(casedata.applicationDecision));
			appellantCasePage.assertDecisionDate(formatDate(casedata.applicationDecisionDate));
			// Appeal details
			appellantCasePage.assertAppealType('Full planning');
			// Upload document status
			appellantCasePage.assertApplicationFormLabel();
			appellantCasePage.assertAgreementToChangeDescriptionLabel();
			appellantCasePage.assertAppealStatementLabel();
			appellantCasePage.assertCostsApplicationLabel();
			appellantCasePage.assertAdditionalDocumentsLabel();
		});
	});

	it('should display expected fields for full planning (W) case', () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			appellantCasePage.navigateToAppellantCase(caseRef);
			// ✅ Appellant section
			appellantCasePage.assertAppellantDetails({
				firstName: apiUsers[0].firstName,
				lastName: apiUsers[0].lastName,
				organisation: apiUsers[0].organisation,
				email: apiUsers[0].emailAddress,
				phone: apiUsers[0].telephoneNumber
			});

			// ✅ Agent section
			appellantCasePage.assertAgentDetails({
				firstName: apiUsers[1].firstName,
				lastName: apiUsers[1].lastName,
				organisation: apiUsers[1].organisation,
				email: apiUsers[1].emailAddress,
				phone: apiUsers[1].telephoneNumber
			});
			//Site Details
			appellantCasePage.assertSiteAddress(
				`${casedata.siteAddressLine1}, ${casedata.siteAddressLine2}, ${casedata.siteAddressTown}, ${casedata.siteAddressCounty}, ${casedata.siteAddressPostcode}`
			);
			appellantCasePage.assertSiteArea(`${casedata.siteAreaSquareMetres} m²`);
			appellantCasePage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');
			appellantCasePage.assertOwnsAllLand(casedata.ownsAllLand ? 'Fully owned' : 'Partially owned');
			appellantCasePage.assertKnowsOwnership(casedata.knowsAllOwners);
			appellantCasePage.assertInspectorAccess(casedata.siteAccessDetails[0]);
			appellantCasePage.assertHealthAndSafety(casedata.siteSafetyDetails[0]);
			appellantCasePage.assertAgriculturalHolding(casedata.agriculturalHolding ? 'Yes' : 'No');
			appellantCasePage.assertAgriculturalTenancy(
				casedata.tenantAgriculturalHolding ? 'Yes' : 'No'
			);
			appellantCasePage.assertOtherTenants(casedata.otherTenantsAgriculturalHolding ? 'Yes' : 'No');
			// Application details
			appellantCasePage.assertApplicationReference(casedata.applicationReference);
			appellantCasePage.assertApplicationDate(formatDate(casedata.applicationDate));
			appellantCasePage.assertDevelopmentDescription(casedata.originalDevelopmentDescription);
			appellantCasePage.assertOtherAppeals(casedata.nearbyCaseReferences.length ? 'Yes' : 'No');
			appellantCasePage.assertApplicationDecision(capitalize(casedata.applicationDecision));
			appellantCasePage.assertDecisionDate(formatDate(casedata.applicationDecisionDate));
			appellantCasePage.assertDevelopmentType('Minor dwellings');
			// Appeal details
			appellantCasePage.assertProcedurePreference('Not answered'); // No value set in API
			appellantCasePage.assertProcedureReason(casedata.appellantProcedurePreferenceDetails);
			appellantCasePage.assertInquiryDuration(
				`${casedata.appellantProcedurePreferenceDuration} day`
			);
			appellantCasePage.assertWitnessCount(`${casedata.appellantProcedurePreferenceWitnessCount}`);
			// Upload document labbels
			appellantCasePage.assertDecisionLetterLabel();
			appellantCasePage.assertPlanningObligationStatusLabel();
			appellantCasePage.assertPlanningObligationDocLabel();
			appellantCasePage.assertDraftStatementLabel();
			appellantCasePage.assertOwnershipDeclarationLabel();
			appellantCasePage.assertDesignAccessLabel();
			appellantCasePage.assertPlansListLabel();
			appellantCasePage.assertNewPlansLabel();
			appellantCasePage.assertOtherSupportingDocsLabel();
		});
	});

	it('should display expected fields for s20 listed building planning (Y) case', () => {
		cy.createCase({ caseType: 'Y' }).then((caseRef) => {
			appellantCasePage.navigateToAppellantCase(caseRef);
			// ✅ Appellant section
			appellantCasePage.assertAppellantDetails({
				firstName: apiUsers[0].firstName,
				lastName: apiUsers[0].lastName,
				organisation: apiUsers[0].organisation,
				email: apiUsers[0].emailAddress,
				phone: apiUsers[0].telephoneNumber
			});

			// ✅ Agent section
			appellantCasePage.assertAgentDetails({
				firstName: apiUsers[1].firstName,
				lastName: apiUsers[1].lastName,
				organisation: apiUsers[1].organisation,
				email: apiUsers[1].emailAddress,
				phone: apiUsers[1].telephoneNumber
			});
			//Site Details
			appellantCasePage.assertSiteAddress(
				`${casedata.siteAddressLine1}, ${casedata.siteAddressLine2}, ${casedata.siteAddressTown}, ${casedata.siteAddressCounty}, ${casedata.siteAddressPostcode}`
			);
			appellantCasePage.assertSiteArea(`${casedata.siteAreaSquareMetres} m²`);
			appellantCasePage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');
			appellantCasePage.assertOwnsAllLand(casedata.ownsAllLand ? 'Fully owned' : 'Partially owned');
			appellantCasePage.assertKnowsOwnership(casedata.knowsAllOwners);
			appellantCasePage.assertInspectorAccess(casedata.siteAccessDetails[0]);
			appellantCasePage.assertHealthAndSafety(casedata.siteSafetyDetails[0]);
			///Not present in s20
			appellantCasePage.assertAgriculturalHoldingNotPresent();
			appellantCasePage.assertAgriculturalTenancyNotPresent();
			appellantCasePage.assertOtherTenantsNotPresent();
			// Application details
			appellantCasePage.assertApplicationReference(casedata.applicationReference);
			appellantCasePage.assertApplicationDate(formatDate(casedata.applicationDate));
			appellantCasePage.assertDevelopmentDescription(casedata.originalDevelopmentDescription);
			appellantCasePage.assertOtherAppeals(casedata.nearbyCaseReferences.length ? 'Yes' : 'No');
			appellantCasePage.assertApplicationDecision(capitalize(casedata.applicationDecision));
			appellantCasePage.assertDecisionDate(formatDate(casedata.applicationDecisionDate));
			appellantCasePage.assertDevelopmentType('Minor dwellings');
			// Appeal details
			appellantCasePage.assertProcedurePreference('Not answered'); // No value set in API
			appellantCasePage.assertProcedureReason(casedata.appellantProcedurePreferenceDetails);
			appellantCasePage.assertInquiryDuration(
				`${casedata.appellantProcedurePreferenceDuration} day`
			);
			appellantCasePage.assertWitnessCount(`${casedata.appellantProcedurePreferenceWitnessCount}`);
			// Upload document labbels
			appellantCasePage.assertDecisionLetterLabel();
			appellantCasePage.assertPlanningObligationStatusLabel();
			appellantCasePage.assertPlanningObligationDocLabel();
			appellantCasePage.assertDraftStatementLabel();
			appellantCasePage.assertOwnershipDeclarationLabel();
			appellantCasePage.assertDesignAccessLabel();
			appellantCasePage.assertPlansListLabel();
			appellantCasePage.assertNewPlansLabel();
			appellantCasePage.assertOtherSupportingDocsLabel();
		});
	});

	const navigateToReferenceUpdate = (caseRef) => {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseRef);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.clickChangeApplicationReferenceLink();
	};

	const verifyError = (message) => {
		caseDetailsPage.checkErrorMessageDisplays(message);
		caseDetailsPage.verifyInlineErrorMessage(`${fieldId}-error`);
		caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
	};
});

function formatDate(dateStr) {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
