// @ts-nocheck
import { appealsApiRequests, documentsApiRequest } from '../fixtures/appealsApiRequests';
import { apiPaths } from './apiPaths.js';

const baseUrl = Cypress.config('apiBaseUrl');

export const createApiSubmission = (submission, type) => {
	const env = baseUrl.indexOf('test') > -1 ? 'test' : 'dev';

	return {
		...submission,
		...documentsApiRequest[env][type]
	};
};

export const appealsApiClient = {
	async caseSubmission(requestBody) {
		try {
			const submission = createApiSubmission(appealsApiRequests.caseSubmission, 'appellant');
			const { casedata, users, documents } = submission;

			console.log({
				...casedata,
				...requestBody
			});

			const url = baseUrl + apiPaths.caseSubmission;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					casedata: {
						...casedata,
						...requestBody
					},
					users,
					documents
				})
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
			const requestBody = createApiSubmission(appealsApiRequests.lpaqSubmission, 'lpaq');
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
	},
	async addRepresentation(reference, type, serviceUserId) {
		const submission = createApiSubmission(appealsApiRequests[type], type);
		submission.caseReference = reference;
		if (serviceUserId !== null) {
			submission.serviceUserId = serviceUserId;
		}
		try {
			const url = baseUrl + apiPaths.repSubmission;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(submission)
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	},
	async simulateSiteVisitElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/site-visit-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	},
	async simulateStatementsElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/statements-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	},
	async simulateFinalCommentsElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/final-comments-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	},
	async loadCaseDetails(reference) {
		try {
			const url = `${baseUrl}appeals/case-reference/${reference}`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	},
	async setAppealTimetables(appealId) {
		try {
			const url = `${baseUrl}appeals/${appealId}/appeal-timetables`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			const result = await response.json();
			return result;
		} catch {
			return false;
		}
	}
};
