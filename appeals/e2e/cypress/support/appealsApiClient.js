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
			return {
				reference: data.reference,
				id: data.id
			};
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
			const url = `${baseUrl}appeals/${reference}/notify-emails-sent`;
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

	async updateAppealCases(appealId, appellantCaseId, requestBody) {
		try {
			const url = `${baseUrl}appeals/${appealId}/appellant-cases/${appellantCaseId}`;
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
	},

	async addInquiry(appealId, date, propertyOverrides) {
		try {
			const requestBody = createApiSubmission(appealsApiRequests.inquiryDetails);
			requestBody.inquiryStartTime = date.toISOString();
			requestBody.inquiryEndTime = date.toISOString();
			requestBody.startDate = date.toISOString();
			requestBody.lpaQuestionnaireDueDate = date.toISOString();
			requestBody.statementDueDate = date.toISOString();
			requestBody.ipCommentsDueDate = date.toISOString();
			requestBody.statementOfCommonGroundDueDate = date.toISOString();
			requestBody.proofOfEvidenceAndWitnessesDueDate = date.toISOString();
			requestBody.planningObligationDueDate = date.toISOString();

			// apply any overrides to payload
			const requestBodyWithOverrides = {
				...requestBody,
				...propertyOverrides
			};

			cy.log(`** requestBodyWithOverrides - `, JSON.stringify(requestBodyWithOverrides));

			const url = `${baseUrl}appeals/${appealId}/inquiry`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBodyWithOverrides)
			});

			expect(response.status).eq(201);
			return await response.json();
		} catch {
			return false;
		}
	},

	async addEstimate(procedureType, appealId, estimate = null) {
		try {
			let requestBody;
			if (estimate) {
				requestBody = estimate;
			} else requestBody = createApiSubmission(appealsApiRequests.estimateDetails);

			const url = `${baseUrl}appeals/${appealId}/${procedureType}-estimates`;
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

	async deleteEstimate(procedureType, appealId) {
		try {
			const url = `${baseUrl}appeals/${appealId}/${procedureType}-estimates`;
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

	async assignCaseOfficer(appealId) {
		try {
			const url = `${baseUrl}appeals/${appealId}`;
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					caseOfficerId: '13de469c-8de6-4908-97cd-330ea73df618'
				})
			});
			expect(response.status).eq(200);
			return await response.json();
		} catch {
			return false;
		}
	},

	async deleteAppeals(appealId) {
		try {
			const url = `${baseUrl}appeals/delete-appeals`;
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					appealIds: appealId
				})
			});
			expect(response.status).eq(200);
		} catch {
			return false;
		}
	}
};
