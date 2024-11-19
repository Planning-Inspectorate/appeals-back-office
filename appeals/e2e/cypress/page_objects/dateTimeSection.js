// @ts-nocheck
import { Page } from './basePage';

export class DateTimeSection extends Page {
	_selectors = {
		uniqueSelector: 'selector-name'
	};

	// S E L E C T O R S

	selectors = {
		skipButton: '.govuk-button',
		visitStartHour: '#visit-start-time-hour',
		visitStartMinute: '#visit-start-time-minute',
		visitEndHour: '#visit-end-time-hour',
		visitEndMinute: '#visit-end-time-minute'
	};

	// Prefix of date selector which is expected to end in 'day', 'month' and 'year' for each dropdown in the HTML
	selectorPrefix = {
		dueDate: '#due-date-',
		validDate: '#valid-date-',
		visitDate: '#visit-date-',
		decisionLetterDate: '#decision-letter-date-',
		changeAppealDate: '#change-appeal-final-date-'
	};

	// E L E M E N T S

	updateDueDateElements = {
		clickSkipButton: () => cy.contains(this.selectors.skipButton, 'Skip'),
		enterVisitStartHour: () => cy.get(this.selectors.visitStartHour),
		enterVisitStartMinute: () => cy.get(this.selectors.visitStartMinute),
		enterVisitEndHour: () => cy.get(this.selectors.visitEndHour),
		enterVisitEndMinute: () => cy.get(this.selectors.visitEndMinute)
	};

	// A C T I O N S

	enterDate(date) {
		this.#setAllDateFields(this.selectorPrefix.dueDate, date);
	}

	enterValidDate(date) {
		this.#setAllDateFields(this.selectorPrefix.validDate, date);
	}

	enterVisitDate(date) {
		this.#setAllDateFields(this.selectorPrefix.visitDate, date);
	}

	enterDecisionLetterDate(date) {
		this.#setAllDateFields(this.selectorPrefix.decisionLetterDate, date);
	}

	enterChangeAppealTypeResubmissionDate(date) {
		this.#setAllDateFields(this.selectorPrefix.changeAppealDate, date);
	}

	clickSkipButton(text) {
		this.updateDueDateElements.clickSkipButton(text).click();
	}

	enterVisitStartTime(hour, minute) {
		this.enterVisitStartTimeHour(hour);
		this.enterVisitStartTimeMinute(minute);
	}

	enterVisitStartTimeHour(text, index = 0) {
		this.updateDueDateElements.enterVisitStartHour().eq(index).clear().type(text);
	}

	enterVisitStartTimeMinute(text, index = 0) {
		this.updateDueDateElements.enterVisitStartMinute().eq(index).clear().type(text);
	}

	enterVisitEndTime(hour, minute) {
		this.enterVisitEndTimeHour(hour);
		this.enterVisitEndTimeMinute(minute);
	}

	enterVisitEndTimeHour(text, index = 0) {
		this.updateDueDateElements.enterVisitEndHour().eq(index).clear().type(text);
	}
	enterVisitEndTimeMinute(text, index = 0) {
		this.updateDueDateElements.enterVisitEndMinute().eq(index).clear().type(text);
	}

	formatDate(date) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	removeVisitStartTimeHour(index = 0) {
		this.updateDueDateElements.enterVisitStartHour().eq(index).clear();
	}

	removeVisitStartTimeMinute(index = 0) {
		this.updateDueDateElements.enterVisitStartMinute().eq(index).clear();
	}

	removeVisitEndTimeHour(index = 0) {
		this.updateDueDateElements.enterVisitEndHour().eq(index).clear();
	}
	removeVisitEndTimeMinute(index = 0) {
		this.updateDueDateElements.enterVisitEndMinute().eq(index).clear();
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
