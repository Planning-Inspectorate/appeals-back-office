// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { LpaqPage } from '../../page_objects/caseDetails/lpaqPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { tag } from '../../support/tag';

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

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Complete LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Complete');
			caseDetailsPage.clickButtonByText('Confirm');
			const status = 'Complete';
			const testData = { rowIndex: 1, cellIndex: 0, textToMatch: status, strict: true };
			listCasesPage.verifyTableCellText(testData);
		});
	});

	it('incomplete LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384', 1);
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
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.clickReviewLpaq();
			caseDetailsPage.selectRadioButtonByValue('Incomplete');
			caseDetailsPage.clickButtonByText('Confirm');
			caseDetailsPage.chooseCheckboxByText('Other documents or information are missing');
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384!', 1);
			caseDetailsPage.clickAddAnother();
			caseDetailsPage.fillInput('Hello here is some extra info, have a nice day 7384!', 2);
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
	it('HAS - LPAQ', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
			caseDetailsPage.clickReviewLpaq();

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is householder the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');

			// Section 2 – Notifications
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 3 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);

			// Section 4 – Officer Reports & Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Plans, drawings and list of plans', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');

			// Section 5 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 6 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});

	it('S78 Full Planning - LPAQ Review', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.clickReviewLpaq();
			const address = casedata.neighbouringSiteAddresses[0];

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is planning appeal the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Would the development affect a scheduled monument?', '');
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Would the development affect a protected species?', '');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');
			lpaqPage.assertDesignatedSites(casedata.designatedSitesNames);
			lpaqPage.assertFieldLabelAndValue('Tree Preservation Order', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Definitive map and statement extract', 'No documents');

			// Section 2 – Environmental Impact Assessment
			lpaqPage.assertFieldLabelAndValue('What is the development category?', 'Other');
			lpaqPage.assertFieldLabelAndValue(
				'Environmental statement and supporting information',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Screening opinion documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Screening direction documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Scoping opinion documents', 'No documents');

			// Section 3 – Notifying relevant parties
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 4 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Relevant policies from statutory development plan', 'No');
			lpaqPage.assertFieldLabelAndValue(
				'Consultation responses and standing advice',
				'No documents'
			);

			// Section 5 – Officer Reports and Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'When was the community infrastructure levy formally adopted?',
				'Not applicable'
			);
			lpaqPage.assertFieldLabelAndValue(
				'When do you expect to formally adopt the community infrastructure levy?',
				'Not applicable'
			);

			// Section 6 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 7 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});

	it('S20 Listed Building - LPAQ Review', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'Y' }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
			caseDetailsPage.clickReviewLpaq();
			const address = casedata.neighbouringSiteAddresses[0];

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is planning listed building and conservation area appeal the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Would the development affect a scheduled monument?', '');
			lpaqPage.assertFieldLabelAndValue(
				'Was a grant or loan made to preserve the listed building at the appeal site?',
				''
			);
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Would the development affect a protected species?', '');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');
			lpaqPage.assertDesignatedSites(casedata.designatedSitesNames);
			lpaqPage.assertFieldLabelAndValue('Tree Preservation Order', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Definitive map and statement extract', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Historic England consultation', 'No documents');

			// Section 2 – Environmental Impact Assessment
			lpaqPage.assertFieldLabelAndValue('What is the development category?', 'Other');
			lpaqPage.assertFieldLabelAndValue(
				'Environmental statement and supporting information',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Screening opinion documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Screening direction documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Scoping opinion documents', 'No documents');

			// Section 3 – Notifying relevant parties
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 4 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Relevant policies from statutory development plan', 'No');
			lpaqPage.assertFieldLabelAndValue(
				'Consultation responses and standing advice',
				'No documents'
			);

			// Section 5 – Officer Reports and Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'When was the community infrastructure levy formally adopted?',
				'Not applicable'
			);
			lpaqPage.assertFieldLabelAndValue(
				'When do you expect to formally adopt the community infrastructure levy?',
				'Not applicable'
			);

			// Section 6 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 7 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});

	it('CAS Adverts - LPAQ Review', () => {
		cy.createCase({ ...appealsApiRequests.casAdvertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.clickReviewLpaq();
			const address = casedata.neighbouringSiteAddresses[0];

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is CAS advert the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Would the development affect a scheduled monument?', '');
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Would the development affect a protected species?', '');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');
			lpaqPage.assertDesignatedSites(casedata.designatedSitesNames);
			lpaqPage.assertFieldLabelAndValue(
				'Is the site in an area of special control of advertisements?',
				''
			);

			// Not Present
			lpaqPage.assertFieldNotPresent('Does the development change a listed building?', '');
			lpaqPage.assertFieldNotPresent('Tree Preservation Order', '');
			lpaqPage.assertFieldNotPresent('Definitive map and statement extract', '');
			lpaqPage.assertFieldNotPresent(
				'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
				''
			);

			// Section 2 – Notifying relevant parties
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 3 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Relevant policies from statutory development plan', 'No');

			// Not Present
			lpaqPage.assertFieldNotPresent('Consultation responses and standing advice', 'No documents');

			// Section 4 – Officer Reports and Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'Did you refuse the application because of highway or traffic public safety?',
				''
			);
			lpaqPage.assertFieldLabelAndValue(
				'Did the appellant submit complete and accurate photographs and plans?',
				''
			);
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Other relevant policies', 'No documents');

			lpaqPage.assertFieldNotPresent(
				'When was the community infrastructure levy formally adopted?'
			);
			lpaqPage.assertFieldNotPresent(
				'When do you expect to formally adopt the community infrastructure levy?'
			);

			// Section 5 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 7 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});

	it('CAS Planning - LPAQ review', { tags: tag.smoke }, () => {
		cy.createCase({ caseType: 'ZP' }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.clickReviewLpaq();

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is CAS planning the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');

			// Section 2 – Notifications
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 3 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);

			// Section 4 – Officer Reports & Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldNotPresent('Plans, drawings and list of plans', '');
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');

			// Section 5 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 6 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});

	it('Full Adverts - LPAQ Review', () => {
		cy.createCase({ ...appealsApiRequests.advertsSubmission.casedata }).then((caseObj) => {
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			happyPathHelper.updateCase(caseObj, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78');
			caseDetailsPage.clickReviewLpaq();
			const address = casedata.neighbouringSiteAddresses[0];

			// Section 1 – Constraints
			lpaqPage.assertFieldLabelAndValue(
				'Is advertisement the correct type of appeal?',
				casedata.isCorrectAppealType ? 'Yes' : 'No'
			);
			lpaqPage.assertFieldLabelAndValue(
				'Does the development affect the setting of listed buildings?',
				casedata.affectedListedBuildingNumbers[0]
			);
			lpaqPage.assertFieldLabelAndValue('Would the development affect a scheduled monument?', '');
			lpaqPage.assertFieldLabelAndValue('Conservation area map and guidance', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Would the development affect a protected species?', '');
			lpaqPage.assertFieldLabelAndValue('Green belt', casedata.isGreenBelt ? 'Yes' : 'No');
			lpaqPage.assertDesignatedSites(casedata.designatedSitesNames);
			lpaqPage.assertFieldLabelAndValue(
				'Is the site in an area of special control of advertisements?',
				''
			);

			// Not Present
			lpaqPage.assertFieldNotPresent('Tree Preservation Order', '');
			lpaqPage.assertFieldNotPresent('Definitive map and statement extract', '');
			lpaqPage.assertFieldNotPresent(
				'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
				''
			);

			// Section 2 – Notifying relevant parties
			lpaqPage.assertFieldLabelAndValue(
				'Who did you notify about this application?',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue(
				'How did you notify relevant parties about this application?',
				casedata.notificationMethod[0]
			);
			lpaqPage.assertFieldLabelAndValue('Site notice', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Letter or email notification', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Press advertisement', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Appeal notification letter', 'No documents');

			// Section 3 – Representations
			lpaqPage.assertFieldLabelAndValue(
				'Representations from members of the public or other parties',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Relevant policies from statutory development plan', 'No');

			// Not Present
			lpaqPage.assertFieldNotPresent('Consultation responses and standing advice', 'No documents');

			// Section 4 – Officer Reports and Plans
			lpaqPage.assertFieldLabelAndValue('Planning officer’s report', 'No documents');
			lpaqPage.assertFieldLabelAndValue(
				'Did you refuse the application because of highway or traffic public safety?',
				''
			);
			lpaqPage.assertFieldLabelAndValue(
				'Did the appellant submit complete and accurate photographs and plans?',
				''
			);
			lpaqPage.assertFieldLabelAndValue(
				'Relevant policies from statutory development plan',
				'No documents'
			);
			lpaqPage.assertFieldLabelAndValue('Supplementary planning documents', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Emerging plan relevant to appeal', 'No documents');
			lpaqPage.assertFieldLabelAndValue('Other relevant policies', 'No documents');

			lpaqPage.assertFieldNotPresent(
				'When was the community infrastructure levy formally adopted?'
			);
			lpaqPage.assertFieldNotPresent(
				'When do you expect to formally adopt the community infrastructure levy?'
			);

			// Section 5 – Site Access
			lpaqPage.assertFieldLabelAndValue(
				'Will the inspector need access to the appellant’s land or property?',
				casedata.siteAccessDetails[0]
			);
			lpaqPage.assertNeighbourSiteAddress({
				line1: address.neighbouringSiteAddressLine1,
				line2: address.neighbouringSiteAddressLine2,
				town: address.neighbouringSiteAddressTown,
				county: address.neighbouringSiteAddressCounty,
				postcode: address.neighbouringSiteAddressPostcode
			});
			lpaqPage.assertFieldLabelAndValue(
				'Are there any potential safety risks?',
				casedata.siteSafetyDetails[0]
			);

			// Section 7 – Appeal Process
			lpaqPage.assertFieldLabelAndValue(
				'Are there any other ongoing appeals next to, or close to the site?',
				casedata.nearbyCaseReferences
			);

			// Final section
			lpaqPage.assertFieldLabelAndValue('Additional documents', 'None');
		});
	});
});
