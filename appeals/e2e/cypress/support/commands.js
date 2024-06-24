// @ts-nocheck
import { BrowserAuthData } from '../fixtures/browser-auth-data';
import { requestWithRetry } from './utils/requestWithRetry.js';
import { urlPaths } from './url-paths.js';

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
	const loginUrl = urlPaths.appealsList;

	return cy
		.wrap(
			requestWithRetry(loginUrl, {}, 3)
				.then((response) => {
					cy.log('Request succeeded, no auth required:', response);
					return null;
				})
				.catch((response) => {
					cy.log('Request failed after 3 retries, auth required:', response);
					return response;
				})
		)
		.then((result) => {
			// Check if the previous promise resolved to null (no auth required)
			if (result === null) {
				return;
			}

			// Continue with the remaining logic if auth is required
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
	return cy.get(`[data-cy=${value}]`);
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
