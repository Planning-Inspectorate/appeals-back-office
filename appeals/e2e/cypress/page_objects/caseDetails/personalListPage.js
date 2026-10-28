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

	verifyTagOnPersonalListPage(caseObj, expectedTagText) {
		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.find('.govuk-tag')
			.last()
			.should('have.text', expectedTagText);
	}

	verifyDueDate(caseObj, expectedDate) {
		const formatted = new Date(expectedDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});

		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.within(() => {
				cy.get('td:nth-child(4)').should('contain.text', formatted);
			});
	}

	verifyActionRequiredText(caseObj, expectedText) {
		cy.get(this.selectors.link)
			.contains(caseObj)
			.parents('tr')
			.within(() => {
				cy.get('td:nth-child(3)').should('contain.text', expectedText);
			});
	}
}
