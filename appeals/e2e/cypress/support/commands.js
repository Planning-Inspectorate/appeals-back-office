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

Cypress.Commands.add('createCase', (customValues) => {
	return cy.wrap(null).then(async () => {
		const appealRef = await appealsApiClient.caseSubmission(customValues);
		cy.log('Generated case with ref ' + appealRef);
		return appealRef;
	});
});

Cypress.Commands.add('addLpaqSubmissionToCase', (reference) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.lpqaSubmission(reference);
		cy.log('Added LPA submission to case ref ' + reference);
		return;
	});
});

Cypress.Commands.add('simulateSiteVisit', (reference) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateSiteVisitElapsed(reference);
		cy.log('Simulated site visit elapsed for case ref ' + reference);
		return;
	});
});

Cypress.Commands.add('simulateStatementsDeadlineElapsed', (reference) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateStatementsElapsed(reference);
		return;
	});
});

Cypress.Commands.add('simulateFinalCommentsDeadlineElapsed', (reference) => {
	return cy.wrap(null).then(async () => {
		await appealsApiClient.simulateFinalCommentsElapsed(reference);
		cy.log('Simulated site visit elapsed for case ref ' + reference);
		return;
	});
});

Cypress.Commands.add(
	'addRepresentation',
	(reference, type, serviceUserId, representation = null) => {
		return cy.wrap(null).then(async () => {
			await appealsApiClient.addRepresentation(reference, type, serviceUserId, representation);
		});
	}
);

Cypress.Commands.add('loadAppealDetails', (reference) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		return details;
	});
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

Cypress.Commands.add('addAllocationLevelAndSpecialisms', (reference) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		const specIds = await appealsApiClient.getSpecialisms();
		const ids = specIds.map((item) => item.id);
		return await appealsApiClient.updateAllocation(appealId, ids.slice(0, 3));
	});
});

Cypress.Commands.add('addHearingDetails', (reference, date) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		return await appealsApiClient.addHearing(appealId, date);
	});
});

Cypress.Commands.add('deleteHearing', (reference) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		const hearingId = await details.hearing.hearingId;
		return await appealsApiClient.deleteHearing(appealId, hearingId);
	});
});

Cypress.Commands.add('checkNotifySent', (reference, expectedNotifies) => {
	// ensure input is always an array
	const expected = [].concat(expectedNotifies);

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

	return cy.wrap(null).then(async () => {
		// returns an array of email objects sent for the given appeal
		const sentNotifies = await appealsApiClient.getNotifyEmails(reference);

		// filter for expected notifies that were NOT found in the sent notfies array
		const missingNotifies = expected.filter(
			(expectedNotify) =>
				!sentNotifies.some(
					(sentNotifies) =>
						sentNotifies.template === expectedNotify.template &&
						sentNotifies.recipient === expectedNotify.recipient
				)
		);

		// error message detail
		const missingDetails = missingNotifies
			.map((notify) => `(Template: ${notify.template}, Recipient: ${notify.recipient})`)
			.join('; ');

		expect(missingNotifies, `Missing notifies: ${missingDetails}`).to.be.empty;
	});
});

Cypress.Commands.add('updateAppealDetails', (reference, caseDetails) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = details.appealId;
		const appellantCaseId = details.appellantCaseId;
		return await appealsApiClient.updateAppealCases(appealId, appellantCaseId, caseDetails);
	});
});

Cypress.Commands.add('updateTimeTableDetails', (reference, timeTableDetails) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		const appealTimetableId = await details.appealTimetable.appealTimetableId;
		return await appealsApiClient.updateTimeTable(appealId, appealTimetableId, timeTableDetails);
	});
});

Cypress.Commands.add('simulateHearingElapsed', (reference) => {
	return cy.wrap(null).then(async () => {
		return appealsApiClient.simulateHearingElapsed(reference).then(() => {
			cy.log(`Simulated hearing elapsed for case ref ${reference}`);
		});
	});
});

Cypress.Commands.add('navigateToAppealDetailsPage', (reference) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		cy.visit(`appeals-service/appeal-details/${appealId}`);
	});
});

Cypress.Commands.add('addInquiryViaApi', (reference, date) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		return await appealsApiClient.addInquiry(appealId, date);
	});
});

Cypress.Commands.add('addEstimateViaApi', (procedureType, reference, estimate = null) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		console.log(estimate);
		return await appealsApiClient.addEstimate(procedureType, appealId, estimate);
	});
});

Cypress.Commands.add('deleteEstimateViaApi', (procedureType, reference) => {
	return cy.wrap(null).then(async () => {
		const details = await appealsApiClient.loadCaseDetails(reference);
		const appealId = await details.appealId;
		return await appealsApiClient.deleteEstimate(procedureType, appealId);
	});
});
