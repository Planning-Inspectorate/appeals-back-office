// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { AddressSection } from '../../page_objects/addressSection.js';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeQuestionPage } from '../../page_objects/dateTimeQuestionPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { EstimatedDaysSection } from '../../page_objects/estimatedDaysSection.js';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime, getDateAndTimeValues } from '../../support/utils/format';

const overviewSectionPage = new OverviewSectionPage();
const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const estimatedDaysSection = new EstimatedDaysSection();
const addressSection = new AddressSection();
const cyaSection = new CYASection();
const dateTimeQuestionPage = new DateTimeQuestionPage();
const currentDate = new Date();

describe('change appeal procedure types', () => {
	let caseObj;

	const overviewDetails = {
		appealType: 'Planning appeal',
		applicationReference: '123',
		allocationLevel: 'No allocation level for this appeal',
		linkedAppeals: 'No linked appeals',
		relatedAppeals: '1000000',
		netGainResidential: 'Not provided'
	};

	const inquiryAddress = {
		line1: 'e2e Inquiry Test Address',
		line2: 'Inquiry Street',
		town: 'Inquiry Town',
		county: 'Somewhere',
		postcode: 'BS20 1BS'
	};

	const emptyAddress = {
		line1: '',
		line2: '',
		town: '',
		county: '',
		postcode: ''
	};

	const defaultEventDateTime = {
		day: '',
		month: '',
		year: '',
		hours: '10',
		minutes: '0'
	};

	const timetableItems = [
		{
			row: 'final-comments-due-date',
			editable: true
		},
		{
			row: 'statement-of-common-ground-due-date',
			editable: true
		}
	];

	beforeEach(() => {
		setupTestCase();
	});

	let appeal;

	afterEach(() => {
		cy.deleteAppeals(appeal);
	});

	it('should change appeal procedure type - hearing to inquiry', () => {
		// caption that should be shown when changing appeal procedure type
		const procedureTypeCaption = `Appeal ${caseObj.reference} - update appeal procedure`;

		happyPathHelper.startS78Case(caseObj, 'hearing');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

		const writtenDetails = { ...overviewDetails, appealProcedure: 'Hearing' };
		overviewSectionPage.verifyCaseOverviewDetails(writtenDetails, false);

		overviewSectionPage.clickRowChangeLink('case-procedure');

		// verify procedure page header and preselected value
		procedureTypePage.verifyHeader(procedureTypeCaption);
		procedureTypePage.verifySelectedRadioButtonValue('Hearing');
		procedureTypePage.selectProcedureType('inquiry');

		// enter inquiry date
		cy.getBusinessActualDate(currentDate, 1).then((date) => {
			// verify prepopulated values
			dateTimeSection.verifyPrepopulatedEventValues(defaultEventDateTime);
			dateTimeSection.enterEventDate(date);
			dateTimeSection.clickButtonByText('Continue');

			// verify estimated days is not prepopulated and enter estimated days
			estimatedDaysSection.selectEstimatedDaysOption('Yes');
			estimatedDaysSection.verifyPrepopulatedValue('', true);
			estimatedDaysSection.enterEstimatedDays(6);
			estimatedDaysSection.clickButtonByText('Continue');

			// verify address is not prepopulated and enter address
			addressSection.selectAddressOption('Yes');
			addressSection.clickButtonByText('Continue');

			addressSection.verifyPrepopulatedValues(emptyAddress);
			addressSection.enterAddress(inquiryAddress);
			addressSection.clickButtonByText('Continue');

			// verify previous date values are prepopulated for timetable
			cy.loadAppealDetails(caseObj).then((appealDetails) => {
				procedureTypePage.verifyHeader(procedureTypeCaption);
				const appealTimetable = appealDetails?.appealTimetable;
				cy.log('** appealTimetable - ', JSON.stringify(appealTimetable));
				const lpaQuestionnaireDueDate = new Date(appealTimetable.lpaQuestionnaireDueDate);
				const lpaStatementDueDate = new Date(appealTimetable.lpaStatementDueDate);
				const ipCommentsDueDate = new Date(appealTimetable.ipCommentsDueDate);

				dateTimeSection.verifyPrepopulatedTimeTableDueDates(
					'lpaQuestionnaireDueDate',
					getDateAndTimeValues(lpaQuestionnaireDueDate)
				);
				dateTimeSection.verifyPrepopulatedTimeTableDueDates(
					'lpaStatementDueDate',
					getDateAndTimeValues(lpaStatementDueDate)
				);
				dateTimeSection.verifyPrepopulatedTimeTableDueDates(
					'ipCommentsDueDate',
					getDateAndTimeValues(ipCommentsDueDate)
				);

				// enter POE date, ensure is business day
				cy.getBusinessActualDate(ipCommentsDueDate, 10).then((date) => {
					const proofOfEvidenceDate = date;
					dateTimeSection.enterProofOfEvidenceAndWitnessesDueDate(proofOfEvidenceDate);

					// proceed to cya page and check answers
					dateTimeSection.clickButtonByText('Continue');

					cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Inquiry');
					cyaSection.verifyCheckYourAnswers(
						'LPA questionnaire due',
						formatDateAndTime(lpaQuestionnaireDueDate).date
					);
					cyaSection.verifyCheckYourAnswers(
						'Statements due',
						formatDateAndTime(lpaStatementDueDate).date
					);
					cyaSection.verifyCheckYourAnswers(
						'Statement of common ground due',
						formatDateAndTime(ipCommentsDueDate).date
					);
					cyaSection.verifyCheckYourAnswers(
						'Proof of evidence and witnesses due',
						formatDateAndTime(proofOfEvidenceDate).date
					);
				});
			});
		});
	});

	it('change appeal procedure type - should not allow change procedure after statements have been shared', () => {
		happyPathHelper.startS78Case(caseObj, 'hearing');

		// progress to statements shared status
		happyPathHelper.reviewLPaStatement(caseObj);

		// should not be able to see change procedure link
		overviewSectionPage.verifyChangeLinkVisibility(
			overviewSectionPage.overviewSectionSelectors.changeProcedureType,
			false
		);
	});

	it('should change appeal procedure type - written (in LPAQ state) to written', () => {
		// caption that should be shown when changing appeal procedure type
		const procedureTypeCaption = `Appeal ${caseObj.reference} - update appeal procedure`;

		happyPathHelper.startS78Case(caseObj, 'written');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

		const writtenDetails = { ...overviewDetails, appealProcedure: 'Written' };
		overviewSectionPage.verifyCaseOverviewDetails(writtenDetails, false);

		overviewSectionPage.clickRowChangeLink('case-procedure');

		procedureTypePage.verifyHeader(procedureTypeCaption);
		procedureTypePage.selectProcedureType('written');

		// verify previous values are prepopulated
		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			procedureTypePage.verifyHeader(procedureTypeCaption);
			const appealTimetable = appealDetails?.appealTimetable;
			const lpaQuestionnaireDueDate = new Date(appealTimetable.lpaQuestionnaireDueDate);
			const lpaStatementDueDate = new Date(appealTimetable.lpaStatementDueDate);
			const ipCommentsDueDate = new Date(appealTimetable.ipCommentsDueDate);

			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'lpaQuestionnaireDueDate',
				getDateAndTimeValues(lpaQuestionnaireDueDate)
			);
			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'lpaStatementDueDate',
				getDateAndTimeValues(lpaStatementDueDate)
			);
			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'ipCommentsDueDate',
				getDateAndTimeValues(ipCommentsDueDate)
			);

			// update final comments due date and check CYA page
			cy.getBusinessActualDate(new Date(), 60).then((dueDate) => {
				caseDetailsPage.changeTimetableDates(timetableItems.slice(0, 1), dueDate, 0); //update and continue
				const updateFinalCommentsDueDate = new Date(dueDate);

				cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Written representations');

				cyaSection.verifyCheckYourAnswers(
					'LPA questionnaire due',
					formatDateAndTime(lpaQuestionnaireDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Statements due',
					formatDateAndTime(lpaStatementDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Interested party comments due',
					formatDateAndTime(ipCommentsDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Final comments due',
					formatDateAndTime(updateFinalCommentsDueDate).date
				);
			});
		});
	});

	it('should change appeal procedure type - hearing (in LPAQ state) to hearing', () => {
		// caption that should be shown when changing appeal procedure type
		const procedureTypeCaption = `Appeal ${caseObj.reference} - update appeal procedure`;

		happyPathHelper.startS78Case(caseObj, 'hearing');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

		// Add planning obligation
		cy.updateAppealDetails(caseObj, { planningObligation: true });
		cy.getBusinessActualDate(currentDate, 1).then((date) => {
			cy.updateTimeTableDetails(caseObj, { planningObligationDueDate: date });
		});

		const hearingDetails = { ...overviewDetails, appealProcedure: 'Hearing' };
		overviewSectionPage.verifyCaseOverviewDetails(hearingDetails, false);

		overviewSectionPage.clickRowChangeLink('case-procedure');

		procedureTypePage.verifyHeader(procedureTypeCaption);
		procedureTypePage.selectProcedureType('hearing');

		dateTimeQuestionPage.selectDateTimeOption('No');
		dateTimeQuestionPage.clickButtonByText('Continue');

		// verify previous values are prepopulated
		cy.loadAppealDetails(caseObj).then((appealDetails) => {
			procedureTypePage.verifyHeader(procedureTypeCaption);
			const appealTimetable = appealDetails?.appealTimetable;
			const lpaQuestionnaireDueDate = new Date(appealTimetable.lpaQuestionnaireDueDate);
			const lpaStatementDueDate = new Date(appealTimetable.lpaStatementDueDate);
			const ipCommentsDueDate = new Date(appealTimetable.ipCommentsDueDate);
			const statementOfCommonGroundDueDate = new Date(
				appealTimetable.statementOfCommonGroundDueDate
			);
			const planningObligationDueDate = new Date(appealTimetable.planningObligationDueDate);

			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'lpaQuestionnaireDueDate',
				getDateAndTimeValues(lpaQuestionnaireDueDate)
			);
			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'lpaStatementDueDate',
				getDateAndTimeValues(lpaStatementDueDate)
			);
			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'ipCommentsDueDate',
				getDateAndTimeValues(ipCommentsDueDate)
			);
			dateTimeSection.verifyPrepopulatedTimeTableDueDates(
				'planningObligationDueDate',
				getDateAndTimeValues(planningObligationDueDate)
			);

			// update statement of common ground due date and check CYA page
			cy.getBusinessActualDate(new Date(), 10).then((dueDate) => {
				dateTimeSection.enterDueDates(timetableItems.slice(1, 2), dueDate, 0);
				dateTimeSection.clickButtonByText('Continue');
				const updateStatementOfCommonGroundDueDate = new Date(dueDate);

				cyaSection.verifyCheckYourAnswers('Appeal procedure', 'Hearing');

				cyaSection.verifyCheckYourAnswers(
					'LPA questionnaire due',
					formatDateAndTime(lpaQuestionnaireDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Statements due',
					formatDateAndTime(lpaStatementDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Interested party comments due',
					formatDateAndTime(ipCommentsDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Statement of common ground due',
					formatDateAndTime(updateStatementOfCommonGroundDueDate).date
				);
				cyaSection.verifyCheckYourAnswers(
					'Planning obligation due',
					formatDateAndTime(planningObligationDueDate).date
				);
			});
		});
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseObj = ref;
			appeal = caseObj;
			cy.addLpaqSubmissionToCase(caseObj);
			cy.assignCaseOfficer(caseObj);
			happyPathHelper.viewCaseDetails(caseObj);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseObj);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		});
	};
});
