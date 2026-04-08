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

	verifyActionRequiredText(caseObj, expectedText) {
		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.within(() => {
				cy.get('td').contains(expectedText).should('be.visible');
			});
	}
}
