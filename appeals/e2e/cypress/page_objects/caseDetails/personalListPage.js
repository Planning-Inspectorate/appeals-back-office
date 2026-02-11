export class PersonalListPage {
	selectors = {
		link: '.govuk-link'
	};

	verifyActionRequiredLink(caseObj, expectedLinkText) {
		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.within(() => {
				cy.contains('a.govuk-link', expectedLinkText).should('be.visible');
			});
	}
}
