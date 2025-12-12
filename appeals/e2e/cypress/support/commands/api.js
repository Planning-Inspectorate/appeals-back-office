// @ts-nocheck
import { appealsApiClient } from '../appealsApiClient';

// API CLIENT CALLS

Cypress.Commands.add('createCase', (customValues) => {
	return cy.wrap(null).then(() => {
		return appealsApiClient.caseSubmission(customValues).then((data) => {
			const appealRef = data.reference;
			const appealId = data.id;
			cy.log(`Generated case with ref ${appealRef} and id ${appealId}`);
			return { reference: appealRef, id: appealId };
		});
	});
});

Cypress.Commands.add('addLpaqSubmissionToCase', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.lpqaSubmission(caseObj.reference);
		cy.log('Added LPA submission to case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('simulateSiteVisit', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateSiteVisitElapsed(caseObj.reference);
		cy.log('Simulated site visit elapsed for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('simulateStatementsDeadlineElapsed', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateStatementsElapsed(caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('simulateFinalCommentsDeadlineElapsed', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateFinalCommentsElapsed(caseObj.reference);
		cy.log('Simulated site visit elapsed for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('addRepresentation', (caseObj, type, serviceUserId, representation = null) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.addRepresentation(
			caseObj.reference,
			type,
			serviceUserId,
			representation
		);
	});
});

Cypress.Commands.add('loadAppealDetails', (caseObj) => {
	return cy.wrap(null).then(async () => {
		return await appealsApiClient.loadCaseDetails(caseObj.reference);
	});
});

Cypress.Commands.add('getBusinessActualDate', (date, days) => {
	return cy.wrap(null).then(() => {
		const formattedDate = new Date(date).toISOString();
		return appealsApiClient.getBusinessDate(formattedDate, days).then((result) => {
			return new Date(result);
		});
	});
});

Cypress.Commands.add('addAllocationLevelAndSpecialisms', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		const specIds = await appealsApiClient.getSpecialisms();
		const ids = specIds.map((item) => item.id);
		return await appealsApiClient.updateAllocation(appealId, ids.slice(0, 3));
	});
});

Cypress.Commands.add('addHearingDetails', (caseObj, date) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.addHearing(appealId, date);
	});
});

Cypress.Commands.add('deleteHearing', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		const hearingId = await details.hearing.hearingId;
		return await appealsApiClient.deleteHearing(appealId, hearingId);
	});
});

Cypress.Commands.add('updateAppealDetails', (caseObj, caseDetails) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = details.appealId;
		const appellantCaseId = details.appellantCaseId;
		return appealsApiClient.updateAppealCases(appealId, appellantCaseId, caseDetails).then(() => {
			cy.log(`Updated appeal details for case ref ${caseObj.reference}`);
			cy.reload();
		});
	});
});

Cypress.Commands.add('validateAppeal', (caseObj) => {
	return cy.wrap(null).then(async () => {
		// Validate Appeal Via API
		cy.getBusinessActualDate(new Date(), 0).then((date) => {
			return cy.updateAppealDetails(caseObj, { validationOutcome: 'valid', validAt: date });
		});
	});
});

Cypress.Commands.add('linkAppeals', (leadCaseObj, childCaseObj) => {
	return cy.wrap(null).then(async () => {
		return await appealsApiClient.linkAppeals(leadCaseObj.id, childCaseObj.id);
	});
});

Cypress.Commands.add('updateTimeTableDetails', (caseObj, timeTableDetails) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		const appealTimetableId = await details.appealTimetable.appealTimetableId;
		return await appealsApiClient.updateTimeTable(appealId, appealTimetableId, timeTableDetails);
	});
});

Cypress.Commands.add('simulateHearingElapsed', (caseObj) => {
	return cy.wrap(null).then(async () => {
		return appealsApiClient.simulateHearingElapsed(caseObj.reference).then(() => {
			cy.log(`Simulated hearing elapsed for case ref ${caseObj.reference}`);
		});
	});
});

Cypress.Commands.add('simulateInquiryElapsed', (caseObj) => {
	return cy.wrap(null).then(async () => {
		return appealsApiClient.simulateInquiryElapsed(caseObj.reference).then(() => {
			cy.log(`Simulated inquiry elapsed for case ref ${caseObj.reference}`);
			cy.reload();
		});
	});
});

Cypress.Commands.add('simulateProofOfEvidenceElapsed', (caseObj) => {
	return cy.wrap(null).then(async () => {
		return appealsApiClient.simulateProofOfEvidenceElapsed(caseObj.reference).then(() => {
			cy.log(`Simulated POE elapsed for case ref ${caseObj.reference}`);
			cy.reload();
		});
	});
});

Cypress.Commands.add('navigateToAppealDetailsPage', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		cy.visit(`appeals-service/appeal-details/${appealId}`);
	});
});

Cypress.Commands.add('addInquiry', (caseObj, date, propertyOverrides = {}) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.addInquiry(appealId, date, propertyOverrides);
	});
});

Cypress.Commands.add('reviewStatement', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewStatement(caseObj.reference);
		cy.log('Reviewed lpa statement for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewIpComments', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewIpComments(caseObj.reference);
		cy.log('Reviewed IP comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('shareCommentsAndStatements', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.shareCommentsAndStatements(caseObj.reference);
		cy.log('Shared IP Comments and Statements for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewAppellantFinalComments', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewAppellantFinalComments(caseObj.reference);
		cy.log('Reviewed appellant final comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewLpaFinalComments', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewLpaFinalComments(caseObj.reference);
		cy.log('Reviewed LPA final comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('setupSiteVisit', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.setupSiteVisit(caseObj.reference);
		cy.log('Setup site visit for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('issueDecision', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.issueDecision(caseObj.reference);
		cy.log('Issue allowed decision for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('setupHearing', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.setupHearing(caseObj.reference);
		cy.log('Setup hearing for case ref' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('addEstimate', (procedureType, caseObj, estimate = null) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		console.log(estimate);
		return await appealsApiClient.addEstimate(procedureType, appealId, estimate);
	});
});

Cypress.Commands.add('deleteEstimate', (procedureType, caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.deleteEstimate(procedureType, appealId);
	});
});

Cypress.Commands.add('assignCaseOfficer', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.assignCaseOfficer(appealId);
	});
});

Cypress.Commands.add('deleteAppeals', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const caseObjs = [].concat(caseObj);

		const appealIds = [];

		for (const obj of caseObjs) {
			appealIds.push(obj.id);
		}

		cy.log(`Deleting case(s) ${appealIds}`);
		return await appealsApiClient.deleteAppeals(appealIds);
	});
});

Cypress.Commands.add('startAppeal', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.startAppeal(caseObj.reference);
		cy.log('Started case for ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewLpaqSubmission', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewLpaq(caseObj.reference);
		cy.log('Reviewed lpaq submission for case ref ' + caseObj.reference);
		cy.reload();
	});
});
