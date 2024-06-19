// @ts-nocheck
import { appealsApiRequests } from '../fixtures/appealsApiRequests';

// TODO Consider moving this into it's own file
const apiPaths = {
	caseSubmission: 'appeals/case-submission',
	lpqaSubmission: 'appeals/lpaq-submission'
};

const baseUrl = Cypress.config('apiBaseUrl');

export const appealsApiClient = {
	async caseSubmission(requestBody) {
		try {
			if (requestBody === undefined) {
				requestBody = appealsApiRequests.caseSubmission;
			}

			const url = baseUrl + apiPaths.caseSubmission;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(`HTTP error calling: ${url} with status: ${response.status}`, errorBody);
			}

			const data = await response.json();
			return data.reference;
		} catch (error) {
			console.error('Error making API call:', error);
			throw error;
		}
	},
	async lpqaSubmission(reference) {
		try {
			let requestBody = appealsApiRequests.lpaqSubmission;
			requestBody.casedata.caseReference = reference;

			const url = baseUrl + apiPaths.lpqaSubmission;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(`HTTP error calling: ${url} with status: ${response.status}`, errorBody);
			}

			const data = await response.json();
			return data.reference;
		} catch (error) {
			console.error('Error making API call:', error);
			throw error;
		}
	}
};
