// @ts-nocheck
import { Page } from './basePage';
import { formatDateAndTime } from '../support/utils/formatDateAndTime';

export class DateTimeSection extends Page {
	// S E L E C T O R S

	selectors = {
		skipButton: '.govuk-button',
		visitStartHour: '#visit-start-time-hour',
		visitStartMinute: '#visit-start-time-minute',
		visitEndHour: '#visit-end-time-hour',
		visitEndMinute: '#visit-end-time-minute',
		hearingTimeHour: '#hearing-time-hour',
		hearingTimeMinute: '#hearing-time-minute'
	};

	// Prefix of date selector which is expected to end in 'day', 'month' and 'year' for each dropdown in the HTML
	selectorPrefix = {
		dueDate: '#due-date-',
		lpaqDate: '#lpa-questionnaire-due-date-',
		validDate: '#valid-date-',
		visitDate: '#visit-date-',
		decisionLetterDate: '#decision-letter-date-',
		changeAppealDate: '#change-appeal-final-date-',
		withdrawalRequestDate: '#withdrawal-request-date-',
		hearingDate: '#hearing-date-',
		lpaQuestionnaireDueDate: '#lpa-questionnaire-due-date-',
		lpaStatementDueDate: '#lpa-statement-due-date-',
		ipCommentsDueDate: '#ip-comments-due-date-',
		finalCommentsDueDate: '#final-comments-due-date-'
	};

	// E L E M E N T S

	elements = {
		clickSkipButton: () => cy.contains(this.selectors.skipButton, 'Skip'),
		enterVisitStartHour: () => cy.get(this.selectors.visitStartHour),
		enterVisitStartMinute: () => cy.get(this.selectors.visitStartMinute),
		enterVisitEndHour: () => cy.get(this.selectors.visitEndHour),
		enterVisitEndMinute: () => cy.get(this.selectors.visitEndMinute),
		enterHearingTimeHour: () => cy.get(this.selectors.hearingTimeHour),
		enterHearingTimeMinute: () => cy.get(this.selectors.hearingTimeMinute)
	};

	// A C T I O N S

	enterDate(date) {
		this.#setAllDateFields(this.selectorPrefix.dueDate, date);
	}
	enterDueDates(timetableItems, date) {
		timetableItems.forEach((timetableItem) => {
			if (timetableItem.editable) {
				this.#setAllDateFields(`#${timetableItem.row}-`, date);
			}
		});
	}
	enterLpaqDate(date) {
		this.#setAllDateFields(this.selectorPrefix.lpaqDate, date);
	}
	enterWithdrawalRequestDate(date) {
		this.#setAllDateFields(this.selectorPrefix.withdrawalRequestDate, date);
	}

	enterValidDate(date) {
		this.#setAllDateFields(this.selectorPrefix.validDate, date);
	}

	enterDecisionLetterDate(date) {
		this.#setAllDateFields(this.selectorPrefix.decisionLetterDate, date);
	}

	enterVisitDate(date) {
		this.#setAllDateFields(this.selectorPrefix.visitDate, date);
	}

	enterTimeTableDueDate(field, date) {
		this.#setAllDateFields(`#${field}-`, date);
	}

	clearWithdrawalDate() {
		cy.get('#withdrawal-request-date-day').clear();
		cy.get('#withdrawal-request-date-month').clear();
		cy.get('#withdrawal-request-date-year').clear();
	}

	enterChangeAppealTypeResubmissionDate(date) {
		this.#setAllDateFields(this.selectorPrefix.changeAppealDate, date);
	}

	enterVisitStartTime(hour, minute) {
		this.#set(this.elements.enterVisitStartHour(), hour);
		this.#set(this.elements.enterVisitStartMinute(), minute);
	}

	enterVisitEndTime(hour, minute) {
		this.#set(this.elements.enterVisitEndHour(), hour);
		this.#set(this.elements.enterVisitEndMinute(), minute);
	}

	enterHearingDate(date) {
		this.#setAllDateFields(this.selectorPrefix.hearingDate, date);
	}

	enterHearingTime(hour, minute) {
		this.#set(this.elements.enterHearingTimeHour(), hour);
		this.#set(this.elements.enterHearingTimeMinute(), minute);
	}

	// Private helper methods
	#setAllDateFields(dateSelectorPrefix, date) {
		this.#set(this.#getElement(dateSelectorPrefix, 'day'), date.getDate());
		this.#set(this.#getElement(dateSelectorPrefix, 'month'), date.getMonth() + 1);
		this.#set(this.#getElement(dateSelectorPrefix, 'year'), date.getFullYear());
	}

	#set(element, value, index = 0) {
		element.eq(index).clear().type(value);
	}

	#getElement(dateSelectorPrefix, dateType) {
		return cy.get(dateSelectorPrefix + dateType);
	}
}
