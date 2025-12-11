// @ts-nocheck
import { BrowserAuthData } from '../../fixtures/browser-auth-data';

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

// LOGIN AND AUTHENTICATION

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
