// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';
import { DateTimeSection } from './dateTimeSection.js';

const dateTimeSection = new DateTimeSection();

export class FileDateAndRedactionStatusPage extends CaseDetailsPage {
	redactionPageSelectors = {
		redacted: '\\[redactionStatus\\][0]',
		unredacted: '\\[redactionStatus\\]-2',
		noRedactionRequired: '\\[redactionStatus\\]-4'
	};

	checkDateIsPopulated(fileUploadIndex = 0) {
		// as result of recent change can be multiple file uploads,
		// so need to pass in the index of the file upload to check the date for
		const datePrefix = `items-${fileUploadIndex}-received-`;
		dateTimeSection.checkDateIsPrefilled(datePrefix);
	}

	selectRedactionOption(optionToSelect, fileUploadIndex = 0) {
		// as result of recent change can be multiple file uploads,
		// so need to pass in the index of the file upload to select the redaction option for
		const redactionSelector = `#items\\[${fileUploadIndex}\\]${this.redactionPageSelectors[optionToSelect]}.govuk-radios__input`;
		cy.get(redactionSelector).click();
	}
}
