import { NUM_DAYS_TO_RESUBMIT_REJECTED_IP_COMMENTS } from '../constants/dates.js';
import { addDays } from './business-days.js';
import { dateISOStringToDisplayDate } from './date-formatter.js';

/**
 *
 * @param {Boolean} allowResubmit // Is resubmission allowed
 * @param {Date | null} dueDate // Overall due date for Interested Party (IP) Comments
 * @returns {Promise<{ resubmissionDueDate: string, ipCommentDueBeforeResubmissionDeadline: Boolean }>}
 */
export const getDetailsForCommentResubmission = async (allowResubmit, dueDate) => {
	if (!allowResubmit) {
		return {
			resubmissionDueDate: '',
			ipCommentDueBeforeResubmissionDeadline: true
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
			ipCommentDueBeforeResubmissionDeadline: true
		};
	}

	const ipCommentDueBeforeResubmissionDeadline =
		ipCommentDueDate.getTime() > dueDate.getTime() ? true : false;
	const resubmissionDueDate = ipCommentDueBeforeResubmissionDeadline
		? dateISOStringToDisplayDate(ipCommentDueDate.toISOString())
		: dateISOStringToDisplayDate(dueDate.toISOString());

	return {
		resubmissionDueDate,
		ipCommentDueBeforeResubmissionDeadline
	};
};
