// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';

export class DateTimeQuestionPage extends CaseDetailsPage {
	// S E L E C T O R S

	// A C T I O N S

	selectDateTimeOption(option) {
		this.selectRadioButtonByValue(option);
	}
}
