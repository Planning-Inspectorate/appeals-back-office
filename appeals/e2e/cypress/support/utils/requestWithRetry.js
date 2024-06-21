// @ts-nocheck

function requestWithRetry(url, options = {}, retries = 3) {
	return new Cypress.Promise((resolve, reject) => {
		const attemptRequest = (retryCount) => {
			cy.request({
				url: url,
				...options,
				failOnStatusCode: false // Do not fail the test on non-2xx status codes
			}).then((response) => {
				if (response.status >= 200 && response.status < 300) {
					resolve(response);
				} else if (retryCount > 0) {
					cy.wait(1000); // Optional: add a delay before retrying
					attemptRequest(retryCount - 1);
				} else {
					reject(response);
				}
			});
		};

		attemptRequest(retries);
	});
}

// Export the function so it can be used in tests
module.exports = { requestWithRetry };
