// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { AppellantCasePage } from '../../page_objects/caseDetails/appellantCasePage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage';
import { GroundsOfAppealPage } from '../../page_objects/groundsOfAppealPage';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { BANNER_TYPES, SUCCESS_MESSAGES } from '../../support/consts.js';
import { capitalize, formatDateAndTime } from '../../support/utils/format.js';

const listCasesPage = new ListCasesPage();
const caseDetailsPage = new CaseDetailsPage();
const appellantCasePage = new AppellantCasePage();
const groundsOfAppealPage = new GroundsOfAppealPage();
const caseHistoryPage = new CaseHistoryPage();

const {
	users: apiUsers,
	casedata,
	casAdvertsCasedata,
	enforcementCasedata
} = appealsApiRequests.caseSubmission;
const hasExpeditedData = appealsApiRequests.hasExpeditedSubmission.casedata;
const casPlanningExpeditedData = appealsApiRequests.casPlanningExpeditedSubmission.casedata;
const casAdvertExpeditedData = appealsApiRequests.casAdvertsExpeditedSubmission.casedata;
const casAdvertData = appealsApiRequests.casAdvertsSubmission.casedata;
const fullAdvertData = appealsApiRequests.advertsSubmission.casedata;
const enforcementData = appealsApiRequests.enforcementSubmission.casedata;
const enforcementLinkedData = appealsApiRequests.enforcementLinkedSubmission.casedata;

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
		//cy.deleteAppeals(appeal);
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
				formatDateAndTime(new Date(casedata.applicationDate)).date
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
				formatDateAndTime(new Date(casedata.applicationDecisionDate)).date
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue('What is your appeal about?', 'Full planning');

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

	it('HAS - expedited appellant form', () => {
		cy.createCase({ ...hasExpeditedData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(hasExpeditedData);

			// 1 Site details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${hasExpeditedData.siteAreaSquareMetres} m²`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Yes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Local plan: Local plan changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'National policy: National policy changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Court judgment: Court judgment changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Other: Other changes'
			);

			// 2 Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				hasExpeditedData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDateAndTime(new Date(hasExpeditedData.applicationDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				hasExpeditedData.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				hasExpeditedData.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(hasExpeditedData.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDateAndTime(new Date(hasExpeditedData.applicationDecisionDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Decision letter from the local planning authority',
				'No documents'
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What is your appeal about?',
				'Householder planning'
			);

			appellantCasePage.assertFieldLabelAndValue(
				'Why are you appealing?',
				hasExpeditedData.reasonForAppealAppellant
			);

			// 4 Upload docs (No appeal statement)
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of development',
				''
			);
			appellantCasePage.assertFieldNotPresent('Appeal statement');
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
				formatDateAndTime(new Date(casedata.applicationDate)).date
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
				formatDateAndTime(new Date(casedata.applicationDecisionDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue('Development type', 'Minor dwellings');

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue('What is your appeal about?', 'Full planning');
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
				formatDateAndTime(new Date(casedata.applicationDate)).date
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
				formatDateAndTime(new Date(casedata.applicationDecisionDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue('Development type', 'Minor dwellings');

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue('What is your appeal about?', 'Full planning');
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
				formatDateAndTime(new Date(casAdvertData.applicationDate)).date
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
				'What is your appeal about?',
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

	it('CAS Advert - expedited appellant form', () => {
		cy.createCase({ ...casAdvertExpeditedData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions for CAS adverts
			assertBaseQuestions(casAdvertExpeditedData);

			// Not present
			appellantCasePage.assertFieldNotPresent('What is the area of the appeal site?');
			appellantCasePage.assertFieldNotPresent('Additional documents');

			// Advert specific site details + significant changes
			appellantCasePage.assertFieldLabelAndValue(
				'Is the appeal site on highway land?',
				casAdvertExpeditedData.advertDetails[0].isSiteOnHighwayLand ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Is the advertisement in position?',
				casAdvertExpeditedData.advertDetails[0].isAdvertInPosition ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				"Do you have the landowner's permission?",
				casAdvertExpeditedData.hasLandownersPermission ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Yes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Local plan: Local plan changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'National policy: National policy changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Court judgment: Court judgment changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Other: Other changes'
			);

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casAdvertExpeditedData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDateAndTime(new Date(casAdvertExpeditedData.applicationDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of the advertisement',
				casAdvertExpeditedData.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casAdvertExpeditedData.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(casAdvertExpeditedData.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDateAndTime(new Date(casAdvertExpeditedData.applicationDecisionDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Decision letter from the local planning authority',
				'No documents'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of the advertisement',
				'No documents'
			);

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What is your appeal about?',
				'Displaying an advertisement'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why are you appealing?',
				casAdvertExpeditedData.reasonForAppealAppellant
			);

			// Upload document labels (No appeal statement, no supporting docs)
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldNotPresent('Appeal statement');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');
			appellantCasePage.assertFieldNotPresent('Other new supporting documents');
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
				formatDateAndTime(new Date(casedata.applicationDate)).date
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
				formatDateAndTime(new Date(casedata.applicationDecisionDate)).date
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue('What is your appeal about?', 'Full planning');

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

	it('CAS Planning - expedited appellant form', () => {
		cy.createCase({ ...casPlanningExpeditedData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// Base questions
			assertBaseQuestions(casPlanningExpeditedData);

			// 1 Site details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the area of the appeal site?',
				`${casPlanningExpeditedData.siteAreaSquareMetres} m²`
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Yes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Local plan: Local plan changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'National policy: National policy changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Court judgment: Court judgment changes'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Have there been any significant changes that would affect the application?',
				'Other: Other changes'
			);

			// 2 Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				casPlanningExpeditedData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDateAndTime(new Date(casPlanningExpeditedData.applicationDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Enter the description of development that you submitted in your application',
				casPlanningExpeditedData.originalDevelopmentDescription
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				casPlanningExpeditedData.nearbyCaseReferences.length ? 'Yes' : 'No'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				capitalize(casPlanningExpeditedData.applicationDecision)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What’s the date on the decision letter from the local planning authority?​',
				formatDateAndTime(new Date(casPlanningExpeditedData.applicationDecisionDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Decision letter from the local planning authority',
				'No documents'
			);

			// 3 Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What is your appeal about?',
				'Minor commercial development'
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why are you appealing?',
				casPlanningExpeditedData.reasonForAppealAppellant
			);

			// 4 Upload docs (No appeal statement, no design & access, no supporting docs)
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue(
				'Agreement to change the description of development',
				''
			);
			appellantCasePage.assertFieldNotPresent('Appeal statement');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');
			appellantCasePage.assertFieldNotPresent('Design and access statement');
			appellantCasePage.assertFieldNotPresent('Plans, drawings and list of plans');
			appellantCasePage.assertFieldNotPresent('Other new supporting documents');

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
				formatDateAndTime(new Date(fullAdvertData.applicationDate)).date
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
				'What is your appeal about?',
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

	it('Enforcement appeal - appellant form', () => {
		cy.createCase({ ...enforcementData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// first line address and postcode are different for enforcement linked appeals, so we need to merge them with the base data blue bean
			const baseData = {
				...casedata,
				siteAddressLine1: enforcementData.siteAddressLine1,
				siteAddressPostcode: enforcementData.siteAddressPostcode
			};

			// Base questions for enforcement appeals
			assertBaseQuestions(baseData);

			// Not present
			appellantCasePage.assertFieldNotPresent('What is the area of the appeal site?');

			// Enforcement application reference number
			appellantCasePage.assertFieldLabelAndValue(
				'What is the reference number on the enforcement notice?',
				enforcementLinkedData.enforcementReference
			);

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				enforcementData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDateAndTime(new Date(enforcementData.applicationDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				enforcementData.nearbyCaseReferences
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				'Refused'
			);

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What is your appeal about?',
				'Enforcement notice'
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');

			// Grounds and facts
			const formattedGrounds = formatGroundsOfAppeal(enforcementData);
			assertGroundsOfAppeal(formattedGrounds);

			// Apppeal details
			appellantCasePage.assertFieldLabelAndValue(
				'How would you prefer us to decide your appeal?',
				capitalize(enforcementData.appellantProcedurePreference)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why would you prefer this appeal procedure?',
				enforcementData.appellantProcedurePreferenceDetails
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many days would you expect the inquiry to last?',
				enforcementData.appellantProcedurePreferenceDuration
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many witnesses would you expect to give evidence at the inquiry?',
				enforcementData.appellantProcedurePreferenceWitnessCount
			);
		});
	});

	it.only('Enforcement linked appeal - appellant form', () => {
		cy.createCase({ ...enforcementLinkedData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// first line address and postcode are different for enforcement linked appeals, so we need to merge them with the base data
			const baseData = {
				...casedata,
				siteAddressLine1: enforcementLinkedData.siteAddressLine1,
				siteAddressPostcode: enforcementLinkedData.siteAddressPostcode
			};

			// Base questions for enforcement appeals
			assertBaseQuestions(baseData, false);

			// Not present
			appellantCasePage.assertFieldNotPresent('What is the area of the appeal site?');

			// Enforcement application reference number
			appellantCasePage.assertFieldLabelAndValue(
				'What is the reference number on the enforcement notice?',
				enforcementLinkedData.enforcementReference
			);

			// Other appellants (i.e. child appeal contacts)
			appellantCasePage.assertFieldLabelAndValue(
				'Other appellants',
				formatAdditionalAppellants(enforcementLinkedData.namedIndividuals)
			);

			// Application details
			appellantCasePage.assertFieldLabelAndValue(
				'What is the application reference number?',
				enforcementLinkedData.applicationReference
			);
			appellantCasePage.assertFieldLabelAndValue(
				'What date did you submit your application?',
				formatDateAndTime(new Date(enforcementLinkedData.applicationDate)).date
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Are there other appeals linked to your development?',
				enforcementLinkedData.nearbyCaseReferences
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Was your application granted or refused?',
				'Refused'
			);

			// Appeal details
			appellantCasePage.assertFieldLabelAndValue(
				'What is your appeal about?',
				'Enforcement notice'
			);

			// Upload document labels
			appellantCasePage.assertFieldLabelAndValue('Application form', '');
			appellantCasePage.assertFieldLabelAndValue('Application for an award of appeal costs', '');

			// Grounds and facts
			const formattedGrounds = formatGroundsOfAppeal(enforcementData);
			assertGroundsOfAppeal(formattedGrounds);

			// Apppeal details
			appellantCasePage.assertFieldLabelAndValue(
				'How would you prefer us to decide your appeal?',
				capitalize(enforcementLinkedData.appellantProcedurePreference)
			);
			appellantCasePage.assertFieldLabelAndValue(
				'Why would you prefer this appeal procedure?',
				enforcementLinkedData.appellantProcedurePreferenceDetails
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many days would you expect the inquiry to last?',
				enforcementLinkedData.appellantProcedurePreferenceDuration
			);
			appellantCasePage.assertFieldLabelAndValue(
				'How many witnesses would you expect to give evidence at the inquiry?',
				enforcementLinkedData.appellantProcedurePreferenceWitnessCount
			);
		});
	});

	it('Enforcement appeal - can update grounds of appeal', () => {
		cy.createCase({ ...enforcementData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// select the change link for grounds of appeal
			appellantCasePage.selectChangeLink('grounds-for-appeal');

			// check the previously selected grounds of appeal are displayed
			groundsOfAppealPage.checkSelectedGroundsOfAppeal(enforcementData.appealGrounds);

			// select a different ground of appeal
			groundsOfAppealPage.selectGroundsOfAppeal(['a', 'b']);

			const updatedFormattedGrounds = {
				descriptionOfBreach: enforcementData.descriptionOfAllegedBreach,
				groundsList: ['b'],
				groundFacts: [
					{
						label: 'Facts for ground (b)',
						value: 'Not answered'
					}
				]
			};

			// check for success banner message
			appellantCasePage.validateBannerMessage(BANNER_TYPES.success, SUCCESS_MESSAGES.appealUpdated);

			// check the updated grounds of appeal are displayed on the appellant case page
			assertGroundsOfAppeal(updatedFormattedGrounds);

			// check case history for the updated grounds of appeal
			appellantCasePage.clickBackLink();
			caseDetailsPage.clickViewCaseHistory();
			cy.get('h1').should('contain.text', 'Case history');

			caseHistoryPage.verifyCaseHistoryValues(['Ground (a) removed', 'Ground (b) added']);
		});
	});

	it.only('Enforcement linked appeal - can update grounds of appeal', () => {
		cy.createCase({ ...enforcementLinkedData }).then((caseObj) => {
			appeal = caseObj;
			appellantCasePage.navigateToAppellantCase(caseObj);

			// select the change link for grounds of appeal
			appellantCasePage.selectChangeLink('grounds-for-appeal');

			// check the previously selected grounds of appeal are displayed
			groundsOfAppealPage.checkSelectedGroundsOfAppeal(enforcementLinkedData.appealGrounds);

			// select some different grounds of appeal
			groundsOfAppealPage.selectGroundsOfAppeal(['a', 'c', 'd']);

			const updatedFormattedGrounds = {
				descriptionOfBreach: enforcementLinkedData.descriptionOfAllegedBreach,
				groundsList: ['c', 'd'],
				groundFacts: [
					{
						label: 'Facts for ground (c)',
						value: 'Not answered'
					},
					{
						label: 'Facts for ground (d)',
						value: 'Not answered'
					}
				]
			};

			// check for success banner message
			appellantCasePage.validateBannerMessage(BANNER_TYPES.success, SUCCESS_MESSAGES.appealUpdated);

			// check the updated grounds of appeal are displayed on the appellant case page
			assertGroundsOfAppeal(updatedFormattedGrounds);

			// check case history for the updated grounds of appeal
			appellantCasePage.clickBackLink();
			caseDetailsPage.clickViewCaseHistory();
			cy.get('h1').should('contain.text', 'Case history');

			caseHistoryPage.verifyCaseHistoryValues([
				'Ground (a) removed',
				'Ground (c) added',
				'Ground (d) added'
			]);
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

	/**
	 * Takes a set of enforecment data and creates an object with information about the appeal grounds
	 * @param {*} enforcementData case data for an enforcement appeal
	 * @returns object with a list of references and facts for each appeal ground
	 */
	const formatGroundsOfAppeal = (enforcementData) => {
		let groundsList = [];

		const formattedGrounds = enforcementData.appealGrounds.map((ground) => {
			groundsList.push(ground.groundRef);
			return {
				label: `Facts for ground (${ground.groundRef})`,
				value: ground.factsForGround
			};
		});

		return {
			descriptionOfBreach: enforcementData.descriptionOfAllegedBreach,
			groundsList,
			groundFacts: formattedGrounds
		};
	};

	const formatAdditionalAppellants = (appellantData) => {
		const appellants = appellantData.map((appellant) => {
			return `${appellant.firstName} ${appellant.lastName}`;
		});

		return appellants.join('');
	};

	const assertGroundsOfAppeal = (formattedGrounds) => {
		// description of the alleged breach and grounds of appeal
		appellantCasePage.assertFieldLabelAndValue(
			'Description of the alleged breach',
			formattedGrounds.descriptionOfBreach
		);

		// list of grounds of appeal
		appellantCasePage.assertFieldLabelAndValue(
			'Grounds of appeal',
			formattedGrounds.groundsList.join('')
		);

		// facts for each ground of appeal
		formattedGrounds.groundFacts.forEach((groundFact) => {
			appellantCasePage.assertFieldLabelAndValue(groundFact.label, groundFact.value);
		});

		// check that are not displaying rows for any other grounds of appeal
		const allGrounds = groundsOfAppealPage.getAllGroundsOfAppeal();
		const otherGrounds = allGrounds.filter(
			(ground) => !formattedGrounds.groundsList.includes(ground)
		);

		cy.writeLog(`Other grounds of appeal that should not be displayed: ${otherGrounds.join(', ')}`);

		otherGrounds.forEach((ground) => {
			appellantCasePage.assertFieldNotPresent(`Facts for ground (${ground})`);
			appellantCasePage.assertFieldNotPresent(`Ground (${ground}) supporting documents`);
		});
	};

	const assertBaseQuestions = (submissionType, includeLandOwnershipQuestions = true) => {
		// Before you start
		appellantCasePage.assertFieldLabelAndValue(
			'Local planning authority',
			'System Test Borough Council'
		);

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
			'Will an inspector need to access your land or property?',
			submissionType.siteAccessDetails[0]
		);
		appellantCasePage.assertFieldLabelAndValue(
			'Are there any health and safety issues on the appeal site?',
			submissionType.siteSafetyDetails[0]
		);

		// land ownership questions, are not applicable for some appeal types (e.g. CAS adverts, enforcement appeals)
		if (includeLandOwnershipQuestions) {
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
		}
	};
});
