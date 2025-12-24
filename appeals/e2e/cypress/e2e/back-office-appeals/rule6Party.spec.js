// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { ContactsSectionPage } from '../../page_objects/caseDetails/contactsSectionPage.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { ContactDetailsPage } from '../../page_objects/contactDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { ListCasesPage } from '../../page_objects/listCasesPage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { urlPaths } from '../../support/urlPaths';

const caseDetailsPage = new CaseDetailsPage();
const listCasesPage = new ListCasesPage();
const cyaSection = new CYASection();
const contactsSectionPage = new ContactsSectionPage();
const contactDetailsPage = new ContactDetailsPage();
const rule6PartyContact = appealsApiRequests.rule6Party.serviceUser;

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

	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6Details.partyEmailAddress);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6Details.partyName);

	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6PartyContact.email);
	caseDetailsPage.verifyCheckYourAnswers('Rule 6 parties', rule6PartyContact.organisationName);

	// Manage contact details
	contactsSectionPage.manageContactDetails();
	contactDetailsPage.verifyCheckYourAnswers(rule6Details.partyName, rule6Details.partyEmailAddress);
	contactDetailsPage.verifyCheckYourAnswers(
		rule6PartyContact.organisationName,
		rule6PartyContact.email
	);
});
