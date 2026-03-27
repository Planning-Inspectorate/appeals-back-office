import { CaseDetailsPage } from './caseDetailsPage.js';

export class ProcedureTypePage extends CaseDetailsPage {
	procedureTypeElements = {
		...this.elements, // Inherit parent elements
		written: () => cy.get('#appeal-procedure'),
		hearing: () => cy.get('#appeal-procedure-2'),
		inquiry: () => cy.get('#appeal-procedure-3'),
		'part 1': () => cy.get('#appeal-procedure-4')
	};

	procedureTypeMappings = {
		part1: {
			element: () => cy.get('#appeal-procedure'),
			displayName: 'Part 1',
			value: 'writtenPart1'
		},
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
		},
		'part 1': {
			element: this.procedureTypeElements['part 1'],
			displayName: 'Part 1',
			value: 'part 1'
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

	verifyHeader(procedureTypeCaption) {
		this.elements.getAppealRefCaseDetails().should('contain.text', procedureTypeCaption);
	}

	verifyNoProcedureTypeSelected(part1 = true, linkedCase = false) {
		if (part1) {
			this.procedureTypeMappings.part1.element().should('not.be.checked');
		}

		this.procedureTypeMappings.written.element().should('not.be.checked');

		if (!linkedCase) {
			this.procedureTypeMappings.hearing.element().should('not.be.checked');
			this.procedureTypeMappings.inquiry.element().should('not.be.checked');
		}
	}
}
