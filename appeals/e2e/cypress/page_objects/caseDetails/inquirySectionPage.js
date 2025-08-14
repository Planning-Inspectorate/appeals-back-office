// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';

const caseDetailsPage = new CaseDetailsPage();
const dateTimeSection = new DateTimeSection();

export class InquirySectionPage extends CaseDetailsPage {
	inquirySectionElements = {
		...this.elements // Inherit parent elements
	};

	clearInquiryDateAndTime() {
		dateTimeSection.clearInquiryDateAndTime();
	}

	setUpInquiry(day, month, year, hour, minute) {
		dateTimeSection.enterInquiryDate(day, month, year);
		dateTimeSection.enterInquiryTime(hour, minute);
		this.clickButtonByText('Continue');
	}
}
