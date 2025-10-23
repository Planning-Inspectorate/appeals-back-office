// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();

const { users: apiUsers, casedata, casAdvertsCasedata } = appealsApiRequests.caseSubmission;
const casAdvertData = appealsApiRequests.casAdvertsSubmission.casedata;
const fullAdvertData = appealsApiRequests.advertsSubmission.casedata;

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

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('should reject empty value for the LPA application number', () => {
		cy.createCase({ caseType: 'D' }).then((caseObj) => {
			appeal = caseObj;
			navigateToReferenceUpdate(caseObj);
			caseDetailsPage.updatePlanningApplicationReference(' ');
			verifyError('Enter the application reference number');
		});
	});

	it('should reject reference exceeding 100 characters for the LPA application number', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			navigateToReferenceUpdate(caseObj);
			caseDetailsPage.updatePlanningApplicationReference(exceededLengthReference);
			verifyError('Application reference number must be 100 characters or less');
		});
	});

	Object.entries(appealTypes).forEach(([caseType, description]) => {
		it(`should update ${description} LPA application reference`, () => {
			cy.createCase({ caseType }).then((caseObj) => {
				appeal = caseObj;
				navigateToReferenceUpdate(caseObj);
				caseDetailsPage.updatePlanningApplicationReference(maxLengthReference);

				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Appeal updated');
				cy.loadAppealDetails(caseObj)
					.its('planningApplicationReference')
					.should('eq', maxLengthReference);
			});
		});
	});
	it('HAS - appellant form', () => {
		cy.createCase({ applicationDecision: 'not_received' }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(casedata);

			// 1 Site details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${casedata.siteAreaSquareMetres} m²`
			);

			// 2 Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casedata.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(casedata.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				casedata.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casedata.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				'I have not received a decision'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date was your decision due from the local planning authority?',
				formatDate(casedata.applicationDecisionDate)
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What type of application is your appeal about?',
				'Full planning'
			);

			// 4 Upload docs
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of development',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Appeal statement', '');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');
			appellantCasePage.assertFieldLabelAndValue('Additional documents', '');
		});
	});

	it('S78 Full Planning - appellant form', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(casedata);

			// Site details + agri
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${casedata.siteAreaSquareMetres} m²`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Is the appeal site part of an agricultural holding?',
				casedata.agriculturalHolding ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are you a tenant of the agricultural holding?',
				casedata.tenantAgriculturalHolding ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there any other tenants?',
				casedata.otherTenantsAgriculturalHolding ? 'Yes' : 'No'
			);

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casedata.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(casedata.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				casedata.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casedata.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(casedata.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDate(casedata.applicationDecisionDate)
			);
			appellantCasePage.assertFieldLabelAndValue('Development type', 'Minor dwellings');

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'How would you prefer us to decide your appeal?',
				'Written representation'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why would you prefer this appeal procedure?',
				casedata.appellantProcedurePreferenceDetails
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many days would you expect the inquiry to last?',
				`${casedata.appellantProcedurePreferenceDuration} day`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many witnesses would you expect to give evidence at the inquiry?',
				`${casedata.appellantProcedurePreferenceWitnessCount}`
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue(
				'Decision letter from the local planning authority',
				''
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What is the status of your planning obligation?',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Planning obligation', '');
			appellantCasePage.assertFieldLabelAndValue('Draft statement of common ground', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Separate ownership certificate and agricultural land declaration',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Design and access statement', '');
			appellantCasePage.assertFieldLabelAndValue('Plans, drawings and list of plans', '');
			appellantCasePage.assertFieldLabelAndValue('New plans or drawings', '');
			appellantCasePage.assertFieldLabelAndValue('Other new supporting documents', '');
		});
	});

	it('S20 Listed Building - appellant form', () => {
		cy.createCase({ caseType: 'Y' }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(casedata);

			// Not present (S20)
			appellantCasePage.assertFieldNotPresent(
				'Is the appeal site part of an agricultural holding?'
			);
			appellantCasePage.assertFieldNotPresent('Are you a tenant of the agricultural holding?');
			appellantCasePage.assertFieldNotPresent('Are there any other tenants?');

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${casedata.siteAreaSquareMetres} m²`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casedata.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(casedata.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				casedata.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casedata.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(casedata.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDate(casedata.applicationDecisionDate)
			);
			appellantCasePage.assertFieldLabelAndValue('Development type', 'Minor dwellings');

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'How would you prefer us to decide your appeal?',
				'Written representation'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why would you prefer this appeal procedure?',
				casedata.appellantProcedurePreferenceDetails
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many days would you expect the inquiry to last?',
				`${casedata.appellantProcedurePreferenceDuration} day`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many witnesses would you expect to give evidence at the inquiry?',
				`${casedata.appellantProcedurePreferenceWitnessCount}`
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue(
				'Decision letter from the local planning authority',
				''
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What is the status of your planning obligation?',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Planning obligation', '');
			appellantCasePage.assertFieldLabelAndValue('Draft statement of common ground', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Separate ownership certificate and agricultural land declaration',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Design and access statement', '');
			appellantCasePage.assertFieldLabelAndValue('Plans, drawings and list of plans', '');
			appellantCasePage.assertFieldLabelAndValue('New plans or drawings', '');
			appellantCasePage.assertFieldLabelAndValue('Other new supporting documents', '');
		});
	});

	it('CAS Advert - appellant form', () => {
		cy.createCase({ ...casAdvertData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions for CAS adverts
			assertBaseQuestions(casedata);

			// Not present
			appellantCasePage.assertFieldNotPresent('What is the area of the appeal site?');
			appellantCasePage.assertFieldNotPresent('Additional documents');

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casAdvertData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(casAdvertData.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of the advertisement',
				casAdvertData.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casAdvertData.nearbyCaseReferences
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				'Refused'
			);

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What type of application is your appeal about?',
				'Displaying an advertisement'
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of the advertisement',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Appeal statement', '');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');

			// Advert specific fields
			appellantCasePage.assertFieldLabelAndValue(
				'Is the appeal site on highway land?',
				casAdvertData.advertDetails[0].isSiteOnHighwayLand ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Is the advertisement in position?',
				casAdvertData.advertDetails[0].isAdvertInPosition ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				"Do you have the landowner's permission?",
				casAdvertData.hasLandownersPermission ? 'Yes' : 'No'
			);
		});
	});

	it('CAS Planning - appellant form', () => {
		cy.createCase({ caseType: 'ZP' }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(casedata);

			// 1 Site details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${casedata.siteAreaSquareMetres} m²`
			);

			// 2 Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casedata.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(casedata.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				casedata.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casedata.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(casedata.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDate(casedata.applicationDecisionDate)
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What type of application is your appeal about?',
				'Full planning'
			);

			// 4 Upload docs
			appellantCasePage.assertFieldLabelAndValue('Application form', 'No documents');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of development',
				'No documents'
			);
			appellantCasePage.assertFieldLabelAndValue('Appeal statement', 'No documents');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');
			appellantCasePage.assertFieldLabelAndValue('Design and access statement', 'No documents');
			appellantCasePage.assertFieldLabelAndValue(
				'Plans, drawings and list of plans',
				'No documents'
			);

			appellantCasePage.assertFieldNotPresent('Additional documents');
		});
	});

	it('Full Advert - appellant form', () => {
		cy.createCase({ ...fullAdvertData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions for CAS adverts
			assertBaseQuestions(casedata);

			// Not present
			appellantCasePage.assertFieldNotPresent('What is the area of the appeal site?');
			appellantCasePage.assertFieldNotPresent('Additional documents');

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				fullAdvertData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDate(fullAdvertData.applicationDate)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of the advertisement',
				fullAdvertData.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				fullAdvertData.nearbyCaseReferences
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				'Refused'
			);

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What type of application is your appeal about?',
				'Displaying an advertisement'
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of the advertisement',
				''
			);
			appellantCasePage.assertFieldLabelAndValue('Appeal statement', '');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');

			// Full advert–specific fields
			appellantCasePage.assertFieldLabelAndValue(
				'Is the appeal site on highway land?',
				fullAdvertData.advertDetails[0].isSiteOnHighwayLand ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Is the advertisement in position?',
				fullAdvertData.advertDetails[0].isAdvertInPosition ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				"Do you have the landowner's permission?",
				fullAdvertData.hasLandownersPermission ? 'Yes' : 'No'
			);

			appellantCasePage.assertFieldLabelAndValue(
				'How would you prefer us to decide your appeal?',
				capitalize(fullAdvertData.appellantProcedurePreference)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why would you prefer this appeal procedure?',
				fullAdvertData.appellantProcedurePreferenceDetails
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many days would you expect the inquiry to last?',
				fullAdvertData.appellantProcedurePreferenceDuration
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many witnesses would you expect to give evidence at the inquiry?',
				fullAdvertData.appellantProcedurePreferenceWitnessCount
			);
		});
	});

	const navigateToReferenceUpdate = (caseObj) => {
		caseDetailsPage.navigateToAppealsService();
		listCasesPage.clickAppealByRef(caseObj);
		caseDetailsPage.clickReviewAppellantCase();
		caseDetailsPage.clickChangeApplicationReferenceLink();
	};

	const verifyError = (message) => {
		caseDetailsPage.checkErrorMessageDisplays(message);
		caseDetailsPage.verifyInlineErrorMessage(`${fieldId}-error`);
		caseDetailsPage.verifyInputFieldIsFocusedWhenErrorMessageLinkIsClicked(fieldId, 'id', fieldId);
	};

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

	const assertBaseQuestions = (submissionType) => {
		// Appellant section
		appellantCasePage.assertAppellantDetails({
			firstName: apiUsers[0].firstName,
			lastName: apiUsers[0].lastName,
			organisation: apiUsers[0].organisation,
			email: apiUsers[0].emailAddress,
			phone: apiUsers[0].telephoneNumber
		});

		// Agent section
		appellantCasePage.assertAgentDetails({
			firstName: apiUsers[1].firstName,
			lastName: apiUsers[1].lastName,
			organisation: apiUsers[1].organisation,
			email: apiUsers[1].emailAddress,
			phone: apiUsers[1].telephoneNumber
		});

		// Site details
		appellantCasePage.assertFieldLabelAndValue(
			'What is the address of the appeal site?',
			`${submissionType.siteAddressLine1}, ${submissionType.siteAddressLine2}, ${submissionType.siteAddressTown}, ${submissionType.siteAddressCounty}, ${submissionType.siteAddressPostcode}`
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Is the appeal site in a green belt?',
			submissionType.isGreenBelt ? 'Yes' : 'No'
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Does the appellant own all of the land involved in the appeal?',
			submissionType.ownsAllLand ? 'Fully owned' : 'Partially owned'
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Does the appellant know who owns the land involved in the appeal?',
			submissionType.knowsAllOwners
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Will an inspector need to access your land or property?',
			submissionType.siteAccessDetails[0]
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Are there any health and safety issues on the appeal site?',
			submissionType.siteSafetyDetails[0]
		);
	};
});
