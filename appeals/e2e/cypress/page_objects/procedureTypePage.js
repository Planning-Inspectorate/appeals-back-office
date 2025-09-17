import { CaseDetailsPage } from './caseDetailsPage.js';

export class ProcedureTypePage extends CaseDetailsPage {
	procedureTypeElements = {
		...this.elements, // Inherit parent elements
		written: () => cy.get('#appeal-procedure'),
		hearing: () => cy.get('#appeal-procedure-2'),
		inquiry: () => cy.get('#appeal-procedure-3')
	};

	procedureTypeMappings = {
		written: {
			element: this.procedureTypeElements.written,
			displayName: 'Written representations',
			value: 'written'
		},
		hearing: {
			element: this.procedureTypeElements.hearing,
			displayName: 'Hearing',
			value: 'hearing'
		},
		inquiry: {
			element: this.procedureTypeElements.inquiry,
			displayName: 'Inquiry',
			value: 'inquiry'
		}
	};

	procedureTypeExists(label) {
		const normalizedLabel = label.toLowerCase().trim();
		return Object.prototype.hasOwnProperty.call(this.procedureTypeMappings, normalizedLabel);
	}

	/**
	 * Selects a procedure type and continues
	 * @param {string} label - The procedure type to select (case-insensitive)
	 * @throws {Error} If the procedure type is not found
	 */
	selectProcedureType(label) {
		const normalizedLabel = label.toLowerCase().trim();

		if (!this.procedureTypeExists(normalizedLabel)) {
			const availableOptions = this.getAvailableProcedureTypes().join(', ');
			throw new Error(
				`Procedure type "${label}" not found. Available options: ${availableOptions}`
			);
		}

		const mapping = this.procedureTypeMappings[normalizedLabel];

		// Click and verify it's checked with value validation
		mapping.element().click().should('be.checked').and('have.value', mapping.value);

		this.clickButtonByText('Continue');
		cy.log(`Selected procedure type: ${mapping.displayName}`);
	}

	getAvailableProcedureTypes() {
		return Object.values(this.procedureTypeMappings).map((mapping) => mapping.displayName);
	}

	verifyHeader(sectionHeader) {
		this.elements.getAppealRefCaseDetails().should('contain.text', sectionHeader);
	}
}
