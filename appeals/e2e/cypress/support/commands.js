// @ts-nocheck
import { BrowserAuthData } from '../fixtures/browser-auth-data';
import { appealsApiClient } from './appealsApiClient';

const cookiesToSet = ['domain', 'expiry', 'httpOnly', 'path', 'secure'];

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
	cy.task('CookiesFileExists', user.id).then((exists) => {
		if (!exists) {
			cy.log(`No cookies 🍪 found!\nLogging in as: ${user.id}`);
			cy.loginWithPuppeteer(user);
		} else {
			cy.log(`Found some cookies! 🍪\nSetting cookies for: ${user.id}`);
			setLocalCookies(user.id);
		}
	});
});

Cypress.Commands.add('loginWithPuppeteer', (user) => {
	var config = {
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
			if (cookiesToSet.includes(cookie.name)) {
				cy.getCookie(cookie.name).should('not.be.empty');
			}
		});
	});

	return;
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
			if (cookiesToSet.includes(cookie.name)) {
				cy.getCookie(cookie.name).should('not.be.empty');
			}
		});
	});
}

Cypress.Commands.add('setCurrentCookies', (cookies) => {
	cookies.forEach((cookie) => {
		cy.clearCookies();
		cy.setCookie(cookie.name, cookie.value, {
			domain: cookie.domain,
			expiry: cookie.expiry,
			httpOnly: cookie.httpOnly,
			path: cookie.path,
			secure: cookie.secure
		});
		Cypress.Cookies.preserveOnce(cookie.name);
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

Cypress.Commands.add('checkNotifySent', (reference, templates) => {
	const expectedTemplates = [].concat(templates);

	return cy.wrap(null).then(async () => {
		// returns an array of email objects sent for the given reference
		const emails = await appealsApiClient.getNotifyEmails(reference);

		// creates an array of unique sent email templates that match expected
		const foundTemplateNames = [...new Set(emails.map((email) => email.template))];

		// creates a list of expected templates that were not found
		const missingTemplates = expectedTemplates.filter(
			(expected) => !foundTemplateNames.includes(expected)
		);

		expect(missingTemplates, `Expected, but not found:${missingTemplates}`).to.be.empty;
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
