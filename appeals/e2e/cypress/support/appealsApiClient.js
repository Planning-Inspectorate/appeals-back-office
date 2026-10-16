// @ts-nocheck
import {
	appealsApiRequests,
	documentsApiRequest,
	generateUniqueDocument
} from '../fixtures/appealsApiRequests';
import { CASE_OFFICER_ID } from '../fixtures/users';
import { apiPaths } from './apiPaths.js';

const baseUrl = Cypress.config('apiBaseUrl');

export const createApiSubmission = (submission, type) => {
	const env = baseUrl.indexOf('test') > -1 ? 'test' : 'dev';

	// some requests (e.g. case submission) require that a mandatory documents field is included in the payload
	// as such we check to see if there is a default document for the request type, and update it with unique values 
	const baseDocument = documentsApiRequest[env][type]?.documents[0] ?? null;
	const updatedDocument = generateUniqueDocument(baseDocument);

	return {
		...submission,
		documents: [updatedDocument]
	};
};

const expectedResponseStatus = [200, 201];

/**
 * Asserts the status of an API response
 * @param {Response} response the response object returned from the fetch request
 * @param {string} requestDescription description of the request being made, for logging purposes
 * @param {string} requestUrl the URL of the request being made, for logging purposes
 * @throws {Error} Throws an error if the response is not ok, including the status and response body
 */
const assertResponseStatus = async (response, requestDescription, requestUrl) => {
	// if the response is ok, assert that the status is one of the expected values and log success
	if (response.ok) {
		expect(response.status).to.be.oneOf(expectedResponseStatus);
		cy.writeLog(
			`API request successful: ${requestDescription}, url: ${requestUrl}, status: ${response.status}`
		);
		return;
	}

	// if the response is not ok throw an error with details
	const errorBody = await response.text();
	throw new Error(
		`HTTP error ${requestDescription}: url ${requestUrl}, status: ${response.status}, Response body: ${errorBody}`
	);
};

