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

			const responseBody = await response.json();

			expect(responseBody.id).to.be.a('number').and.to.be.greaterThan(0);
			expect(responseBody.reference).to.be.a('string').and.to.not.be.empty;
			expect(responseBody).to.have.property('assignedTeamId');

			return {
				reference: responseBody.reference,
				id: responseBody.id
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

			const responseBody = await response.json();

			expect(responseBody.id).to.be.a('number').and.to.be.greaterThan(0);
			expect(responseBody.reference).to.equal(reference);

			return responseBody.reference;
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
			const responseBody = await response.json();

			expect(responseBody.representationType).to.contain(submission.representationType);

			return responseBody;
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

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
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

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch {
			return false;
		}
	},
	async simulateProofOfEvidenceElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/proof-of-evidence-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			expect(response.status).eq(200);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch {
			return false;
		}
	},

	async simulateInquiryElapsed(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/inquiry-elapsed`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			expect(response.status).eq(200);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
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

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
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

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
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

			expect(response.status).to.equal(200);

			const responseBody = await response.json();

			expect(responseBody).to.not.be.null;
			expect(responseBody).to.not.be.undefined;
			expect(responseBody.appealReference).to.equal(reference);

			return responseBody;
		} catch (error) {
			console.error(`Failed to load case details for ${reference}:`, error);
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

			const responseBody = await response.json();

			expect(responseBody).to.be.a('string');
			const dateObj = new Date(responseBody);
			expect(dateObj.toISOString()).to.equal(responseBody);

			return responseBody;
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

			const responseBody = await response.json();

			expect(responseBody).to.be.an('array').with.length.greaterThan(0);

			return responseBody;
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

			const responseBody = await response.json();

			expect(responseBody)
				.to.be.an('object')
				.that.includes.all.keys('selectedLevel', 'specialisms');

			return responseBody;
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
			requestBody.isStartCase = true;

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

	async reviewStatement(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-lpa-statement`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);

			const responseBody = await response.json();

			expect(responseBody.origin).to.equal('lpa');
			expect(responseBody.status).to.equal('valid');
			expect(responseBody.representationType).to.equal('lpa_statement');
		} catch {
			return false;
		}
	},

	async reviewIpComments(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-ip-comment`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);

			const responseBody = await response.json();

			expect(responseBody.origin).to.equal('citizen');
			expect(responseBody.status).to.equal('valid');
			expect(responseBody.representationType).to.equal('comment');
		} catch {
			return false;
		}
	},
	async shareCommentsAndStatements(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/share-comments-and-statement`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
		} catch {
			return false;
		}
	},

	async reviewAppellantFinalComments(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-appellant-final-comments`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
		} catch {
			return false;
		}
	},

	async reviewLpaFinalComments(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-lpa-final-comments`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
		} catch {
			return false;
		}
	},

	async setupSiteVisit(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/set-up-site-visit`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(201);
		} catch {
			return false;
		}
	},

	async issueDecision(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/issue-decision`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(201);
		} catch {
			return false;
		}
	},

	async setupHearing(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/set-up-hearing`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(201);
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
			const caseOfficer = '544f5029-e660-4bc3-81b1-adc19d47e970';
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					caseOfficerId: caseOfficer
				})
			});
			expect(response.status).eq(200);

			const responseBody = await response.json();

			expect(responseBody).to.deep.equal({
				caseOfficerId: caseOfficer
			});

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
	},

	async startAppeal(appealReference) {
		try {
			const url = `${baseUrl}appeals/${appealReference}/start-appeal`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(201);
		} catch {
			return false;
		}
	},

	async linkAppeals(leadAppeaId, childAppealId) {
		try {
			const url = `${baseUrl}appeals/${leadAppeaId}/link-appeal`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					linkedAppealId: childAppealId,
					isCurrentAppealParent: true
				})
			});
			expect(response.status).eq(201);
		} catch {
			return false;
		}
	},

	async reviewLpaq(appealReference) {
		try {
			const url = `${baseUrl}appeals/${appealReference}/review-lpaq`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});
			expect(response.status).eq(200);
			const body = await response.json();
			expect(body.validationOutcome.name).eq('Complete');
		} catch {
			return false;
		}
	}
};
