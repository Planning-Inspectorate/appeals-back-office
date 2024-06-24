// @ts-nocheck
import { Page } from './basePage';
export class ProjectTeamPage extends Page {
	elements = {
		addTeamMember: () => cy.get('a[class="govuk-button govuk-!-margin-top-6"]'), // TODO Change to use specific data-cy selector
		searchTeamMember: () => cy.get('#query'),
		searchTeamMemberButton: () => cy.get('.govuk-button'),
		invalidSearchResults: () => cy.get('p[class="govuk-body font-weight--700"]'), // TODO Change to use specific data-cy selector
		searchResultsWithOutinput: () => cy.get('#query-error'),
		actionAdded: () => cy.get('td.govuk-table__cell:nth-child(3)'), // TODO Change to use specific data-cy selector
		actionSelect: () => cy.get("td[class='govuk-table__cell'] a[class='govuk-link']"), // TODO Change to use specific data-cy selector
		selectRole: () => cy.get('#role'),
		saveAndReturn: () => cy.get('button.govuk-button:nth-child(2)'), // TODO Change to use specific data-cy selector
		caseManager: () => cy.get('td.govuk-table__cell:nth-child(1) > strong:nth-child(1)'), // TODO Change to use specific data-cy selector
		validateInvalidSearchResults: () => cy.get('h2.govuk-body'), // TODO Change to use specific data-cy selector
		invalidSearchCount: () => cy.get('p.govuk-body:nth-child(3)'), // TODO Change to use specific data-cy selector
		errorMessageForSearch: () => cy.get('#query-error'),
		selectOperationsManagerRole: () => cy.get('#role-10'),
		changeRoleLink: () => cy.get('a[class="govuk-link govuk-!-margin-right-3"]'), // TODO Change to use specific data-cy selector
		removeTeamRoleLink: () => cy.get('tbody tr:nth-child(1) td:nth-child(3) a:nth-child(2)'), // TODO Change to use specific data-cy selector
		updateProjectTeam: () =>
			cy.get('div.govuk-grid-column-full:nth-child(2) > div:nth-child(5) > a:nth-child(2)'), // TODO Change to use specific data-cy selector
		teamRemovedHeading: () => cy.get('.govuk-notification-banner__heading') // TODO Change to use specific data-cy selector
	};

	searchTeamMemberByEmail(email) {
		this.elements.searchTeamMember().type(email);
		this.elements.searchTeamMemberButton().click();
	}
	verifyTeamMemberIsAdded() {
		this.elements.actionAdded().contains('Added');
	}
	addTeamMeber(email) {
		this.elements.searchTeamMember().type(email);
		this.elements.searchTeamMemberButton().click();
		this.elements.actionSelect().click();
		this.elements.selectRole().click();
		this.elements.saveAndReturn().click();
	}
	verifyCaseManagerRoleAdded() {
		this.elements.caseManager().contains('Case Manager');
	}
	verifyInvalidSearchResultsMessageAndCount() {
		this.elements.validateInvalidSearchResults().contains('There are no matching results');
		this.elements.invalidSearchCount().contains('0 results');
	}
	validateMultipleSearchCount() {
		cy.get('.govuk-body').then((list) => {
			cy.log(list.length);
			expect(list).to.not.equal(0);
		});
	}
	validateErrorMessageWithoutEnteringAnything() {
		this.elements.searchTeamMemberButton().click();
		this.elements.errorMessageForSearch().contains('Enter a search term');
	}
	verifyRoleChangedToOperationsManager() {
		this.elements.changeRoleLink().click();
		this.elements.selectOperationsManagerRole().click();
		this.elements.saveAndReturn().click();
		this.elements.caseManager().contains('Operations Manager');
	}
	clickOnProjectTeamLink() {
		this.elements.updateProjectTeam().click();
	}
	verifyTeamRoleIsRemoved() {
		this.elements.removeTeamRoleLink().click();
		this.elements.searchTeamMemberButton().click();
		this.elements.teamRemovedHeading().contains('Team member removed');
	}
}
