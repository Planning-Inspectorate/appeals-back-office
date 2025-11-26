# Cypress E2E Automation testing

These Cypress tests form the highest level of the automation test pryimid, running through the browser and testing entire journeys. They are designed to give the highest level of confidence that no regressions have been introduced into the system by running through a complete set of high level journeys. However this does mean that they are likely to take longer to run than lower level forms of testing (e.g. unit or integration)

## Usage

### Run all tests 

Tests can be run using various modes depending on requirement 

#### Headless mode 

The following commands will run tests for different environments 

```
cy:run - run tests for local  
cy:run:dev - run tests for dev 
cy:run:test - run tests for test 
```

#### Interactive mode 

The following commands will launch the test runner for different environments 

```
cy:open - run tests for local  
cy:open:dev - run tests for dev 
cy:open:test - run tests for test 
```

#### CI mode 

The tests can also be run as per CI (continues integration) - i.e. as would be in the pipeline 

```
cy:ci:local - run tests for local  
cy:ci:dev - run tests for dev 
cy:ci:test - run tests for test 
```

### Run only smoke tests (sub-set)

`npm run cy:run-smoke` (Headless)\
`npm run cy:open-smoke` (Interactive mode)

Alternatively you can run tests from the root via `npm run e2e` or `npm run e2e:open` to run in interactive mode.

## Generating test data 

There is a secondary suite of tests which can be used to create and delete test appeals - these can be found in the `back-office-test-data-generation` folder in `cypress/e2e` 
It functions as with the main test suite, in that can launch the cypress UI in an environment and select a spec to run depending on which case type you want to create 

Commands to open 
```
cy:open:test:data:generation: local,
cy:open:test:data:generation:dev: dev
cy:open:test:data:generation:test: test
cy:open:test:data:generation:staging: staging
```

Then select the spec required and it should then run and generate output confirming the test appeal that was created 

### Configuring specs 

In each spec there is a configuration object `testCaseConfig` which determines how the test appeal is created - this can be updated as required before running the test 
For deleting appeals update the `testAppealsIdsToDelete` list with id's of appeals that wish to delete 

## Getting Started

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/) (installation through a Node version manager such as [Nvm](https://github.com/nvm-sh/nvm) is recommended)

### Setup .env file

Create a file called `.env` in this directory, using `.env.sample` as a starting point

To run Cypress tests from your machine against the test enviroment, you'll need to set `BASE_URL` to be the URL of the Appeals back-office. Speak to another tester or developer to obtain the other values.

You should now be able to run tests against a remote environment (e.g. test)

## Advanced: Running tests against local environment

In order to run tests against Appeals back-office running on your local machine you'll first need to complete both the [basic](https://github.com/Planning-Inspectorate/appeals-back-office/blob/main/docs/basic-setup.md) and [advanced](https://github.com/Planning-Inspectorate/appeals-back-office/blob/main/docs/advanced-setup.md) setup guides.

The tests rely on Entra being used so that the correct users can be obtained and used as part of the tests.

### Tips

- Ensure that you've run `npm ci`, otherwise NPM won't have installed the packages used by Cypress and you'll get an error when trying to run

## Running smoke tests only (tags)

By default all tests are run as the full **regression test** suite. However it's also possible to run a sub-set, should as the **smoke tests** only which are designed to quickly give confidence that basic functionality is working.

The [Cypress Grep package](https://github.com/cypress-io/cypress/tree/develop/npm/grep) is used to provide this functionality. Tags that feature a tag have it indicated after the test name, such as

```
it('Test name', { tags: tag.smoke }, () => {
	/* Test goes here */
}
```

To only run **smoke tests** the following command would be used

```
npx cypress run --env grepTags="smoke"
```

## Architecture

All tests are defined within the `*.spec.js` files. These in turn should use files within the `/page_object` directory to interact with the page.

Every test is designed to be [fully idependent](https://docs.cypress.io/guides/references/best-practices#Having-Tests-Rely-On-The-State-Of-Previous-Tests) and able to run in isolation. In order to allow this a series of [custom Cypress Commands](https://docs.cypress.io/api/cypress-api/custom-commands) have been created that are defined in the `support/commands.js` file.

### Dynamic data creation

`cy.createCase()` creates a new valid appeal and returns the newly generate case reference. Because it runs async it requires the test code that makes use of the returned case ref to be enclosed within it. In the following example a new appeal is generated, the all cases page loaded and then the newly generated appeal is clicked on.

```
cy.createCase().then((caseRef) => {
	cy.visit('appeals-service/all-cases');
	listCasesPage.clickAppealByRef(caseRef);
});
```

The newly generated appeal is created by calling the Appeals API using the same methods called by the Functions triggered by incoming Service Bus messages from the front office. The default JSON used when making this call is held within `fixtures/appealsApiRequests.js`

It is possible to override the default request used when generating a new appeal. The following example loads the default new appeal request and then modifies the postcode. This will then create a new appeal with this postcode which is then used within the test to perform a search on that specific postcode.

```
const postcode = 'XX12 3XX';
let requestBody = appealsApiRequests.caseSubmission;
requestBody.casedata.siteAddressPostcode = postcode;

cy.createCase(requestBody).then((caseRef) => {
	cy.visit('appeals-service/all-cases');
	listCasesPage.nationalListSearch(postcode);
});
```

`cy.addLpaqSubmissionToCase()` is used to add an LPAQ submission to an existing case, so will always be used after a call to `cy.createCase()`. The case reference must be passed in to identify the case it should be added to.

In the following example a new appeal is created and then an LPAQ submission is added immediately to it.

```
cy.createCase().then((caseRef) => {
	cy.addLpaqSubmissionToCase(caseRef).then(() => {
		cy.visit('appeals-service/all-cases');
		listCasesPage.clickAppealByRef(caseRef);
	});
});
```

### Folder structure

```
Cypress/
├── downloads/       				- Temporary file downloads used during tests
├── e2e/back-office-appeals         - Test specifications
├── fixtures/        				- Fixtures are fixed sets of data used by tests
├── page_objects/    				- Used by test spec files to interact with pages being tested
├── plugins/						-
├── screenshots/					- Stores screenshots taken by Cypress during test runs
└── support/						- Utilities and scripts that enhance the testing setup
```
