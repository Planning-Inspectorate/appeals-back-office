// @ts-nocheck
import axios from 'axios';
import { appealsApiRequests } from '../../fixtures/appealsApiRequests';

// TODO Move this into it's own file
const apiPaths = {
	caseSubmission: 'appeals/case-submission'
};

export const appealsApiClient = {
	async caseSubmission() {
		const baseUrl = Cypress.config('apiBaseUrl');

		try {
			const url = baseUrl + apiPaths.caseSubmission;
			const response = await axios.post(url, appealsApiRequests.caseSubmission);
			return response.data.reference;
		} catch (error) {
			console.error('Error making API call:', error);
			throw error;
		}
	}
};
