// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { ContactsSectionPage } from '../../page_objects/caseDetails/contactsSectionPage.js';
import { CostsSectionPage } from '../../page_objects/caseDetails/costsSectionPage';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ContactDetailsPage } from '../../page_objects/contactDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { FileUploaderSection } from '../../page_objects/fileUploadSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { RedactionStatusPage } from '../../page_objects/redactionStatusPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();
const cyaSection = new CYASection();
const contactsSectionPage = new ContactsSectionPage();
const contactDetailsPage = new ContactDetailsPage();
const rule6PartyContact = appealsApiRequests.rule6Party.serviceUser;
const documentationSectionPage = new DocumentationSectionPage();
const costsSectionPage = new CostsSectionPage();
const fileUploaderSection = new FileUploaderSection();
const redactionStatusPage = new RedactionStatusPage();
const dateTimeSection = new DateTimeSection();

const rule6Details = {
	partyName: 'TestRuleSixParty',
	partyEmailAddress: 'testrule6party@test.com',
	partyNameUpdated: 'TestRuleSixPartyUpdated',
	partyEmailAddressUpdated: 'testrule6partyupdated@test.com'
};

let caseObj;

const setupTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W', planningObligation: true }).then((ref) => {
		caseObj = ref;
		appeal = caseObj;
		happyPathHelper.viewCaseDetails(caseObj);

		// Assign Case Officer Via API
		cy.assignCaseOfficerViaApi(caseObj);

		// Validate Appeal Via API
		cy.getBusinessActualDate(new Date(), 0).then((date) => {
			cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
		});

		// Start Inquiry Via API
		cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
			cy.addInquiryViaApi(caseObj, inquiryDate);
		});
		cy.reload();
	});
};
beforeEach(() => {
	setupTestCase();
});

let appeal;

afterEach(() => {
	cy.deleteAppeals(appeal);
});
it('Can add rule 6 party', () => {
	// find case and open inquiry section
	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseObj);

	// select to add rule 6 contact
	contactsSectionPage.selectAddContact('rule-6-party-contact-details');

	// check page caption and input party name
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
	contactDetailsPage.inputOrganisationName(rule6Details.partyName);
	contactDetailsPage.clickButtonByText('Continue');

	// check page caption and enter party email address
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
	contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddress);
	contactDetailsPage.clickButtonByText('Continue');

	// verify details on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyName,
		value: rule6Details.partyName
	});
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
		value: rule6Details.partyEmailAddress
	});

	// update party name
	cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyName);
	contactDetailsPage.verifyValuePrepopulated(
		contactDetailsPage.contactSelectors.organisationName,
		rule6Details.partyName
	);
	contactDetailsPage.inputOrganisationName(rule6Details.partyNameUpdated);
	contactDetailsPage.clickButtonByText('Continue');
	contactDetailsPage.clickButtonByText('Continue');

	// verify party name updated on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyName,
		value: rule6Details.partyNameUpdated
	});

	// update party email
	cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyEmailAddress);
	contactDetailsPage.verifyValuePrepopulated(
		contactDetailsPage.contactSelectors.organisationEmail,
		rule6Details.partyEmailAddress
	);
	contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddressUpdated);
	contactDetailsPage.clickButtonByText('Continue');

	// verify party email address updated on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
		value: rule6Details.partyEmailAddressUpdated
	});

	// click add Rule 6 party and check sucess banner is visible
	cyaSection.clickButtonByText('Add rule 6 party');
	caseDetailsPage.validateBannerMessage('Success', 'Rule 6 party added');

	// verify contact section
	contactsSectionPage.verifyContactsSectionHeadingIsDisplayed();
	contactsSectionPage.verifyContactsSectionRule6PartiesIsDisplayed(
		rule6Details.partyNameUpdated,
		rule6Details.partyEmailAddressUpdated
	);

	// verify documentation section
	documentationSectionPage.verifyDocumentationSectionHeadingIsDisplayed();
	documentationSectionPage.verifyDocumentationSectionRule6PartiesIsDisplayed(
		rule6Details.partyNameUpdated
	);

	//verify costs section
	costsSectionPage.verifyCostsSectionHeadingIsDisplayed();
	costsSectionPage.verifyCostsSectionRule6PartiesIsDisplayed(rule6Details.partyNameUpdated);
});

