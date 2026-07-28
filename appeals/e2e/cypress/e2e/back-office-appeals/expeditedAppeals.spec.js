// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import { ApplicationDecisions, appealPayloadTypes } from '../../support/consts';
import { happyPathHelper } from '../../support/happyPathHelper';

const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();

describe('Part1 (expedited) appeals', () => {
	const baseProcedureTypesItems = [
		{ name: 'hearing', visible: true },
		{ name: 'inquiry', visible: true }
	];

	const expectedProcedureTypesExpedited = [
		...baseProcedureTypesItems,
		{ name: 'writtenPart1', visible: true },
		{ name: 'writtenPart2', visible: true }
	];

	const expectedProcedureTypesNonExpedited = [
		...baseProcedureTypesItems,
		{ name: 'written', visible: true },
		{ name: 'writtenPart1', visible: false },
		{ name: 'writtenPart2', visible: false }
	];

	afterEach(() => {
		/*if (cases.length > 0) {
			cy.deleteAppeals(cases);
		}*/
		cy.deleteAppeals(appeal);
	});

	let caseObj;
	let appeal;
	const appealTypeS78 = 'S78';

	const setupTestCase = ({
		appealType = 'S78FullAppealSubmission',
		caseType = 'W',
		applicationDate = '2026-04-01T00:00:00.000Z',
		applicationDecision = ApplicationDecisions.GRANTED,
		additionalDocs = []
	} = {}) => {
		const basePayload = appealsApiRequests[appealType].casedata;
		const payload = {
			...basePayload,
			caseType,
			applicationDate,
			applicationDecision,
			planningObligation: true,
			eiaScreeningRequired: true
		};

		cy.writeLog(`** Creating case with payload: ${JSON.stringify(payload)} **`);

		cy.login(users.appeals.caseAdmin);
		return cy
			.createCase(
				{
					...payload
				},
				additionalDocs
			)
			.then((ref) => {
				caseObj = ref;
				appeal = caseObj;
				happyPathHelper.assignCaseOfficer(caseObj);
			});
	};

	describe('Appeals valid for expedited process', () => {
		it.only('S78 appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ additionalDocs: [appealsApiRequests.environmentalAssessment] }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(true);

					// check the appellant case payload to ensure the isS78Expedited flag is set to true
					cy.loadAppellantCaseDetails(appealDetails?.appealId, appealDetails?.appellantCaseId).then(
						(appellantCaseDetails) => {
							cy.writeLog(`** appellantCaseDetails ** ${JSON.stringify(appellantCaseDetails)}`);
							expect(appellantCaseDetails?.isS78Expedited).to.equal(true);
							expect(appellantCaseDetails?.typeOfPlanningApplication).to.equal('full-appeal');
						}
					);
				});
			});
		});

		it('S78 outline planning appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ appealType: appealPayloadTypes.OUTLINE_PLANNING_APPEAL_SUBMISSION }).then(
				() => {
					// approve appellant case as valid and set a due date for the questionnaire response
					happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

					// check for expected validation banners on the case details page
					caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
					caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

					// check that part 1 is available as a procedure type option when starting case
					caseDetailsPage.clickReadyToStartCase();
					procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

					// check is set as expedited in appeal details
					cy.loadAppealDetails(caseObj).then((appealDetails) => {
						cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
						expect(appealDetails?.isS78Expedited).to.equal(true);
					});
				}
			);
		});

		it('S78 reserved matters appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({ appealType: appealPayloadTypes.RESERVED_MATTERS_APPEAL_SUBMISSION }).then(
				() => {
					// approve appellant case as valid and set a due date for the questionnaire response
					happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

					// check for expected validation banners on the case details page
					caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
					caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

					// check that part 1 is available as a procedure type option when starting case
					caseDetailsPage.clickReadyToStartCase();
					procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

					// check is set as expedited in appeal details
					cy.loadAppealDetails(caseObj).then((appealDetails) => {
						cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
						expect(appealDetails?.isS78Expedited).to.equal(true);
					});
				}
			);
		});

		it('S78 prior approval appeal submitted on 01-04-2026 should be set as expedited', () => {
			setupTestCase({
				appealType: appealPayloadTypes.PRIOR_APPROVAL_APPEAL_SUBMISSION,
				applicationDecision: ApplicationDecisions.REFUSED
			}).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(true);
				});
			});
		});

		it('S78 appeal submitted after 01-04-2026 should be set as expedited', () => {
			setupTestCase({ applicationDate: '2026-04-02T00:00:00.000Z' }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(true);
				});
			});
		});

		it('S78 appeal submitted on 01-04-2026 as refused should be set as expedited', () => {
			setupTestCase({ applicationDecision: ApplicationDecisions.REFUSED }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

				// check that part 1 is available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesExpedited);

				// check is set as expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(true);
				});
			});
		});
	});

	describe('Appeals not valid for expedited process', () => {
		it('S78 appeal submitted before 01-04-2026 should not be set as expedited', () => {
			setupTestCase({ applicationDate: '2026-03-01T00:00:00.000Z' }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// check for expected validation banners on the case details page
				caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Success', 'Appeal validated');

				// check that part 1 is not available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesNonExpedited);

				// check is set as non-expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(false);
				});
			});
		});

		it('S78 appeal submitted on 01-04-2026 as not received should not be set as expedited', () => {
			setupTestCase({ applicationDecision: ApplicationDecisions.NOT_RECEIVED }).then(() => {
				// approve appellant case as valid and set a due date for the questionnaire response
				happyPathHelper.reviewAppellantCase(caseObj, { loadCaseDetailsPage: false });

				// Note: this is a temporary issue whereby two validation banners are shown,
				// and should be fixed when the ability to start case as expedited is implemented
				//caseDetailsPage.validateBannerMessage('Important', 'Appeal valid');
				caseDetailsPage.validateBannerMessage('Important', 'Appeal validated');

				// check that part 1 is not available as a procedure type option when starting case
				caseDetailsPage.clickReadyToStartCase();
				procedureTypePage.verifyDisplayedProcedureTypes(expectedProcedureTypesNonExpedited);

				// check is set as non-expedited in appeal details
				cy.loadAppealDetails(caseObj).then((appealDetails) => {
					cy.writeLog(`** appealDetails ** ${JSON.stringify(appealDetails)}`);
					expect(appealDetails?.isS78Expedited).to.equal(false);
				});
			});
		});
	});
});
