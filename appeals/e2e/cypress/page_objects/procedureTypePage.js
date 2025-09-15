// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class ProcedureTypePage extends CaseDetailsPage {
	procedureTypeElements = {
		...this.elements, // Inherit parent elements
		written: () => cy.get('#appeal-procedure'),
		hearing: () => cy.get('#appeal-procedure-1'),
		inquiry: () => cy.get('#appeal-procedure-2')
	};

	selectProcedureType(label) {
		const procedureTypeLabelMappings = {
			written: {
				element: this.procedureTypeElements.written,
				displayName: 'Written representations'
			},
			hearing: {
				element: this.procedureTypeElements.hearing,
				displayName: 'Hearing'
			},
			inquiry: {
				element: this.procedureTypeElements.inquiry,
				displayName: 'Inquiry'
			}
		};

		const normalizedLabel = label.toLowerCase().trim();

		if (procedureTypeLabelMappings.hasOwnProperty(normalizedLabel)) {
			const mapping = procedureTypeLabelMappings[normalizedLabel];
			// Click and verify it's checked
			mapping.element().click().should('be.checked');
			this.clickButtonByText('Continue');
			cy.log(`Selected procedure type: ${mapping.displayName}`);
		} else {
			const availableOptions = Object.values(procedureTypeLabelMappings)
				.map((m) => m.displayName)
				.join(', ');
			throw new Error(
				`Procedure type "${label}" not found. Available options: ${availableOptions}`
			);
		}
	}

	verifyHeader(sectionHeader) {
		this.elements.getAppealRefCaseDetails().should('contain.text', sectionHeader);
	}
}
