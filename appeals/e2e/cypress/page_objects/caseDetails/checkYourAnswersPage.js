// @ts-nocheck

import { CaseDetailsPage } from '../caseDetailsPage';
import { DateTimeSection } from '../dateTimeSection.js';
import { getDateAndTimeValues } from '../../support/utils/dateAndTime.js';
import { EstimatedDaysSection } from '../estimatedDaysSection.js';
import { AddressSection } from '../addressSection.js';

const caseDetailsPage = new CaseDetailsPage();

export class CheckYourAnswersPage extends CaseDetailsPage {
	checkYourAnswerFields = {
		date: 'Date',
		time: 'Time',
		doKnowEstimatedDays:
			'Do you know the estimated number of days needed to carry out the inquiry?',
		expectedNumberOfDays: 'Estimated number of days needed to carry out inquiry',
		doKnowAddress: 'Do you know the address of where the inquiry will take place?',
		address: 'Address'
	};

	checkYourAnswerLinks = {
		date: 'date',
		time: 'time',
		whetherEstimatedDaysKnown: 'whether-the-estimated-number-of-days-is-known-or-not',
		estimatedDays: 'estimated-days',
		address: 'whether-the-address-is-known-or-not'
	};

	inquirySectionElements = {
		...this.elements // Inherit parent elements
	};
}
