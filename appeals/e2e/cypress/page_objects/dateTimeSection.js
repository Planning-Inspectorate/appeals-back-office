// @ts-nocheck
import { Page } from './basePage';

export class DateTimeSection extends Page {
	_selectors = {
		uniqueSelector: 'selector-name'
	};

	// S E L E C T O R S

	selectors = {
		dateInputDay: '#due-date-day',
		dateInputMonth: '#due-date-month',
		dateInputYear: '#due-date-year',
		validDateDay: '#valid-date-day',
		validDateMonth: '#valid-date-month',
		validDateYear: '#valid-date-year',
		skipButton: '.govuk-button',
		visitDateDay: '#visit-date-day',
		visitDateMonth: '#visit-date-month',
		visitDateYear: '#visit-date-year',
		visitStartHour: '#visit-start-time-hour',
		visitStartMinute: '#visit-start-time-minute',
		visitEndHour: '#visit-end-time-hour',
		visitEndMinute: '#visit-end-time-minute'
	};

	// E L E M E N T S

	updateDueDateElements = {
		enterDateDay: () => cy.get(this.selectors.dateInputDay),
		enterDateMonth: () => cy.get(this.selectors.dateInputMonth),
		enterDateYear: () => cy.get(this.selectors.dateInputYear),
		validDateDay: () => cy.get(this.selectors.validDateDay),
		validDateMonth: () => cy.get(this.selectors.validDateMonth),
		validDateYear: () => cy.get(this.selectors.validDateYear),
		clickSkipButton: () => cy.contains(this.selectors.skipButton, 'Skip'),
		enterVisitDay: () => cy.get(this.selectors.visitDateDay),
		enterVisitMonth: () => cy.get(this.selectors.visitDateMonth),
		enterVisitYear: () => cy.get(this.selectors.visitDateYear),
		enterVisitStartHour: () => cy.get(this.selectors.visitStartHour),
		enterVisitStartMinute: () => cy.get(this.selectors.visitStartMinute),
		enterVisitEndHour: () => cy.get(this.selectors.visitEndHour),
		enterVisitEndMinute: () => cy.get(this.selectors.visitEndMinute)
	};

	// A C T I O N S

	enterDate(date) {
		this.enterDateDay(date.getDate());
		this.enterDateMonth(date.getMonth() + 1);
		this.enterDateYear(date.getFullYear());
	}

	enterDateDay(text, index = 0) {
		this.updateDueDateElements.enterDateDay().eq(index).clear().type(text);
	}

	enterDateMonth(text, index = 0) {
		this.updateDueDateElements.enterDateMonth().eq(index).clear().type(text);
	}

	enterDateYear(text, index = 0) {
		this.updateDueDateElements.enterDateYear().eq(index).clear().type(text);
	}

	enterValidDate(date) {
		this.validDateDay(date.getDate());
		this.validDateMonth(date.getMonth() + 1);
		this.validDateYear(date.getFullYear());
	}

	validDateDay(text, index = 0) {
		this.updateDueDateElements.validDateDay().eq(index).clear().type(text);
	}

	validDateMonth(text, index = 0) {
		this.updateDueDateElements.validDateMonth().eq(index).clear().type(text);
	}

	validDateYear(text, index = 0) {
		this.updateDueDateElements.validDateYear().eq(index).clear().type(text);
	}

	clickSkipButton(text) {
		this.updateDueDateElements.clickSkipButton(text).click();
	}

	enterVisitDate(date) {
		this.enterVisitDay(date.getDate());
		this.enterVisitMonth(date.getMonth() + 1);
		this.enterVisitYear(date.getFullYear());
	}

	enterVisitDay(text, index = 0) {
		this.updateDueDateElements.enterVisitDay().eq(index).clear().type(text);
	}

	enterVisitMonth(text, index = 0) {
		this.updateDueDateElements.enterVisitMonth().eq(index).clear().type(text);
	}
	enterVisitYear(text, index = 0) {
		this.updateDueDateElements.enterVisitYear().eq(index).clear().type(text);
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
}
