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
	async addRepresentation(reference, type, serviceUserId, representation) {
		const submission = createApiSubmission(appealsApiRequests[type], type);
		submission.caseReference = reference;
		if (serviceUserId !== null) {
			submission.serviceUserId = serviceUserId;
		}
		if (representation !== null) {
			submission.representation = representation;
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

			return await response.json();
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

			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async simulateHearingElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/hearing-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			expect(response.status).eq(200);
			return await response.json();
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

			return await response.json();
		} catch {
			return false;
		}
	},
	async getBusinessDate(date, days = 7) {
		try {
			const url = `${baseUrl}appeals/add-business-days`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					inputDate: date,
					numDays: days
				})
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},
	async getSpecialisms() {
		try {
			const url = `${baseUrl}appeals/appeal-allocation-specialisms`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},
	async updateAllocation(appealId, specialismsIds) {
		try {
			const requestBody = createApiSubmission(
				appealsApiRequests['allocationLevelAndSpecialisms'],
				null
			);
			requestBody.specialisms = specialismsIds;
			const url = `${baseUrl}appeals/${appealId}/appeal-allocation`;
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					level: 'A',
					specialisms: specialismsIds
				})
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async addHearing(appealId, date) {
		try {
			const requestBody = createApiSubmission(appealsApiRequests.hearingDetails);
			requestBody.hearingStartTime = date.toISOString();
			requestBody.hearingEndTime = date.toISOString();
			const url = `${baseUrl}appeals/${appealId}/hearing`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBody)
			});

			expect(response.status).eq(201);
			return await response.json();
		} catch {
			return false;
		}
	},

	async deleteHearing(appealId, hearingId) {
		try {
			const url = `${baseUrl}appeals/${appealId}/hearing/${hearingId}`;
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async getNotifyEmails(reference) {
		try {
			const url = `${baseUrl}/appeals/${reference}/notify-emails-sent`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).to.eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async updateAppealCases(appealId, requestBody) {
		try {
			const url = `${baseUrl}appeals/${appealId}/appellant-cases/${appealId}`;
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBody)
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async updateTimeTable(appealId, timeTableId, requestBody) {
		try {
			const url = `${baseUrl}appeals/${appealId}/appeal-timetables/${timeTableId}`;
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBody)
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	}
};
