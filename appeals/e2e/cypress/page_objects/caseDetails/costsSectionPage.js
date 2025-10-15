// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';

export class CostsSectionPage extends CaseDetailsPage {
	costsSectionElements = {
		...this.elements, // Inherit parent elements

		//row titles
		appellantApplication: () =>
			cy.get('.govuk-table__row .appeal-costs-appellant-application-documentation'),
		appellantWithdrawal: () =>
			cy.get('.govuk-table__row .appeal-costs-appellant-withdrawal-documentation'),
		appellantCorrespondence: () =>
			cy.get('.govuk-table__row .appeal-costs-appellant-correspondence-documentation'),
		lpaApplication: () => cy.get('.govuk-table__row .appeal-costs-lpa-application-documentation'),
		lpaWithdrawal: () => cy.get('.govuk-table__row .appeal-costs-lpa-withdrawal-documentation'),
		lpaCorrespondence: () =>
			cy.get('.govuk-table__row .appeal-costs-lpa-correspondence-documentation')
	};

	expectedValues = {
		appellantApplication: 'Appellant application',
		appellantWithdrawal: 'Appellant withdrawal',
		appellantCorrespondence: 'Appellant correspondence',
		lpaApplication: 'LPA application',
		lpaWithdrawal: 'LPA withdrawal',
		lpaCorrespondence: 'LPA correspondence'
	};

	verifyCostsDetails = (expectedValues) => {
		// verify costs fields
		this.costsSectionElements
			.appellantApplication()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.appellantApplication);
			});
		this.costsSectionElements
			.appellantWithdrawal()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.appellantWithdrawal);
			});
		this.costsSectionElements
			.appellantCorrespondence()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.appellantCorrespondence);
			});

		this.costsSectionElements
			.lpaApplication()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.lpaApplication);
			});
		this.costsSectionElements
			.lpaWithdrawal()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.lpaWithdrawal);
			});
		this.costsSectionElements
			.lpaCorrespondence()
			.invoke('prop', 'innerText')
			.then((text) => {
				expect(text).to.equal(this.expectedValues.lpaCorrespondence);
			});
	};
}