it('Validates rule 6 party name and email address', () => {
	// find case and open inquiry section
	cy.visit(urlPaths.appealsList);
	listCasesPage.clickAppealByRef(caseObj);

	// select to add rule 6 contact
	contactsSectionPage.selectAddContact('rule-6-party-contact-details');

	// proceeed without entering name
	contactDetailsPage.clickButtonByText('Continue');

	// check error messge displayed
	contactDetailsPage.verifyErrorMessages({
		messages: ['Enter a Rule 6 party name'],
		fields: ['organisation-name']
	});

	// proceed without entering party email address
	contactDetailsPage.inputOrganisationName(rule6Details.partyName);
	contactDetailsPage.clickButtonByText('Continue');
	contactDetailsPage.clickButtonByText('Continue');

	// check error messge displayed
	contactDetailsPage.verifyErrorMessages({
		messages: ['Enter a Rule 6 party email address'],
		fields: ['email']
	});
});

it('should add multiple rule 6 party contact', () => {
	// Add rule 6 contact via API
	cy.addRule6Party(caseObj);

	// select to add rule 6 contact
	contactsSectionPage.selectAddContact('rule-6-party-contact-details');

	// check page caption and input party name
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
	contactDetailsPage.inputOrganisationName(rule6Details.partyName);
	contactDetailsPage.clickButtonByText('Continue');

	// check page caption and enter party email address
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Add rule 6 party`);
	contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddress);
	contactDetailsPage.clickButtonByText('Continue');

	// verify details on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyName,
		value: rule6Details.partyName
	});
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
		value: rule6Details.partyEmailAddress
	});

	contactDetailsPage.clickButtonByText('Add rule 6 party');

	// check success banner
	caseDetailsPage.validateBannerMessage('Success', 'Rule 6 party added');

	const organisationName1 = rule6PartyContact.organisationName;
	const organisationName2 = rule6Details.partyName;

	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', organisationName1);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6PartyContact.email);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', organisationName2);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6Details.partyEmailAddress);

	// Verify rule 6 party on details page - Documentation section
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName1} proof of evidence and witness`,
		'Awaiting proof of evidence and witness',
		'documentation'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName2} proof of evidence and witness`,
		'Awaiting proof of evidence and witness',
		'documentation'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName1} application`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName1} withdrawal`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName1} correspondence`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName2} application`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName2} withdrawal`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName2} correspondence`,
		'No documents available',
		'costs'
	);

	// Manage contact details
	contactsSectionPage.manageRule6PartyContactDetails();
	contactDetailsPage.verifyCheckYourAnswers(organisationName1, rule6PartyContact.email);
	contactDetailsPage.verifyCheckYourAnswers(organisationName2, rule6Details.partyEmailAddress);
});

it('should remove a rule 6 party contact and related documents', () => {
	// Verify no rule 6 party is added
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', 'No rule 6 party');

	// Add rule 6 contact via API
	cy.addRule6Party(caseObj);

	// Verify rule 6 party on details page - Contact section
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6PartyContact.email);
	const organisationName = rule6PartyContact.organisationName;
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', organisationName);

	// Verify rule 6 party on details page - Documentation section
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName} proof of evidence and witness`,
		'Awaiting proof of evidence and witness',
		'documentation'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName} application`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName} withdrawal`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${organisationName} correspondence`,
		'No documents available',
		'costs'
	);

	// Remove rule 6 party
	contactsSectionPage.manageRule6PartyContactDetails();
	contactsSectionPage.removeRule6PartyContactDetails();
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - remove rule 6 party`);
	contactDetailsPage.checkHeading(`Confirm you want to remove ${organisationName}`);
	contactDetailsPage.clickButtonByText('Confirm and remove rule 6 party');

	// Check success banner
	caseDetailsPage.validateBannerMessage('Success', 'Rule 6 party removed');

	// Verify rule 6 party contact is removed
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', 'No rule 6 party');

	// Verify documents do not exist
	caseDetailsPage.verifyDocumentDoesNotExist(
		`${organisationName} proof of evidence and witness`,
		'documentation'
	);
	caseDetailsPage.verifyDocumentDoesNotExist(`${organisationName} application`, 'costs');
	caseDetailsPage.verifyDocumentDoesNotExist(`${organisationName} withdrawal`, 'costs');
	caseDetailsPage.verifyDocumentDoesNotExist(`${organisationName} correspondence`, 'costs');
});

