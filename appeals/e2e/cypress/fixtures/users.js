export const users = {
	appeals: {
		validationOfficer: {
			email: Cypress.env('VALIDATION_OFFICER_EMAIL'),
			id: 'validation-officer',
			typeName: 'Validation officer'
		},
		caseAdmin: {
			email: Cypress.env('CASE_ADMIN_EMAIL'),
			id: 'case-admin',
			typeName: 'Case admin'
		},
		inspector: {
			email: Cypress.env('INSPECTOR_EMAIL'),
			id: 'inspector',
			typeName: 'Inspector'
		},
		happyPath: {
			email: Cypress.env('HAPPY_PATH_EMAIL'),
			id: 'happy-path',
			typeName: 'Test user'
		}
	}
};
