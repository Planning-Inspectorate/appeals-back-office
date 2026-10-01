// @ts-nocheck
import { getDateAndTimeValues } from '../support/utils/format.js';
import { CaseDetailsPage } from './caseDetailsPage.js';
import { DateTimeSection } from './dateTimeSection.js';

const dateTimeSection = new DateTimeSection();

/**
 * This page object represents the file date and redaction status component which forms part of
 * the process for adding representations documents to a case.
 * There can be multiple file uploads, so the page object has a property specifying which file upload to interact with.
 */

export class FileDateAndRedactionStatusComponent extends CaseDetailsPage {
	// as element ids contains square brackets, need to escape them with double backslash
	redactionSelectorsMap = {
		redacted: {
			selector: '\\[redactionStatus\\]',
			label: 'Redacted'
		},
		unredacted: {
			selector: '\\[redactionStatus\\]-2',
			label: 'Unredacted'
		},
		noRedactionRequired: {
			selector: '\\[redactionStatus\\]-4',
			label: 'No redaction required'
		}
	};

	fileUploadIndex;

	constructor(uploadIndex = 0) {
		super();
		this.fileUploadIndex = uploadIndex;
	}

	checkDateIsPopulated(fileDate) {
		// as result of recent change can be multiple file uploads,
		// so need to pass in the index of the file upload to check the date for
		const datePrefix = `items-${this.fileUploadIndex}-received-`;

		// date field should be pre-populated with the current date and time
		const dateValues = getDateAndTimeValues(fileDate);

		// check that the date and time fields are pre-populated with the current date and time
		dateTimeSection.checkDateIsPrefilled(datePrefix, dateValues);
	}

	selectRedactionOption(optionToSelect) {
		// as result of recent change can be multiple file uploads,
		// so need to pass in the index of the file upload to select the redaction option for
		const redactionSelector = this.generateRedactionStatusSelector(
			optionToSelect,
			this.fileUploadIndex
		);
		cy.get(redactionSelector).click();
	}

	getRedactionStatusLabel(optionToSelect) {
		if (!this.redactionSelectorsMap[optionToSelect]) {
			throw new Error(
				`Invalid redaction option: ${optionToSelect}. Valid options are: ${Object.keys(this.redactionSelectorsMap).join(', ')}`
			);
		}
		return this.redactionSelectorsMap[optionToSelect].label;
	}

	generateRedactionStatusSelector(optionToSelect) {
		// as element id contains square brackets, need to escape them with double backslash
		return `#items\\[${this.fileUploadIndex}\\]${this.redactionSelectorsMap[optionToSelect].selector}.govuk-radios__input`;
	}
}
