// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { ContactsSectionPage } from '../../page_objects/caseDetails/contactsSectionPage.js';
import { CostsSectionPage } from '../../page_objects/caseDetails/costsSectionPage';
import { DocumentationSectionPage } from '../../page_objects/caseDetails/documentationSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { ContactDetailsPage } from '../../page_objects/contactDetailsPage.js';
import { CyaPoePage } from '../../page_objects/CYApage/POE/cyaPoePage';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { FileUploaderSection } from '../../page_objects/fileUploadSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { RedactionStatusPage } from '../../page_objects/redactionStatusPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';
import { formatDateAndTime } from '../../support/utils/format';

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
const caseHistoryPage = new CaseHistoryPage();
const cyaPoePage = new CyaPoePage();

const rule6Details = {
	partyName: 'TestRuleSixParty',
	partyEmailAddress: 'testrule6party@test.com',
	partyNameUpdated: 'TestRuleSixPartyUpdated',
	partyEmailAddressUpdated: 'testrule6partyupdated@test.com'
};

const rule6Party = {
	serviceUser: {
		organisationName: 'Rule Six Locals Consortium',
		email: 'rule6locals@test.com'
	}
};

let caseObj;
let appeal;

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
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${organisationName1} proof of evidence and witness`,
		'Awaiting proof of evidence and witness'
	);
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${organisationName2} proof of evidence and witness`,
		'Awaiting proof of evidence and witness'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName1} application`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName1} withdrawal`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName1} correspondence`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName2} application`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName2} withdrawal`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName2} correspondence`,
		'No documents available'
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
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${organisationName} proof of evidence and witness`,
		'Awaiting proof of evidence and witness'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName} application`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName} withdrawal`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${organisationName} correspondence`,
		'No documents available'
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
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${rule6Details.partyNameUpdated} proof of evidence and witness`,
		'Awaiting proof of evidence and witness'
	);

	// Verify rule 6 party on details page - Cost section
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${rule6Details.partyNameUpdated} application`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${rule6Details.partyNameUpdated} withdrawal`,
		'No documents available'
	);
	caseDetailsPage.verifyDocumentationValue(
		'costs',
		'Status',
		`${rule6Details.partyNameUpdated} correspondence`,
		'No documents available'
	);
});

let sampleFiles = caseDetailsPage.sampleFiles;
it('add a rule 6 POE', () => {
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
		`${organisationName} proof of evidence and witnesses added`
	);
});

it.only('should mark rule 6 POE complete', () => {
	setupCaseForRule6StatementReview();
	cy.simulateStatementsDeadlineElapsed(caseObj);
	cy.shareCommentsAndStatementsViaApi(caseObj);

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.addRepresentation(caseObj, 'rule6ProofOfEvidence', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} proof of evidence and witnesses awaiting review`
		);

		// Complete the evidence review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-proof-of-evidence');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		cyaPoePage.checkPageContent(caseObj.reference, rule6Party.serviceUser.organisationName);

		// change procedure
		caseDetailsPage.clickChangeLinkByLabel('Proof of evidence and witnesses');
		caseDetailsPage.clickBackLink();
		caseDetailsPage.clickChangeLinkByLabel('Review decision');
		caseDetailsPage.selectRadioButtonByValue('Mark as incomplete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.chooseCheckboxByText('Supporting documents missing');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickChangeLinkByLabel('Review decision');
		caseDetailsPage.selectRadioButtonByValue('Complete');
		caseDetailsPage.clickButtonByText('Continue');
		cyaSection.verifyAnswerUpdated({
			field: 'Review decisions',
			value: 'Accept proof of evidence and witnesses'
		});

		caseDetailsPage.clickButtonByText(
			`${rule6Party.serviceUser.organisationName} proof of evidence and witnesses`
		);

		// Todo: Bug - Rule 6 POE success banner shows generic 'Rule 6 party' text instead of the party name (A2-6823)
		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} proof of evidence and witnesses accepted`
		);
	});

	// Check Rule 6 POE status (Complete) - Documentation section
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${rule6Party.serviceUser.organisationName} proof of evidence and witness`,
		'Completed'
	);

	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Date',
		`${rule6Party.serviceUser.organisationName} proof of evidence and witness`,
		formatDateAndTime(new Date()).date
	);
});

it('should mark rule 6 POE incomplete', () => {
	setupCaseForRule6StatementReview();
	cy.simulateStatementsDeadlineElapsed(caseObj);
	cy.shareCommentsAndStatementsViaApi(caseObj);

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.addRepresentation(caseObj, 'rule6ProofOfEvidence', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} proof of evidence and witnesses awaiting review`
		);

		// Complete the evidence review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-proof-of-evidence');
		caseDetailsPage.selectRadioButtonByValue('Mark as incomplete');
		caseDetailsPage.clickButtonByText('Continue');

		caseDetailsPage.chooseCheckboxByText('Supporting documents missing');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm statement is incomplete');

		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} proof of evidence incomplete`
		);
	});

	// Check Rule 6 POE status (incomplete) - Documentation section
	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Status',
		`${rule6Party.serviceUser.organisationName} proof of evidence and witness`,
		'Incomplete'
	);

	caseDetailsPage.verifyDocumentationValue(
		'documentation',
		'Date',
		`${rule6Party.serviceUser.organisationName} proof of evidence and witness`,
		formatDateAndTime(new Date()).date
	);
});

