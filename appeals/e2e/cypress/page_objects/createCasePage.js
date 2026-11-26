// @ts-nocheck
/// <reference types="cypress"/>

import { CaseDetailsPage } from './caseDetailsPage.js';

export class CreateCasePage extends CaseDetailsPage {
	// Define the elements for each case type that can be selected on the Create Case page
	caseTypeElements = {
		...this.elements, // Inherit parent elements
		treePreservationOrder: () => cy.get('#caseType'),
		treeReplacementNotice: () => cy.get('#caseType-2'),
		highHedgeAppeal: () => cy.get('#caseType-3'),
		hedgerowsAppeal: () => cy.get('#caseType-4'),
		discontinuanceNotice: () => cy.get('#caseType-5'),
		communityInfrastructureLevy: () => cy.get('#caseType-6'),
		section106Agreement: () => cy.get('#caseType-7'),
		environmentalAppeal: () => cy.get('#caseType-8')
	};

	/**
	 * Mappings for each case type type that can be selected on the Create Case page,
	 * including the corresponding element, display name, and value.
	 */
	caseTypeMappings = {
		treePreservationOrder: {
			element: this.caseTypeElements.treePreservationOrder,
			displayName: 'Tree preservation order',
			value: 'TPO'
		},
		treeReplacementNotice: {
			element: this.caseTypeElements.treeReplacementNotice,
			displayName: 'Tree replacement notice',
			value: 'TRN'
		},
		highHedgeAppeal: {
			element: this.caseTypeElements.highHedgeAppeal,
			displayName: 'High hedges appeal',
			value: 'HH'
		},
		hedgerowsAppeal: {
			element: this.caseTypeElements.hedgerowsAppeal,
			displayName: 'Hedgerows appeal',
			value: 'HR'
		},
		discontinuanceNotice: {
			element: this.caseTypeElements.discontinuanceNotice,
			displayName: 'Discontinuance notice',
			value: 'G'
		},
		communityInfrastructureLevy: {
			element: this.caseTypeElements.communityInfrastructureLevy,
			displayName: 'Community infrastructure levy',
			value: 'L'
		},
		section106Agreement: {
			element: this.caseTypeElements.section106Agreement,
			displayName: 'Section 106 agreement',
			value: 'Q'
		},
		environmentalAppeal: {
			element: this.caseTypeElements.environmentalAppeal,
			displayName: 'Environmental appeal',
			value: 'ENV'
		}
	};

	/**
	 * Selects a case type and continues
	 * @param {string} label - The case type to select (case-insensitive)
	 * @throws {Error} If the case type is not found
	 */
	selectCaseType(label) {
		// Normalize the label for case-insensitive comparison
		const normalizedLabel = label.toLowerCase().trim();

		// Check if a case type exists with the provided label
		const mapping = Object.values(this.caseTypeMappings).find(
			(m) => m.displayName.toLowerCase().trim() === normalizedLabel
		);

		// If the mapping is not found, throw an error
		if (!mapping) {
			throw new Error(`Case type "${label}" not found. Available options: ${availableOptions}`);
		}

		// Click the element and verify it's checked with value validation
		mapping.element().click().should('be.checked').and('have.value', mapping.value);

		// Click the Continue button to proceed
		this.clickButtonByText('Continue');
		cy.log(`Selected case type: ${mapping.displayName}`);
	}
}
