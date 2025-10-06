// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CYASection } from '../../page_objects/cyaSection';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const cyaSection = new CYASection();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();

describe('Start case', () => {
	const expectedNotifies = {
		Household: [
			{
				template: 'appeal-valid-start-case-appellant',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		],
		PlanningAppeal: [
			{
				template: 'appeal-valid-start-case-s78-appellant',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-s78-lpa',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		],
		PlanningAppealHearing: [
			{
				template: 'appeal-valid-start-case-s78-appellant-hearing',
				recipient: 'appellant@test.com'
			},
			{
				template: 'appeal-valid-start-case-s78-lpa-hearing',
				recipient: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
			}
		]
	};

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	it('Start case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseRef, expectedNotifies.Household);
		});
	});

	it('Start S78 case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startS78Case(caseRef, 'written');
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseRef, expectedNotifies.PlanningAppeal);
		});
	});

	it('Start S20 Listed Building case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'Y'
		}).then((caseRef) => {
			happyPathHelper.assignCaseOfficer(caseRef);
			happyPathHelper.reviewAppellantCase(caseRef);
			happyPathHelper.startCase(caseRef);
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.verifyAppealType('Planning listed building and conservation area appeal');
			cy.loadAppealDetails(caseRef).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseRef, expectedNotifies.PlanningAppeal);
		});
	});

	it('S78 hearing case - start appeal without scheduled hearing', () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			happyPathHelper.viewCaseDetails(caseRef);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseRef);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseRef, { validationOutcome: 'valid', validAt: date });
			});
			cy.reload();

			happyPathHelper.viewCaseDetails(caseRef);
			caseDetailsPage.clickReadyToStartCase();
			procedureTypePage.selectProcedureType('hearing');
			caseDetailsPage.selectRadioButtonByValue('no');
			caseDetailsPage.clickButtonByText('Continue');
			cyaSection.verifyPreviewEmail('appellant');
			cyaSection.verifyPreviewEmail('lpa');
			caseDetailsPage.clickButtonByText('Start case');

			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

			cy.checkNotifySent(caseRef, expectedNotifies.PlanningAppeal);
		});
	});

	it('S78 hearing case - start appeal with scheduled hearing', () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((caseRef) => {
			happyPathHelper.viewCaseDetails(caseRef);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseRef);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseRef, { validationOutcome: 'valid', validAt: date });
			});

			cy.reload();

			happyPathHelper.viewCaseDetails(caseRef);
			caseDetailsPage.clickReadyToStartCase();
			caseDetailsPage.selectRadioButtonByValue('hearing');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('yes');
			caseDetailsPage.clickButtonByText('Continue');

			cy.getBusinessActualDate(new Date(), 2).then((date) => {
				dateTimeSection.enterHearingDate(date);
				dateTimeSection.enterHearingTime(date.getHours(), date.getMinutes());
				caseDetailsPage.clickButtonByText('Continue');

				// Set exact time and date format for assertions
				const expectedDateTime = formatDateAndTime(date, true);
				cyaSection.verifyPreviewEmail('appellant', true, expectedDateTime);
				cyaSection.verifyPreviewEmail('lpa', true, expectedDateTime);
				caseDetailsPage.clickButtonByText('Start case');

				caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
				caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
			});

			cy.checkNotifySent(caseRef, expectedNotifies.PlanningAppealHearing);
		});
	});
});
