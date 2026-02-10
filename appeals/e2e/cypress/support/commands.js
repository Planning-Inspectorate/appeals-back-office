// @ts-nocheck
import { BrowserAuthData } from '../fixtures/browser-auth-data';
import { appealsApiClient } from './appealsApiClient';

// const cookiesToSet = ['domain', 'expiry', 'httpOnly', 'path', 'secure'];
// Pick a stable auth cookie name if you know it; regex is a safe default.
const AUTH_COOKIE_MATCH = /(Auth|\.AspNetCore|idsrv|x-ms-)/i;

function assertAuthCookiesExist() {
	cy.getCookies().then((cookies) => {
		const ok = cookies.some((c) => AUTH_COOKIE_MATCH.test(c.name));
		expect(ok, 'at least one auth cookie present').to.be.true;
	});
}

// Checks we are authenticated by probing a known auth-only page.
// Adjust PATH if your app uses a different landing route.
function assertAuthenticated() {
	const PATH = '/appeals-service/personal-list';

	cy.request({
		url: PATH,
		failOnStatusCode: false, // don't fail the test on 302/404
		followRedirect: false // so we can inspect Location header
	}).then((res) => {
		const location = res.headers?.location || '';

		// Not bounced to Azure AD
		expect(location, 'not redirected to AAD').not.to.include('login.microsoftonline.com');

		// SPA backends may return 404 for client-routed paths; accept it.
		// 200 = served page, 302 = in-app redirect, 404 = SPA not SSR'd but still auth OK
		expect(res.status, 'authenticated status').to.be.oneOf([200, 302, 404]);
	});
}

Cypress.Commands.add('clearCookiesFiles', () => {
	cy.task('ClearAllCookies').then((cleared) => {
		console.log(cleared);
	});
});

Cypress.Commands.add('deleteDownloads', () => {
	cy.task('DeleteDownloads');
});

Cypress.Commands.add('deleteUnwantedFixtures', () => {
	cy.task('DeleteUnwantedFixtures');
});

Cypress.Commands.add('validateDownloadedFile', (fileName) => {
	cy.task('ValidateDownloadedFile', fileName).then((success) => {
		if (success) {
			expect(success).to.be.true;
		} else {
			throw new Error(
				`${fileName} was not found. The file was either not downloaded or the file name is not correct.`
			);
		}
	});
});

Cypress.Commands.add('login', (user) => {
	cy.loginSession(user);
});

Cypress.Commands.add('loginWithPuppeteer', (user) => {
	const config = {
		username: user.email,
		password: Cypress.env('PASSWORD'),
		loginUrl: Cypress.config('baseUrl'),
		id: user.id
	};

	cy.task('AzureSignIn', config).then((cookies) => {
		cy.clearCookies();
		cookies.forEach((cookie) => {
			cy.setCookie(cookie.name, cookie.value, {
				domain: cookie.domain,
				expiry: cookie.expires,
				httpOnly: cookie.httpOnly,
				path: cookie.path,
				secure: cookie.secure,
				log: false
			});
		});

		// Bind cookies to the app origin and verify we’re authenticated
		cy.visit('/');
		assertAuthenticated();
	});

	return;
});

Cypress.Commands.add('loginSession', (user) => {
	if (!user?.id || !user?.email) {
		throw new Error('loginSession: user must be an object with { id, email }');
	}

	const sessionKey = `azure:${Cypress.config('baseUrl')}:${user.id}`;

	cy.session(
		sessionKey,
		() => {
			cy.task('CookiesFileExists', user.id).then((exists) => {
				if (!exists) {
					cy.log(`No cookie file for ${user.id} → performing Azure sign-in`);
					cy.loginWithPuppeteer(user);
				} else {
					cy.log(`Using cookie file for ${user.id}`);
					setLocalCookies(user.id);
				}
			});
		},
		{
			cacheAcrossSpecs: true,
			validate() {
				assertAuthenticated();
			}
		}
	);
});

