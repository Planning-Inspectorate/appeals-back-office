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
import { startCaseTimetableItems } from '../../support/timetables.js';
import { formatDateAndTime, formatObjectAsString } from '../../support/utils/format';

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

	const inquiryAddress = {
		line1: 'e2e Inquiry Test Address',
		line2: 'Inquiry Street',
		town: 'Inquiry Town',
		county: 'Somewhere',
		postcode: 'BS20 1BS'
	};

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

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.validateAppeal(caseObj);

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

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.validateAppeal(caseObj);

			happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
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

			// Assign Case Officer Via API
			cy.assignCaseOfficerViaApi(caseObj);

			// Validate Appeal Via API
			cy.validateAppeal(caseObj);

			happyPathHelper.startCaseWithProcedureType(caseObj, 'written');
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
			cy.validateAppeal(caseObj);

			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.clickReadyToStartCase();
			caseDetailsPage.selectRadioButtonByValue('Hearing');
			caseDetailsPage.clickButtonByText('Continue');
			caseDetailsPage.selectRadioButtonByValue('no');
			caseDetailsPage.clickButtonByText('Continue');
			estimatedDaysSection.selectEstimatedDaysOption('No');
			caseDetailsPage.clickButtonByText('Continue');
			cyaSection.verifyCheckYourAnswers(
				'Do you know the expected number of days to carry out the hearing?',
				'No'
			);
			cy.contains(
				'dt.govuk-summary-list__key',
				'Expected number of days to carry out the hearing'
			).should('not.exist');
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
			cy.validateAppeal(caseObj);

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
				estimatedDaysSection.selectEstimatedDaysOption('Yes');
				estimatedDaysSection.enterEstimatedHearingDays(6);
				caseDetailsPage.clickButtonByText('Continue');

				// Set exact time and date format for assertions
				const expectedDateTime = formatDateAndTime(date);
				cyaSection.verifyCheckYourAnswers(
					'Do you know the expected number of days to carry out the hearing?',
					'Yes'
				);
				cyaSection.verifyCheckYourAnswers('Expected number of days to carry out the hearing', '6');
				cyaSection.verifyPreviewEmail('appellant', true, { date: expectedDateTime.date });
				cyaSection.verifyPreviewEmail('lpa', true, { date: expectedDateTime.date });
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
			cy.validateAppeal(caseObj);

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

				// enter an address
				addressSection.selectAddressOption('Yes');
				addressSection.clickButtonByText('Continue');
				addressSection.enterAddress(inquiryAddress);
				addressSection.clickButtonByText('Continue');

				// enter timetable dates
				cy.getBusinessActualDate(new Date(), safeAddedDays + 2).then((startDate) => {
					dateTimeSection.enterInquiryDueDates(startCaseTimetableItems, startDate, 7);
				});

				dateTimeSection.clickButtonByText('Continue');

				const appealDetails = {
					date: expectedDateTime.date,
					time: expectedDateTime.time,
					expectedDays: 6,
					venueAddress: formatObjectAsString(inquiryAddress, ', ')
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
			cy.validateAppeal(caseObj);

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
					dateTimeSection.enterInquiryDueDates(startCaseTimetableItems, startDate, 7);
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
