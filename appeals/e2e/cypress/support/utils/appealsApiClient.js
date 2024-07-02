// @ts-nocheck
import axios from 'axios';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';

// TODO Consider moving this into it's own file
const apiPaths = {
	caseSubmission: 'appeals/case-submission',
	lpqaSubmission: 'appeals/lpaq-submission'
};

const baseUrl = Cypress.config('apiBaseUrl');

export const appealsApiClient = {
	async caseSubmission() {
		try {
			const url = baseUrl + apiPaths.caseSubmission;
			const response = await axios.post(url, appealsApiRequests.caseSubmission);
			return response.data.reference;
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
			const response = await axios.post(url, requestBody);
			return response.data.reference;
		} catch (error) {
			console.error('Error making API call:', error);
			throw error;
		}
	}
};