it('should change rule 6 party contact', () => {
	// Add rule 6 contact via API
	cy.addRule6Party(caseObj);

	contactsSectionPage.manageRule6PartyContactDetails();
	contactsSectionPage.changeRule6PartyContactDetails();

	// check page caption and input party name
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Update rule 6 party`);
	contactDetailsPage.inputOrganisationName(rule6Details.partyName);
	contactDetailsPage.clickButtonByText('Continue');

	// check page caption and enter party email address
	contactDetailsPage.verifyPageCaption(`Appeal ${caseObj.reference} - Update rule 6 party`);
	contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddress);
	contactDetailsPage.clickButtonByText('Continue');

	// verify details on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyName,
		value: rule6Details.partyName
	});
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
		value: rule6Details.partyEmailAddress
	});

	// update party name
	cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyName);
	contactDetailsPage.verifyValuePrepopulated(
		contactDetailsPage.contactSelectors.organisationName,
		rule6Details.partyName
	);

	contactDetailsPage.inputOrganisationName(rule6Details.partyNameUpdated);
	contactDetailsPage.clickButtonByText('Continue');
	contactDetailsPage.clickButtonByText('Continue');

	// verify party name updated on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyName,
		value: rule6Details.partyNameUpdated
	});

	// update party email
	cyaSection.changeAnswer(cyaSection.cyaSectionFields.rule6PartyEmailAddress);
	contactDetailsPage.verifyValuePrepopulated(
		contactDetailsPage.contactSelectors.organisationEmail,
		rule6Details.partyEmailAddress
	);
	contactDetailsPage.inputOrganisationEmail(rule6Details.partyEmailAddressUpdated);
	contactDetailsPage.clickButtonByText('Continue');

	// verify party email address updated on cya page
	cyaSection.verifyAnswerUpdated({
		field: cyaSection.cyaSectionFields.rule6PartyEmailAddress,
		value: rule6Details.partyEmailAddressUpdated
	});

	contactDetailsPage.clickButtonByText('Change rule 6 party');

	// check success banner
	caseDetailsPage.validateBannerMessage('Success', 'Rule 6 party updated');

	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6Details.partyEmailAddressUpdated);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6Details.partyEmailAddressUpdated);

	// Verify rule 6 party on details page - Documentation section
	caseDetailsPage.verifyDocumentStatus(
		`${rule6Details.partyNameUpdated} proof of evidence and witness`,
		'Awaiting proof of evidence and witness',
		'documentation'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentStatus(
		`${rule6Details.partyNameUpdated} application`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${rule6Details.partyNameUpdated} withdrawal`,
		'No documents available',
		'costs'
	);
	caseDetailsPage.verifyDocumentStatus(
		`${rule6Details.partyNameUpdated} correspondence`,
		'No documents available',
		'costs'
	);
});

let sampleFiles = caseDetailsPage.sampleFiles;
it.only('add a rule 6 POE', () => {
	// Verify no rule 6 party is added
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', 'No rule 6 party');

	// Add rule 6 contact via API
	cy.addRule6Party(caseObj);

	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6PartyContact.email);
	const organisationName = rule6PartyContact.organisationName;
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', organisationName);

	documentationSectionPage.selectAddDocument('rule-6-party-proofs-evidence');

	caseDetailsPage.checkHeading('Upload new proof of evidence and witnesses document');
	fileUploaderSection.uploadFile(sampleFiles.document);
	caseDetailsPage.clickButtonByText('Continue');

	caseDetailsPage.checkHeading('Redaction status');
	redactionStatusPage.selectRedactionOption('noRedactionRequired');
	caseDetailsPage.clickButtonByText('Continue');

	caseDetailsPage.checkHeading('Received date');
	dateTimeSection.checkDateIsPrefilled();
	caseDetailsPage.clickButtonByText('Continue');

	caseDetailsPage.checkHeading(
		`Check details and add ${organisationName} proof of evidence and witnesses`
	);
	cyaSection.clickButtonByText(`Add ${organisationName} proof of evidence and witnesses`);

	caseDetailsPage.validateBannerMessage(
		'Success',
		'Rule 6 party proof of evidence and witnesses added'
	);
});
