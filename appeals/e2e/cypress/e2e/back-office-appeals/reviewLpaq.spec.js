// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { tag } from '../../support/tag';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { LpaqPage } from '../../page_objects/caseDetails/lpaqPage.js';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';

const listCasesPage = new ListCasesPage();
const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const lpaqPage = new LpaqPage();

const { casedata } = appealsApiRequests.lpaqSubmission;
const [address] = appealsApiRequests.lpaqSubmission.casedata.neighbouringSiteAddresses;

describe('Review LPAQ', () => {
	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});
	it('Complete LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Complete');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Complete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
			caseDetailsPage.clickButtonByText('Continue');
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Incomplete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete LPAQ add another', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 1);
			caseDetailsPage.clickAddAnother();
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384_+!£ =', 2);
			caseDetailsPage.clickButtonByText('Continue');
			cy.getBusinessActualDate(new Date(), 28).then((futureDate) => {
				dateTimeSection.enterDate(futureDate);
			});
			caseDetailsPage.clickButtonByText('Save and Continue');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Incomplete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});
	it('Validate fields and answers in LPAQfor householder appeal', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.clickReviewLpaq();
			// Section 1 – Constraints
			lpaqPage.assertCorrectAppealType(casedata.isCorrectAppealType ? 'Yes' : 'No');
			lpaqPage.assertAffectsListedBuilding(casedata.affectedListedBuildingNumbers[0]);
			lpaqPage.assertConservationAreaMapLabel('No documents');
			lpaqPage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');

			// Section 2 – Notifications
			lpaqPage.assertNotifiedWho('No documents');
			lpaqPage.assertNotifiedHow(casedata.notificationMethod[0]);
			lpaqPage.assertSiteNoticeLabel('No documents');
			lpaqPage.assertEmailNotificationLabel('No documents');
			lpaqPage.assertPressAdvertLabel('No documents');
			lpaqPage.assertNotificationLetterLabel('No documents');

			// // Section 3 – Representations
			lpaqPage.assertRepresentationsLabel('No documents');

			// // Section 4 – Officer Reports & Plans
			lpaqPage.assertPlanningOfficerReportLabel('No documents');
			lpaqPage.assertPlansDrawingsLabel('No documents');
			lpaqPage.assertStatutoryPoliciesLabel('No documents');
			lpaqPage.assertSupplementaryDocsLabel('No documents');
			lpaqPage.assertEmergingPlanLabel('No documents');

			// // Section 5 – Site Access
			lpaqPage.assertInspectorAccess(casedata.siteAccessDetails[0]);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertSafetyRisks(casedata.siteSafetyDetails[0]); // Example from API

			// Section 6 – Appeal Process
			lpaqPage.assertOngoingAppeals(casedata.nearbyCaseReferences);

			// Final section
			lpaqPage.assertAdditionalDocumentsLabel('None');
		});
	});

	it('Validate fields and answers in LPAQ for s78 appeal', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.clickReviewLpaq();
			const address = casedata.neighbouringSiteAddresses[0];

			// Section 1 – Constraints
			lpaqPage.assertPlanningAppealType(casedata.isCorrectAppealType ? 'Yes' : 'No');
			lpaqPage.assertAffectsListedBuilding(casedata.affectedListedBuildingNumbers[0]);
			lpaqPage.assertScheduledMonument(''); //awaiting bug fix
			lpaqPage.assertConservationAreaMapLabel('No documents');
			lpaqPage.assertProtectedSpecies(''); //awaiting bug fix
			lpaqPage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');
			// lpaqPage.assertAONB(); //awaiting bug fix
			lpaqPage.assertDesignatedSites('No');
			lpaqPage.assertTreePreservationOrder('No documents');
			// lpaqPage.assertGypsyTraveller(''); //awaiting bug fix
			lpaqPage.assertDefinitiveMapLabel('No documents');

			// Section 2 – Environmental Impact Assessment
			lpaqPage.assertDevelopmentCategory('Other');
			// lpaqPage.assertThresholdMet('No');//awaiting bug fix
			// lpaqPage.assertEIAStatementRequired('No');//awaiting bug fix
			lpaqPage.assertEnvironmentalStatementLabel('No documents');
			lpaqPage.assertScreeningOpinionDocsLabel('No documents');
			lpaqPage.assertScreeningDirectionDocsLabel('No documents');
			lpaqPage.assertScopingOpinionDocsLabel('No documents');
			// lpaqPage.assertEIADevelopmentDescription('No');//awaiting bug fix
			// lpaqPage.assertSensitiveArea(casedata.assertSensitiveArea ? 'Yes' : 'No');//awaiting bug fix

			// Section 3 – Notifying relevant parties
			lpaqPage.assertNotifiedWho('No documents');
			lpaqPage.assertNotifiedHow(casedata.notificationMethod[0]);
			lpaqPage.assertSiteNoticeLabel('No documents');
			lpaqPage.assertEmailNotificationLabel('No documents');
			lpaqPage.assertPressAdvertLabel('No documents');
			lpaqPage.assertNotificationLetterLabel('No documents');

			// Section 4 – Representations
			lpaqPage.assertRepresentationsLabel('No documents');
			// lpaqPage.assertConsultationResponsesLabel('No documents');//awaiting bug fix
			lpaqPage.assertStatutoryPoliciesLabel('No');

			// Section 5 – Officer Reports and Plans
			lpaqPage.assertPlanningOfficerReportLabel('No documents');
			lpaqPage.assertStatutoryPoliciesLabel('No documents');
			lpaqPage.assertSupplementaryDocsLabel('No documents');
			lpaqPage.assertEmergingPlanLabel('No documents');
			// lpaqPage.assertOtherRelevantPoliciesLabel('No documents');//awaiting bug fix
			// lpaqPage.assertCommunityInfrastructureLevy('No');//awaiting bug fix
			// lpaqPage.assertCILAdopted('Not applicable');
			lpaqPage.assertCILAdoptedDate('Not applicable');
			lpaqPage.assertCILExpectedDate('Not applicable');

			// Section 6 – Site Access
			lpaqPage.assertInspectorAccess(casedata.siteAccessDetails[0]);
			// lpaqPage.assertNeighbourLandAccess('No');//awaiting bug fix
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertSafetyRisks(casedata.siteSafetyDetails[0]);

			// Section 7 – Appeal Process
			// lpaqPage.assertLpaProcedurePreference('Not applicable');//awaiting bug fix
			// lpaqPage.assertLpaProcedureReason('Not applicable');//awaiting bug fix
			// lpaqPage.assertInquiryDuration('Not applicable');//awaiting bug fix
			lpaqPage.assertOngoingAppeals(casedata.nearbyCaseReferences);

			// Final section
			lpaqPage.assertAdditionalDocumentsLabel('None');
		});
	});

	it(
		'Validate attributes and answers in LPAQ for s20 listed building appeal',
		{ tags: tag.smoke },
		() => {
			cy.createCase({ caseType: 'Y' }).then((caseRef) => {
				cy.addLpaqSubmissionToCase(caseRef);
				happyPathHelper.assignCaseOfficer(caseRef);
				happyPathHelper.reviewAppellantCase(caseRef);
				happyPathHelper.startCase(caseRef);
				caseDetailsPage.clickReviewLpaq();
				const address = casedata.neighbouringSiteAddresses[0];

				// Section 1 – Constraints
				lpaqPage.assertListedBuildingAppealType(casedata.isCorrectAppealType ? 'Yes' : 'No');
				lpaqPage.assertAffectsListedBuilding(casedata.affectedListedBuildingNumbers[0]);
				lpaqPage.assertScheduledMonument(''); //awaiting bug fix
				lpaqPage.assertGrantOrLoanLabel('');
				lpaqPage.assertConservationAreaMapLabel('No documents');
				lpaqPage.assertProtectedSpecies(''); //awaiting bug fix
				lpaqPage.assertGreenBelt(casedata.isGreenBelt ? 'Yes' : 'No');
				// lpaqPage.assertAONB(); //awaiting bug fix
				lpaqPage.assertDesignatedSites('No');
				lpaqPage.assertTreePreservationOrder('No documents');
				// lpaqPage.assertGypsyTraveller(''); //awaiting bug fix
				lpaqPage.assertDefinitiveMapLabel('No documents');
				lpaqPage.assertHistoricEnglandLabel('No documents');

				// Section 2 – Environmental Impact Assessment
				lpaqPage.assertDevelopmentCategory('Other');
				// lpaqPage.assertThresholdMet('No');//awaiting bug fix
				// lpaqPage.assertEIAStatementRequired('No');//awaiting bug fix
				lpaqPage.assertEnvironmentalStatementLabel('No documents');
				lpaqPage.assertScreeningOpinionDocsLabel('No documents');
				lpaqPage.assertScreeningDirectionDocsLabel('No documents');
				lpaqPage.assertScopingOpinionDocsLabel('No documents');
				// lpaqPage.assertEIADevelopmentDescription('No');//awaiting bug fix
				// lpaqPage.assertSensitiveArea(casedata.assertSensitiveArea ? 'Yes' : 'No');//awaiting bug fix

				// Section 3 – Notifying relevant parties
				lpaqPage.assertNotifiedWho('No documents');
				lpaqPage.assertNotifiedHow(casedata.notificationMethod[0]);
				lpaqPage.assertSiteNoticeLabel('No documents');
				lpaqPage.assertEmailNotificationLabel('No documents');
				lpaqPage.assertPressAdvertLabel('No documents');
				lpaqPage.assertNotificationLetterLabel('No documents');

				// Section 4 – Representations
				lpaqPage.assertRepresentationsLabel('No documents');
				// lpaqPage.assertConsultationResponsesLabel('No documents');//awaiting bug fix
				lpaqPage.assertStatutoryPoliciesLabel('No');

				// Section 5 – Officer Reports and Plans
				lpaqPage.assertPlanningOfficerReportLabel('No documents');
				lpaqPage.assertStatutoryPoliciesLabel('No documents');
				lpaqPage.assertSupplementaryDocsLabel('No documents');
				lpaqPage.assertEmergingPlanLabel('No documents');
				// lpaqPage.assertOtherRelevantPoliciesLabel('No documents');//awaiting bug fix
				// lpaqPage.assertCommunityInfrastructureLevy('No');//awaiting bug fix
				// lpaqPage.assertCILAdopted('Not applicable');
				lpaqPage.assertCILAdoptedDate('Not applicable');
				lpaqPage.assertCILExpectedDate('Not applicable');

				// Section 6 – Site Access
				lpaqPage.assertInspectorAccess(casedata.siteAccessDetails[0]);
				// lpaqPage.assertNeighbourLandAccess('No');//awaiting bug fix
				lpaqPage.assertNeighbourSiteAddress({
					line1: address.neighbouringSiteAddressLine1,
					line2: address.neighbouringSiteAddressLine2,
					town: address.neighbouringSiteAddressTown,
					county: address.neighbouringSiteAddressCounty,
					postcode: address.neighbouringSiteAddressPostcode
				});
				lpaqPage.assertSafetyRisks(casedata.siteSafetyDetails[0]);

				// Section 7 – Appeal Process
				// lpaqPage.assertLpaProcedurePreference('Not applicable');//awaiting bug fix
				// lpaqPage.assertLpaProcedureReason('Not applicable');//awaiting bug fix
				// lpaqPage.assertInquiryDuration('Not applicable');//awaiting bug fix
				lpaqPage.assertOngoingAppeals(casedata.nearbyCaseReferences);

				// Final section
				lpaqPage.assertAdditionalDocumentsLabel('None');
			});
		}
	);
});
