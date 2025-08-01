import { NUM_DAYS_TO_RESUBMIT_REJECTED_IP_COMMENTS } from '../constants/dates.js';
import { addDays } from './business-days.js';
import { dateISOStringToDisplayDate } from './date-formatter.js';

/**
 * IP comments can be re-submit after rejection to FO if the overall due date is after
 * the three business day deadline for comments. Else they should be done by email.
 *
 * @param {Boolean} allowResubmit // Is resubmission allowed
 * @param {Date | null} dueDate // Overall due date for Interested Party (IP) Comments
 * @returns {Promise<{ resubmissionDueDate: string, resubmitToFO: Boolean }>}
 */
export const getDetailsForCommentResubmission = async (allowResubmit, dueDate) => {
	if (!allowResubmit) {
		return {
			resubmissionDueDate: '',
			resubmitToFO: true
		};
	}

	const ipCommentDueDate = await addDays(
		new Date().toISOString(),
		NUM_DAYS_TO_RESUBMIT_REJECTED_IP_COMMENTS
	);

	if (!dueDate) {
		const resubmissionDueDate = dateISOStringToDisplayDate(ipCommentDueDate.toISOString());

		return {
			resubmissionDueDate,
			resubmitToFO: true
		};
	}

	const resubmitToFO = dueDate > ipCommentDueDate;
	const resubmissionDueDate = resubmitToFO
		? dateISOStringToDisplayDate(dueDate.toISOString())
		: dateISOStringToDisplayDate(ipCommentDueDate.toISOString());

	return {
		resubmissionDueDate,
		resubmitToFO
	};
};
