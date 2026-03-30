// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AddressSection } from '../../page_objects/addressSection.js';
import { HearingSectionPage } from '../../page_objects/caseDetails/hearingSectionPage.js';
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
const hearingSectionPage = new HearingSectionPage();

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

	it('Start case', () => {
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

	it(
		'S78 hearing case - start appeal with scheduled hearing and estimated days',
		{ tags: tag.smoke },
		() => {
			cy.login(users.appeals.caseAdmin);
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				appeal = caseObj;
				happyPathHelper.viewCaseDetails(caseObj);

				// Assign Case Officer Via API
				cy.assignCaseOfficerViaApi(caseObj);

				// Validate Appeal Via API
				cy.validateAppeal(caseObj);

				cy.getBusinessActualDate(new Date(), 2).then((date) => {
					const estimatedDays = 6;

					happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
						date,
						setEstimatedDays: true,
						estimatedDays,
						startCase: false
					});

					// Set exact time and date format for assertions
					const expectedDateTime = formatDateAndTime(date);

					// verify answers on cya page
					cyaSection.verifyCheckYourAnswers(
						'Do you know the expected number of days to carry out the hearing?',
						'Yes'
					);
					cyaSection.verifyCheckYourAnswers(
						'Expected number of days to carry out the hearing',
						'6'
					);

					// verify oreview email content
					cyaSection.verifyPreviewEmail('appellant', true, { date: expectedDateTime.date });
					cyaSection.verifyPreviewEmail('lpa', true, { date: expectedDateTime.date });
					caseDetailsPage.clickButtonByText('Start case');

					// verify banner messages
					caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
					caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

					// verify hearing details on case details page
					hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
					hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
					hearingSectionPage.verifyHearingValues(
						'whether-the-estimated-number-of-days-is-known-or-not',
						'Yes'
					);
					hearingSectionPage.verifyHearingValues('estimated-days', `${estimatedDays} Days`);
					hearingSectionPage.verifyHearingValues('whether-the-address-is-known-or-not', 'No');
				});

				cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppealHearing);
			});
		}
	);

	it(
		'S78 hearing case - start appeal with scheduled hearing and without estimated days',
		{ tags: tag.smoke },
		() => {
			cy.login(users.appeals.caseAdmin);
			cy.createCase({ caseType: 'W' }).then((caseObj) => {
				appeal = caseObj;
				happyPathHelper.viewCaseDetails(caseObj);

				// Assign Case Officer Via API
				cy.assignCaseOfficerViaApi(caseObj);

				// Validate Appeal Via API
				cy.validateAppeal(caseObj);

				cy.getBusinessActualDate(new Date(), 2).then((date) => {
					happyPathHelper.startS78HearingCase(caseObj, 'hearing', {
						date,
						setEstimatedDays: false,
						startCase: false
					});

					// Set exact time and date format for assertions
					const expectedDateTime = formatDateAndTime(date);

					// verify answers on cya page
					cyaSection.verifyCheckYourAnswers(
						'Do you know the expected number of days to carry out the hearing?',
						'No'
					);

					// verify oreview email content
					cyaSection.verifyPreviewEmail('appellant', true, { date: expectedDateTime.date });
					cyaSection.verifyPreviewEmail('lpa', true, { date: expectedDateTime.date });
					caseDetailsPage.clickButtonByText('Start case');

					// verify banner messages
					caseDetailsPage.validateBannerMessage('Success', 'Appeal started');
					caseDetailsPage.validateBannerMessage('Success', 'Timetable started');

					// verify hearing details on case details page
					hearingSectionPage.verifyHearingValues('date', expectedDateTime.date);
					hearingSectionPage.verifyHearingValues('time', expectedDateTime.time);
					hearingSectionPage.verifyHearingValues(
						'whether-the-estimated-number-of-days-is-known-or-not',
						'No'
					);
					hearingSectionPage.verifyHearingValues('whether-the-address-is-known-or-not', 'No');
				});

				cy.checkNotifySent(caseObj, expectedNotifies.PlanningAppealHearing);
			});
		}
	);

	it('S78 can start case as inquiry with address', { tags: tag.smoke }, () => {
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

	it('S78 can start case as inquiry without address', { tags: tag.smoke }, () => {
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
