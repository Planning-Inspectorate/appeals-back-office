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
		dateTimeSection.setInquiryDate(day, month, year);
		dateTimeSection.enterInquiryTime(hour, minute);
		this.clickButtonByText('Continue');
	}

	verifyInquiryHeader(sectionHeader) {
		this.elements.pageHeading().should('contain.text', sectionHeader);
	}

	verifyInquiryEstimate(estimateField, value) {
		const daysCount = parseFloat(value);
		const daySuffix = daysCount === 1 ? 'day' : 'days';
		const expectedText = `${daysCount} ${daySuffix}`;

		this.inquirySectionElements
			.rowChangeLink(estimateField)
			.parent('dd')
			.siblings('dd')
			.should('be.visible')
			.and('contain.text', expectedText);
	}
}