it('should show correct history when statement is accepted', () => {
	setupCaseForRule6StatementReview();

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.log(`Service User ID: ${serviceUserId}`);

		cy.addRepresentation(caseObj, 'rule6PartyStatement', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} statement awaiting review`
		);

		// Complete the statement review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-statement');
		caseDetailsPage.selectRadioButtonByValue('Accept statement');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept statement');

		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} statement accepted`
		);

		// Check Rule 6 Statement status (Accepted) - Documentation section
		caseDetailsPage.verifyDocumentationValue(
			'documentation',
			'Status',
			`${rule6Party.serviceUser.organisationName} statement`,
			'Accepted'
		);

		// Verify Case History
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValue(
			`${rule6Party.serviceUser.organisationName} statement accepted`
		);
	});
});

it('should show correct history when statement is redacted and accepted', () => {
	setupCaseForRule6StatementReview();

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.log(`Service User ID: ${serviceUserId}`);

		cy.addRepresentation(caseObj, 'rule6PartyStatement', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} statement awaiting review`
		);

		// Complete the statement review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-statement');
		caseDetailsPage.selectRadioButtonByValue('Redact and accept statement');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Accept statement');

		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} statement accepted`
		);

		// Check Rule 6 Statement status (Accepted and Redacted) - Documentation section
		caseDetailsPage.verifyDocumentationValue(
			'documentation',
			'Status',
			`${rule6Party.serviceUser.organisationName} statement`,
			'Accepted'
		);

		// Verify Case History
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValue(
			`${rule6Party.serviceUser.organisationName} statement redacted and accepted`
		);
	});
});

it('should show correct history when statement is incomplete without resubmit', () => {
	setupCaseForRule6StatementReview();

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.log(`Service User ID: ${serviceUserId}`);

		cy.addRepresentation(caseObj, 'rule6PartyStatement', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} statement awaiting review`
		);

		// Complete the statement review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-statement');
		caseDetailsPage.selectRadioButtonByValue('Statement incomplete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.chooseCheckboxByText('No list of suggested conditions');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('No');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm statement is incomplete');

		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} statement is incomplete`
		);

		// Check Rule 6 Statement status (Incomplete) - Documentation section
		caseDetailsPage.verifyDocumentationValue(
			'documentation',
			'Status',
			`${rule6Party.serviceUser.organisationName} statement`,
			'Incomplete'
		);

		// Verify Case History
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValue(
			`${rule6Party.serviceUser.organisationName} statement incomplete`
		);
	});
});

it('should show correct history when statement is incomplete with resubmit', () => {
	setupCaseForRule6StatementReview();

	cy.getRule6ServiceUserId(caseObj, rule6Party.serviceUser.email).then((serviceUserId) => {
		cy.log(`Service User ID: ${serviceUserId}`);

		cy.addRepresentation(caseObj, 'rule6PartyStatement', serviceUserId);
		cy.reload();

		caseDetailsPage.validateBannerMessage(
			'Important',
			`${rule6Party.serviceUser.organisationName} statement awaiting review`
		);

		// Complete the statement review workflow for Rule 6
		documentationSectionPage.navigateToAddProofOfEvidenceReview('rule-6-statement');
		caseDetailsPage.selectRadioButtonByValue('Statement incomplete');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.chooseCheckboxByText('No list of suggested conditions');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.selectRadioButtonByValue('Yes');
		caseDetailsPage.clickButtonByText('Continue');
		caseDetailsPage.clickButtonByText('Confirm statement is incomplete');

		caseDetailsPage.validateBannerMessage(
			'Success',
			`${rule6Party.serviceUser.organisationName} statement is incomplete`
		);

		// Check Rule 6 Statement status (Incomplete) - Documentation section
		caseDetailsPage.verifyDocumentationValue(
			'documentation',
			'Status',
			`${rule6Party.serviceUser.organisationName} statement`,
			'Incomplete'
		);

		// Verify Case History
		caseDetailsPage.clickViewCaseHistory();
		caseHistoryPage.verifyCaseHistoryValue(
			`${rule6Party.serviceUser.organisationName} statement incomplete`
		);
		caseHistoryPage.verifyCaseHistoryValue(
			`${rule6Party.serviceUser.organisationName} statement due date extended`
		);
	});
});

const setupCaseForRule6StatementReview = () => {
	cy.addAllocationLevelAndSpecialisms(caseObj);
	cy.addLpaqSubmissionToCase(caseObj);
	cy.reviewLpaqSubmission(caseObj);

	// Add & Review statement & IP comment Via Api
	cy.addRepresentation(caseObj, 'lpaStatement', null);
	cy.reviewStatementViaApi(caseObj);

	cy.addRule6Party(caseObj, rule6Party);
};