Cypress.Commands.add('getByData', (value) => {
	return cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('elementExists', (selector) => {
	return cy.get('body').then(($body) => {
		const hasElement = $body.find(selector).length > 0;
		return cy.wrap(hasElement);
	});
});

Cypress.Commands.add('writeLog', (message, logToConsole = true, logToBrowser = true) => {
	if (logToConsole) {
		cy.task('log', message);
	}
	if (logToBrowser) {
		cy.log(message);
	}
});

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

Cypress.Commands.add('addAppellantStatementToCase', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.appellantStatementSubmission(caseObj.reference);
		cy.log('Added appellant statement to case ref ' + caseObj.reference);
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

Cypress.Commands.add('simulateDocumentsScanComplete', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateDocumentScanComplete(caseObj.reference);
		cy.log('Simulated documents scan complete for case ref ' + caseObj.reference);
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

Cypress.Commands.add('reloadUntilVirusCheckComplete', () => {
	cy.reload();
});

Cypress.Commands.add('reloadUntilVirusCheckComplete', () => {
	cy.reload();
});

export function setLocalCookies(userId) {
	cy.readFile(
		`${BrowserAuthData.BrowserAuthDataFolder}/${userId}-${BrowserAuthData.CookiesFile}`
	).then((data) => {
		cy.clearCookies();
		data.forEach((cookie) => {
			cy.setCookie(cookie.name, cookie.value, {
				domain: cookie.domain,
				expiry: cookie.expires,
				httpOnly: cookie.httpOnly,
				path: cookie.path,
				secure: cookie.secure,
				log: false
			});
		});

		// Bind cookies and verify auth
		cy.visit('/');
		assertAuthenticated();
	});
}

Cypress.Commands.add('setCurrentCookies', (cookies) => {
	cy.clearCookies();
	cookies.forEach((cookie) => {
		cy.setCookie(cookie.name, cookie.value, {
			domain: cookie.domain,
			expiry: cookie.expiry,
			httpOnly: cookie.httpOnly,
			path: cookie.path,
			secure: cookie.secure
		});
	});

	cy.visit('/');
	assertAuthenticated();
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

Cypress.Commands.add('checkNotifySent', (caseObj, expectedNotifies) => {
	// ensure input is always an array
	const expected = [].concat(expectedNotifies);

	cy.writeLog(`** expected notifies ${JSON.stringify(expectedNotifies)}`);

	expected.forEach(({ template, recipient }) => {
		expect(
			typeof template === 'string' && template.trim() !== '',
			`notify template should be provided: "${template}"`
		).to.be.true;

		expect(
			typeof recipient === 'string' && recipient.trim() !== '',
			`notify recipient should be provided: "${recipient}"`
		).to.be.true;
	});

	return cy
		.wrap(null)
		.then(() => {
			// return the promise so Cypress waits for it
			return appealsApiClient.getNotifyEmails(caseObj.reference);
		})
		.then((sentNotifies) => {
			cy.writeLog(`** sent notifies ${JSON.stringify(sentNotifies)}`);

			// filter for expected notifies that were NOT found
			const missingNotifies = expected.filter(
				(expectedNotify) =>
					!sentNotifies.some(
						(notify) =>
							notify.template === expectedNotify.template &&
							notify.recipient === expectedNotify.recipient
					)
			);

			// error message detail
			const missingDetails = missingNotifies
				.map((notify) => `(Template: ${notify.template}, Recipient: ${notify.recipient})`)
				.join('; ');

			// assert on missing notifies
			expect(missingNotifies, `Missing notifies: ${missingDetails}`).to.be.empty;
		});
});

Cypress.Commands.add('updateAppealDetailsViaApi', (caseObj, caseDetails) => {
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
			return cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
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

Cypress.Commands.add('addInquiryViaApi', (caseObj, date, propertyOverrides = {}) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.addInquiry(appealId, date, propertyOverrides);
	});
});

Cypress.Commands.add('reviewStatementViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewStatement(caseObj.reference);
		cy.log('Reviewed lpa statement for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewIpCommentsViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewIpComments(caseObj.reference);
		cy.log('Reviewed IP comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('shareCommentsAndStatementsViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.shareCommentsAndStatements(caseObj.reference);
		cy.log('Shared IP Comments and Statements for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewAppellantFinalCommentsViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewAppellantFinalComments(caseObj.reference);
		cy.log('Reviewed appellant final comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('reviewLpaFinalCommentsViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.reviewLpaFinalComments(caseObj.reference);
		cy.log('Reviewed LPA final comments for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('setupSiteVisitViaAPI', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.setupSiteVisit(caseObj.reference);
		cy.log('Setup site visit for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('issueDecisionViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.issueDecision(caseObj.reference);
		cy.log('Issue allowed decision for case ref ' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('setupHearingViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.setupHearing(caseObj.reference);
		cy.log('Setup hearing for case ref' + caseObj.reference);
		cy.reload();
	});
});

Cypress.Commands.add('addEstimateViaApi', (procedureType, caseObj, estimate = null) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		console.log(estimate);
		return await appealsApiClient.addEstimate(procedureType, appealId, estimate);
	});
});

Cypress.Commands.add('deleteEstimateViaApi', (procedureType, caseObj) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(caseObj.reference);
		const appealId = await details.appealId;
		return await appealsApiClient.deleteEstimate(procedureType, appealId);
	});
});

Cypress.Commands.add('assignCaseOfficerViaApi', (caseObj) => {
	return cy.wrap(null).then(async () => {
		return await appealsApiClient.assignCaseOfficer(caseObj.id);
	});
});

Cypress.Commands.add('deleteAppeals', (caseObj) => {
	return cy.wrap(null).then(async () => {
		const caseObjs = [].concat(caseObj);

		const appealIds = [];

		for (const obj of caseObjs) {
			if (obj?.id) {
				appealIds.push(obj.id);
			}
		}

		cy.log(`Deleting case(s) ${appealIds}`);
		return await appealsApiClient.deleteAppeals(appealIds);
	});
});

Cypress.Commands.add('selectReasonOption', (optionLabel = null) => {
	return cy.get('input[type="checkbox"]').then(($checkboxes) => {
		// Helper function to get label text for a checkbox
		const getLabelText = (checkbox) => Cypress.$(checkbox).siblings('label').text().trim();

		// Filter checkboxes based on the selection logic
		const targetCheckbox =
			optionLabel === 'Other reason'
				? $checkboxes.filter((i, elem) => getLabelText(elem) === 'Other reason')[0]
				: $checkboxes.filter((i, elem) => getLabelText(elem) !== 'Other reason')[
						Math.floor(
							Math.random() *
								$checkboxes.filter((i, elem) => getLabelText(elem) !== 'Other reason').length
						)
					];

		// Validate target checkbox exists
		if (!targetCheckbox) {
			throw new Error(
				optionLabel === 'Other reason'
					? 'Checkbox with label "Other reason" not found'
					: 'No eligible checkboxes available (excluding "Other reason")'
			);
		}

		// Select checkbox and return label text
		const selectedLabelText = getLabelText(targetCheckbox);
		cy.wrap(targetCheckbox).click().should('be.checked');

		return cy.wrap(selectedLabelText);
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

Cypress.Commands.add('addRule6Party', (caseObj) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.addRule6Party(caseObj.id);
		cy.log('Add rule 6 party for case ref ' + caseObj.reference);
		cy.reload();
	});
});
