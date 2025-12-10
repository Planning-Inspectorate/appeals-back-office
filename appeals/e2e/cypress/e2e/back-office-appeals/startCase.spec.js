// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AddressSection } from '../../page_objects/addressSection.js';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CYASection } from '../../page_objects/cyaSection';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { EstimatedDaysSection } from '../../page_objects/estimatedDaysSection.js';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import { happyPathHelper } from '../../support/happyPathHelper';
import { tag } from '../../support/tag';
import { formatDateAndTime } from '../../support/utils/format';

const caseDetailsPage = new CaseDetailsPage();
const cyaSection = new CYASection();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const estimatedDaysSection = new EstimatedDaysSection();
const addressSection = new AddressSection();

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

	const timetableItems = [
		{
			row: 'lpa-questionnaire-due-date',
			editable: true
		},
		{
			row: 'statement-due-date',
			editable: true
		},
		{
			row: 'ip-comments-due-date',
			editable: true
		},
		{
			row: 'statement-of-common-ground-due-date',
			editable: true
		},
		{
			row: 'proof-of-evidence-and-witnesses-due-date',
			editable: true
		}
	];

	const safeAddedDays = 7;

	beforeEach(() => {
		cy.login(users.appeals.caseAdmin);
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('Start case', { tags: tag.smoke }, () => {
		cy.createCase().then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseObj, expectedNotifies.Household);
		});
	});

	it('Start S78 case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'W'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startS78Case(caseObj, 'written');
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppeal);
		});
	});

	it('Start S20 Listed Building case', { tags: tag.smoke }, () => {
		cy.createCase({
			caseType: 'Y'
		}).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.assignCaseOfficer(caseObj);
			happyPathHelper.reviewAppellantCase(caseObj);
			happyPathHelper.startCase(caseObj);
			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.verifyAppealType('Planning listed building and conservation area appeal');
			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				const startedAt = appealDetails?.startedAt;
				expect(startedAt).to.not.be.null;
			});

			cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppeal);
		});
	});

	it('S78 hearing case - start appeal without scheduled hearing', () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.viewCaseDetails(caseObj);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
			});
			cy.reload();

			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.clickReadyToStartCase();
			caseDetailsPage.selectRadioButtonByValue('Hearing');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('no');
			caseDetailsPage.clickButtonByText('Continue');
			cyaSection.verifyPreviewEmail('appellant');
			cyaSection.verifyPreviewEmail('lpa');
			caseDetailsPage.clickButtonByText('Start case');

			caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
			caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

			cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppeal);
		});
	});

	it('S78 hearing case - start appeal with scheduled hearing', () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.viewCaseDetails(caseObj);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
			});

			cy.reload();

			happyPathHelper.viewCaseDetails(caseObj);
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
				const expectedDateTime = formatDateAndTime(date);
				cyaSection.verifyPreviewEmail('appellant', true, expectedDateTime);
				cyaSection.verifyPreviewEmail('lpa', true, expectedDateTime);
				caseDetailsPage.clickButtonByText('Start case');

				caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
				caseDetailsPage.validateBannerMessage('Success', 'Timetable started');
			});

			cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppealHearing);
		});
	});

	it('S78 can start case as inquiry with address', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.viewCaseDetails(caseObj);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
			});

			cy.reload();

			happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');

			// enter inquiry date and time
			cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
				//set to midday
				inquiryDate.setHours(12);

				// Set exact time and date format for assertions
				const expectedDateTime = formatDateAndTime(inquiryDate);
				cy.log('expectedDateTime', inquiryDate.toLocaleString());

				dateTimeSection.enterInquiryDate(inquiryDate);
				dateTimeSection.enterInquiryTime(inquiryDate.getHours(), inquiryDate.getMinutes());

				dateTimeSection.clickButtonByText('Continue');

				// enter estimated days
				estimatedDaysSection.selectEstimatedDaysOption('Yes');
				estimatedDaysSection.enterEstimatedInquiryDays(6);
				estimatedDaysSection.clickButtonByText('Continue');

				// do not enter an address
				addressSection.selectAddressOption('Yes');
				addressSection.clickButtonByText('Continue');
				addressSection.enterAddress();

				// enter timetable dates
				cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
					dateTimeSection.enterInquiryDueDates(timetableItems, startDate, 7);
					//inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
				});

				dateTimeSection.clickButtonByText('Continue');

				const appealDetails = {
					date: expectedDateTime.date,
					time: expectedDateTime.time,
					expectedDays: 6
				};

				// check email previews
				cyaSection.verifyPreviewEmail('appellant', true, appealDetails);
				cyaSection.verifyPreviewEmail('lpa', true, appealDetails);
			});
		});
	});

	it('S78 can start case as inquiry without address', () => {
		cy.createCase({ caseType: 'W' }).then((caseObj) => {
			appeal = caseObj;
			happyPathHelper.viewCaseDetails(caseObj);

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.getBusinessActualDate(new Date(), 0).then((date) => {
				cy.updateAppealDetailsViaApi(caseObj, { validationOutcome: 'valid', validAt: date });
			});

			cy.reload();

			happyPathHelper.startS78InquiryCase(caseObj, 'inquiry');

			// enter inquiry date and time
			cy.getBusinessActualDate(new Date(), 28).then((inquiryDate) => {
				//set to midday
				inquiryDate.setHours(12);

				// Set exact time and date format for assertions
				const expectedDateTime = formatDateAndTime(inquiryDate);
				cy.log('expectedDateTime', inquiryDate.toLocaleString());

				dateTimeSection.enterInquiryDate(inquiryDate);
				dateTimeSection.enterInquiryTime(inquiryDate.getHours(), inquiryDate.getMinutes());

				dateTimeSection.clickButtonByText('Continue');

				// enter estimated days
				estimatedDaysSection.selectEstimatedDaysOption('Yes');
				estimatedDaysSection.enterEstimatedInquiryDays(6);
				estimatedDaysSection.clickButtonByText('Continue');

				// do not enter an address
				addressSection.selectAddressOption('No');
				addressSection.clickButtonByText('Continue');

				// enter timetable dates
				cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
					dateTimeSection.enterInquiryDueDates(timetableItems, startDate, 7);
					//inquirySectionPage.enterTimetableDueDates(timetableItems, startDate, 7);
				});

				dateTimeSection.clickButtonByText('Continue');

				const appealDetails = {
					date: expectedDateTime.date,
					time: expectedDateTime.time,
					expectedDays: 6
				};

				// check email previews
				cyaSection.verifyPreviewEmail('appellant', true, appealDetails);
				cyaSection.verifyPreviewEmail('lpa', true, appealDetails);
			});
		});
	});
});