export const appealsApiClient = {
	async caseSubmission(requestBody, additionalDocuments = []) {
		try {
			const submission = createApiSubmission(
				appealsApiRequests.caseSubmission,
				'appellant',
			);
			const { casedata, users, documents } = submission;

			// if are any additional documents, generate unique versions and merge with default document 
			const updatedAdditionalDocuments = additionalDocuments.length > 0 ? additionalDocuments.map((doc) => generateUniqueDocument(doc)) : []
			const allDocuments = [...documents, ...updatedAdditionalDocuments]

			cy.writeLog(
				JSON.stringify({
					casedata: {
						...casedata,
						...requestBody
					},
					users,
					documents: allDocuments
				})
			);

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
					documents: allDocuments
				})
			});

			await assertResponseStatus(response, 'submitting case', url);

			const responseBody = await response.json();

			expect(responseBody.id).to.be.a('number').and.to.be.greaterThan(0);
			expect(responseBody.reference).to.be.a('string').and.to.not.be.empty;
			expect(responseBody).to.have.property('assignedTeamId');

			return {
				reference: responseBody.reference,
				id: responseBody.id
			};
		} catch (error) {
			cy.writeLog(`Error making case submission: ${error}`);
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

			await assertResponseStatus(response, 'submitting LPAQ', url);

			const responseBody = await response.json();

			expect(responseBody.id).to.be.a('number').and.to.be.greaterThan(0);
			expect(responseBody.reference).to.equal(reference);

			return responseBody.reference;
		} catch (error) {
			cy.writeLog(`Error submitting LPAQ for ${reference}: ${error}`);
			throw error;
		}
	},
	async appellantStatementSubmission(reference) {
		try {
			const requestBody = createApiSubmission(appealsApiRequests.appellantStatement);
			requestBody.caseReference = reference;

			const url = baseUrl + apiPaths.repSubmission;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBody)
			});

			await assertResponseStatus(response, 'submitting appellant statement', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');
			cy.log(`Response body from appellant statement submission: ${JSON.stringify(responseBody)}`);
			expect(responseBody).to.deep.equal({
				appealId
			});

			return await response.json();
		} catch (error) {
			cy.writeLog(`Error submitting appellant statement for ${reference}: ${error}`);
			return false;
		}
	},

	async reviewAppellantStatement(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-appellant-statement`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'reviewing appellant statement', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error reviewing appellant statement for ${reference}: ${error}`);
			return false;
		}
	},

	async reviewRule6PartyStatement(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-rule-6-statement`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'reviewing rule6Party statement', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error reviewing rule6Party statement for ${reference}: ${error}`);
			return false;
		}
	},

	async reviewRule6ProofOfEvidence(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-rule-6-proof-of-evidence`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					reviewOutcome: 'complete'
				})
			});

			await assertResponseStatus(response, 'reviewing rule6 proof of evidence', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error reviewing Rule 6 proof of evidence for ${reference}: ${error}`);
			return false;
		}
	},

	async reviewLpaProofOfEvidence(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-lpa-proof-of-evidence`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'reviewing LPA proof of evidence', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error reviewing LPA proof of evidence for ${reference}: ${error}`);
			return false;
		}
	},

	async reviewAppellantProofOfEvidence(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/review-appellant-proof-of-evidence`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'reviewing appellant proof of evidence', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error reviewing appellant proof of evidence for ${reference}: ${error}`);
			return false;
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

			await assertResponseStatus(response, 'adding representation', url);

			const responseBody = await response.json();

			expect(responseBody.representationType).to.contain(submission.representationType);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error adding representation for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating site visit elapsed', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating site visit elapsed for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating hearing elapsed', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating hearing elapsed for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating proof of evidence elapsed', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating proof of evidence elapsed for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating inquiry elapsed', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating inquiry elapsed for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating statements elapsed', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating statements elapsed for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'simulating final comments elapsed', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.true;

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error simulating final comments elapsed for ${reference}: ${error}`);
			return false;
		}
	},
	async simulateDocumentScanComplete(reference) {
		try {
			const url = `${baseUrl}appeals/${reference}/document-scan-complete`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'simulating document scan complete', url);

			return true;
		} catch (error) {
			cy.writeLog(`Error simulating document scan complete for ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'loading case details', url);

			const responseBody = await response.json();

			expect(responseBody).to.not.be.null;
			expect(responseBody).to.not.be.undefined;
			expect(responseBody.appealReference).to.equal(reference);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Failed to load case details for ${reference}: ${error}`);
			return false;
		}
	},
	async loadAppellantCaseDetails(appealId, appellantCaseId) {
		try {
			const url = `${baseUrl}appeals/${appealId}/appellant-cases/${appellantCaseId}`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'loading appellant case details', url);

			const responseBody = await response.json();

			expect(responseBody).to.not.be.null;
			expect(responseBody).to.not.be.undefined;
			expect(responseBody.appealId).to.equal(appealId);

			return responseBody;
		} catch (error) {
			cy.writeLog(
				`Failed to load appellant case details for id ${appealId} and appellant case id ${appellantCaseId}:`,
				error
			);
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
			await assertResponseStatus(response, 'getting business date', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.a('string');
			const dateObj = new Date(responseBody);
			expect(dateObj.toISOString()).to.equal(responseBody);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error getting business date for ${date}: ${error}`);
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
			await assertResponseStatus(response, 'getting specialisms', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.an('array').with.length.greaterThan(0);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error getting specialisms: ${error}`);
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

			await assertResponseStatus(response, 'updating allocation', url);

			const responseBody = await response.json();

			expect(responseBody)
				.to.be.an('object')
				.that.includes.all.keys('selectedLevel', 'specialisms');

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error updating allocation for appeal ${appealId}: ${error}`);
			return false;
		}
	},

	async addHearing(appealId, date) {
		try {
			const requestBody = createApiSubmission(appealsApiRequests.hearingDetails);
			const hearingStartTime = date.toISOString();
			const hearingEndTime = date.toISOString();

			const hearingRequest = {
				...requestBody,
				hearingStartTime,
				hearingEndTime
			};

			const url = `${baseUrl}appeals/${appealId}/hearing`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(hearingRequest)
			});

			await assertResponseStatus(response, 'adding hearing', url);

			const responseBody = await response.json();
			expect(responseBody).to.be.an('object');
			expect(responseBody).to.deep.equal({
				appealId,
				hearingStartTime: hearingStartTime,
				hearingEndTime: hearingEndTime
			});

			return await response.json();
		} catch (error) {
			cy.writeLog(`Error adding hearing for appeal ${appealId}: ${error}`);
			return false;
		}
	},

	async deleteHearing(appealId, hearingId) {
		try {
			cy.writeLog(`Attempting to delete hearing with ID ${hearingId} for appeal ${appealId}`);
			const url = `${baseUrl}appeals/${appealId}/hearing/${hearingId}`;
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				}
			});

			await assertResponseStatus(response, 'deleting hearing', url);

			const responseBody = await response.json();

			cy.writeLog(`responseBody from delete hearing API: ${JSON.stringify(responseBody)}`);
			expect(responseBody).to.be.an('object');
			expect(responseBody).to.deep.equal({
				appealId: String(appealId),
				hearingId: String(hearingId)
			});

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error deleting hearing for appeal ${appealId}: ${error}`);
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

			await assertResponseStatus(response, 'getting notify emails', url);

			const responsejson = await response.json();

			const sentNotifies = responsejson.map((notify) => ({
				template: notify.template,
				recipient: notify.recipient
			}));

			cy.writeLog(`** response from notify-emails-sent  ${JSON.stringify(sentNotifies)}`);

			return responsejson;
		} catch (error) {
			cy.writeLog(`Error getting notify emails for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'updating appeal cases', url);

			return await response.json();
		} catch (error) {
			cy.writeLog(
				`Error updating appeal cases for appeal ${appealId} and appellant case ${appellantCaseId}: ${error}`
			);
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
			await assertResponseStatus(response, 'updating timetable', url);

			return await response.json();
		} catch (error) {
			cy.writeLog(
				`Error updating timetable for appeal ${appealId} and timetable ${timeTableId}: ${error}`
			);
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

			await assertResponseStatus(response, 'adding inquiry', url);

			return await response.json();
		} catch (error) {
			cy.writeLog(`Error adding inquiry for appeal ${appealId}: ${error}`);
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

			await assertResponseStatus(response, 'reviewing LPA statement', url);

			const responseBody = await response.json();

			expect(responseBody.origin).to.equal('lpa');
			expect(responseBody.status).to.equal('valid');
			expect(responseBody.representationType).to.equal('lpa_statement');
		} catch (error) {
			cy.writeLog(`Error reviewing LPA statement for appeal ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'reviewing IP comments', url);

			const responseBody = await response.json();

			expect(responseBody.origin).to.equal('citizen');
			expect(responseBody.status).to.equal('valid');
			expect(responseBody.representationType).to.equal('comment');
		} catch (error) {
			cy.writeLog(`Error reviewing IP comments for appeal ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'sharing comments and statements', url);
		} catch (error) {
			cy.writeLog(`Error sharing comments and statements for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'reviewing appellant final comments', url);
		} catch (error) {
			cy.writeLog(`Error reviewing appellant final comments for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'reviewing LPA final comments', url);
		} catch (error) {
			cy.writeLog(`Error reviewing LPA final comments for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'setting up site visit', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.an('object');
			expect(responseBody).to.include.keys([
				'visitDate',
				'visitStartTime',
				'visitEndTime',
				'visitType'
			]);
		} catch (error) {
			cy.writeLog(`Error setting up site visit for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'issuing decision', url);
		} catch (error) {
			cy.writeLog(`Error issuing decision for appeal ${reference}: ${error}`);
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
			await assertResponseStatus(response, 'setting up hearing', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.an('object');
			expect(responseBody).to.have.keys(['appealId', 'hearingStartTime', 'hearingEndTime']);
		} catch (error) {
			cy.writeLog(`Error setting up hearing for appeal ${reference}: ${error}`);
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

			await assertResponseStatus(response, 'adding estimate', url);

			const responseBody = await response.json();

			expect(responseBody).to.be.an('object');
			expect(responseBody).to.have.keys(['preparationTime', 'sittingTime', 'reportingTime']);

			return await response.json();
		} catch (error) {
			cy.writeLog(`Error adding estimate for appeal ${appealId}: ${error}`);
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
			await assertResponseStatus(response, 'deleting estimate', url);
			return await response.json();
		} catch (error) {
			cy.writeLog(
				`Error deleting estimate for appeal ${appealId} and procedure type ${procedureType}: ${error}`,
				error
			);
			return false;
		}
	},

	async assignCaseOfficer(appealId) {
		try {
			cy.writeLog(`Assigning case officer with ID ${CASE_OFFICER_ID} to appeal ${appealId}`);
			const url = `${baseUrl}appeals/${appealId}`;

			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					caseOfficerId: CASE_OFFICER_ID
				})
			});

			await assertResponseStatus(response, 'assigning case officer', url);

			const responseBody = await response.json();

			expect(responseBody.caseOfficerId).to.eq(CASE_OFFICER_ID);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error assigning case officer for appeal ${appealId}: ${error}`);
			return false;
		}
	},

	async deleteAppeals(appealIds) {
		try {
			const url = `${baseUrl}appeals/delete-appeals`;
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify({
					appealIds
				})
			});
			await assertResponseStatus(response, 'deleting appeals', url);
		} catch (error) {
			cy.writeLog(`Error deleting appeals with IDs ${appealIds.toString()}: ${error}`);
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
			await assertResponseStatus(response, 'starting appeal', url);
		} catch (error) {
			cy.writeLog(`Error starting appeal ${appealReference}: ${error}`);
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
			await assertResponseStatus(response, 'linking appeals', url);
		} catch (error) {
			cy.writeLog(`Error linking appeals ${leadAppeaId} and ${childAppealId}: ${error}`);
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
			await assertResponseStatus(response, 'reviewing LPAQ', url);

			const body = await response.json();
			expect(body.validationOutcome.name).eq('Complete');
		} catch (error) {
			cy.writeLog(`Error reviewing LPAQ for appeal ${appealReference}: ${error}`);
			return false;
		}
	},

	async addRule6Party(appealId, requestBodyOverride) {
		try {
			const url = `${baseUrl}appeals/${appealId}/rule-6-parties`;

			// Use override if provided, otherwise create default
			const requestBody = requestBodyOverride
				? requestBodyOverride
				: createApiSubmission(appealsApiRequests.rule6Party);

			console.log(requestBody);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					azureAdUserId: '434bff4e-8191-4ce0-9a0a-91e5d6cdd882'
				},
				body: JSON.stringify(requestBody)
			});
			await assertResponseStatus(response, 'adding rule 6 party', url);

			const responseBody = await response.json();
			expect(responseBody.serviceUser).to.deep.equal(requestBody.serviceUser);
			expect(responseBody.appealId).to.deep.equal(appealId);

			return responseBody;
		} catch (error) {
			cy.writeLog(`Error adding rule 6 party for appeal ${appealId}: ${error}`);
			return false;
		}
	}
};
