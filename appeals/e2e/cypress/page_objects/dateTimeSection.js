// @ts-nocheck
import { Page } from './basePage';

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
		validDate: '#valid-date-',
		visitDate: '#visit-date-',
		decisionLetterDate: '#decision-letter-date-',
		changeAppealDate: '#change-appeal-final-date-',
		withdrawalRequestDate: '#withdrawal-request-date-',
		hearingDate: '#hearing-date-'
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

	/*enterWithdrawalDate(day, month, year) {
		cy.get('#withdrawal-request-date-day').type(day);
		cy.get('#withdrawal-request-date-month').type(month);
		cy.get('#withdrawal-request-date-year').type(year);
	}*/

	enterWithdrawalRequestDate(date) {
		this.#setAllDateFields(this.selectorPrefix.withdrawalRequestDate, date);
	}

	enterValidDate(date) {
		this.#setAllDateFields(this.selectorPrefix.validDate, date);
	}

	enterVisitDate(date) {
		this.#setAllDateFields(this.selectorPrefix.visitDate, date);
	}

	clearWithdrawalDate() {
		cy.get('#withdrawal-request-date-day').clear();
		cy.get('#withdrawal-request-date-month').clear();
		cy.get('#withdrawal-request-date-year').clear();
	}

	enterDecisionLetterDate(date) {
		this.#setAllDateFields(this.selectorPrefix.decisionLetterDate, date);
	}

	enterChangeAppealTypeResubmissionDate(date) {
		this.#setAllDateFields(this.selectorPrefix.changeAppealDate, date);
	}

	clickSkipButton(text) {
		this.elements.clickSkipButton(text).click();
	}

	enterVisitStartTime(hour, minute) {
		this.#set(this.elements.enterVisitStartHour(), hour);
		this.#set(this.elements.enterVisitStartMinute(), minute);
	}

	enterVisitEndTime(hour, minute) {
		this.#set(this.elements.enterVisitEndHour(), hour);
		this.#set(this.elements.enterVisitEndMinute(), minute);
	}

	formatDate(date) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	removeVisitStartTimeHour(index = 0) {
		this.elements.enterVisitStartHour().eq(index).clear();
	}

	removeVisitStartTimeMinute(index = 0) {
		this.elements.enterVisitStartMinute().eq(index).clear();
	}

	removeVisitEndTimeHour(index = 0) {
		this.elements.enterVisitEndHour().eq(index).clear();
	}
	removeVisitEndTimeMinute(index = 0) {
		this.elements.enterVisitEndMinute().eq(index).clear();
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

	verifyCheckYourAnswerDate(rowName, dateToday) {
		const formattedDate = dateTimeSection.formatDate(dateToday);
		cy.get('.govuk-summary-list__key')
			.contains(rowName)
			.next()
			.invoke('prop', 'innerText')
			.then((dateText) => {
				expect(dateText.trim()).to.equal(formattedDate);
			});
	}
}
