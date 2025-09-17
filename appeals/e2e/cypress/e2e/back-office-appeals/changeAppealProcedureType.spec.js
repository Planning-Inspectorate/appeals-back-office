// @ts-nocheck
/// <reference types="cypress"/>

import { users } from '../../fixtures/users';
import { OverviewSectionPage } from '../../page_objects/caseDetails/overviewSectionPage';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage.js';
import { CYASection } from '../../page_objects/cyaSection.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { ProcedureTypePage } from '../../page_objects/procedureTypePage';
import { happyPathHelper } from '../../support/happyPathHelper.js';
import { formatDateAndTime, getDateAndTimeValues } from '../../support/utils/format';

const overviewSectionPage = new OverviewSectionPage();
const caseDetailsPage = new CaseDetailsPage();
const procedureTypePage = new ProcedureTypePage();
const dateTimeSection = new DateTimeSection();
const cyaSection = new CYASection();

describe('change appeal procedure types', () => {
	let caseRef;

	const overviewDetails = {
		appealType: 'Planning appeal',
		applicationReference: '123',
		allocationLevel: 'No allocation level for this appeal',
		linkedAppeals: 'No linked appeals',
		relatedAppeals: '1000000',
		netGainResidential: 'Not provided'
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

	const procedureTypeCaption = () => `Appeal ${caseRef} - update appeal procedure`;

	beforeEach(() => {
		setupTestCase();
	});

	it('should change appeal procedure type - written in LPAQ state', () => {
		happyPathHelper.startS78Case(caseRef, 'written');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

		const writtenDetails = { ...overviewDetails, appealProcedure: 'Written' };
		overviewSectionPage.verifyCaseOverviewDetails(writtenDetails);

		overviewSectionPage.clickRowChangeLink('case-procedure');

		procedureTypePage.verifyHeader(procedureTypeCaption());
		procedureTypePage.selectProcedureType('written');

		// verify previous values are prepopulated
		cy.loadAppealDetails(caseRef).then((appealDetails) => {
			procedureTypePage.verifyHeader(procedureTypeCaption());
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

	it('should change appeal procedure type - hearing in LPAQ state', () => {
		happyPathHelper.startS78Case(caseRef, 'hearing');
		caseDetailsPage.checkStatusOfCase('LPA questionnaire', 0);

		const hearingDetails = { ...overviewDetails, appealProcedure: 'Hearing' };
		overviewSectionPage.verifyCaseOverviewDetails(hearingDetails);

		overviewSectionPage.clickRowChangeLink('case-procedure');

		procedureTypePage.verifyHeader(procedureTypeCaption());
		procedureTypePage.selectProcedureType('hearing');

		// verify previous values are prepopulated
		cy.loadAppealDetails(caseRef).then((appealDetails) => {
			procedureTypePage.verifyHeader(procedureTypeCaption());
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

			// update statement of common ground due date and check CYA page
			cy.getBusinessActualDate(new Date(), 60).then((dueDate) => {
				caseDetailsPage.changeTimetableDates(timetableItems.slice(1, 2), dueDate, 0); //update and continue
				const updateStatementOfCommonGroundDueDate = new Date(dueDate);

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
			});
		});
	});

	const setupTestCase = () => {
		cy.login(users.appeals.caseAdmin);
		cy.createCase({ caseType: 'W' }).then((ref) => {
			caseRef = ref;
			cy.addLpaqSubmissionToCase(caseRef);
			happyPathHelper.assignCaseOfficer(caseRef);
			caseDetailsPage.checkStatusOfCase('Validation', 0);
			happyPathHelper.reviewAppellantCase(caseRef);
			caseDetailsPage.checkStatusOfCase('Ready to start', 0);
		});
	};
});
