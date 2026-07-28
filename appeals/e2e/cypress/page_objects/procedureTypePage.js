// @ts-nocheck
/// <reference types="cypress"/>

import { CaseDetailsPage } from './caseDetailsPage.js';

export class ProcedureTypePage extends CaseDetailsPage {
	procedureTypeElements = {
		...this.elements, // Inherit parent elements
		written: () => cy.get('#appeal-procedure'),
		hearing: () => cy.get('#appeal-procedure-2'),
		inquiry: () => cy.get('#appeal-procedure-3'),
		part1: () => cy.get('#appeal-procedure-4')
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
		},
		writtenpart2: {
			element: this.procedureTypeElements.written,
			displayName: 'Written representations (Part 2)',
			value: 'written'
		},
		writtenpart1: {
			element: this.procedureTypeElements.part1,
			displayName: 'Written representations (Part 1)',
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

	getNumberOfExpectedVisibleProcedureTypes(expectedProcedureTypes) {
		return expectedProcedureTypes.filter((type) => type.visible).length;
	}

	verifyHeader(procedureTypeCaption) {
		this.elements.getAppealRefCaseDetails().should('contain.text', procedureTypeCaption);
	}

	verifyDisplayedProcedureTypes(expectedProcedureTypes) {
		const availableOptions = this.getAvailableProcedureTypes().join(', ');

		// verify number of radio options displayed matches number of expected procedure types
		const expectedVisibleCount =
			this.getNumberOfExpectedVisibleProcedureTypes(expectedProcedureTypes);
		this.validateNumberOfRadioBtn(expectedVisibleCount);

		// verify each expected procedure type is displayed or not based on the visible property
		expectedProcedureTypes.forEach((procedureType) => {
			const normalizedType = procedureType.name.toLowerCase().trim();
			if (this.procedureTypeExists(normalizedType)) {
				const visibleAssertion = procedureType.visible ? 'be.visible' : 'not.exist';
				cy.contains('label', this.procedureTypeMappings[normalizedType].displayName).should(
					visibleAssertion
				);
			} else {
				throw new Error(
					`Procedure type "${procedureType.name}" not found. Available options: ${availableOptions}`
				);
			}
		});
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
