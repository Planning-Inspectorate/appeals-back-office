import { dateIsPast } from '#utils/date-comparison.js';
import { ERROR_REP_PUBLISH_BLOCKED } from '@pins/appeals/constants/support.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { currentStatus } from '#utils/current-status.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * Based on the required actions "shareIpCommentsAndLpaStatement" and "progressFromStatements" in the front end
 *
 * @param {Appeal} currentAppeal
 * @returns {boolean}
 */
const canPublishIpCommentsAndStatements = (currentAppeal) => {
	const { representations = [], appealTimetable } = currentAppeal || {};
	const { AWAITING_REVIEW } = APPEAL_REPRESENTATION_STATUS;
	const { COMMENT, LPA_STATEMENT } = APPEAL_REPRESENTATION_TYPE;

	const hasRepresentationsAwaitingReview = representations?.some(
		({ status, representationType }) =>
			[COMMENT, LPA_STATEMENT].includes(representationType) && status === AWAITING_REVIEW
	);

	const today = new Date();

	const ipCommentsDueDatePassed =
		appealTimetable?.ipCommentsDueDate && dateIsPast(appealTimetable.ipCommentsDueDate, today);

	const lpaStatementDueDatePassed =
		appealTimetable?.lpaStatementDueDate && dateIsPast(appealTimetable.lpaStatementDueDate, today);

	return Boolean(
		ipCommentsDueDatePassed && lpaStatementDueDatePassed && !hasRepresentationsAwaitingReview
	);
};

/**
 * Based on the required actions "shareFinalComments" and "progressFromFinalComments" in the front end
 *
 * @param {Appeal} currentAppeal
 * @returns {boolean}
 */
const canPublishFinalComments = (currentAppeal) => {
	const { representations = [], appealTimetable } = currentAppeal || {};
	const { AWAITING_REVIEW } = APPEAL_REPRESENTATION_STATUS;
	const { LPA_FINAL_COMMENT, APPELLANT_FINAL_COMMENT } = APPEAL_REPRESENTATION_TYPE;

	const hasFinalCommentsAwaitingReview = representations?.some(
		({ status, representationType }) =>
			[LPA_FINAL_COMMENT, APPELLANT_FINAL_COMMENT].includes(representationType) &&
			status === AWAITING_REVIEW
	);

	const today = new Date();

	const finalCommentsDueDatePassed =
		appealTimetable?.finalCommentsDueDate &&
		dateIsPast(appealTimetable.finalCommentsDueDate, today);

	return Boolean(!hasFinalCommentsAwaitingReview && finalCommentsDueDatePassed);
};

/**
@type {import("express").RequestHandler}
@returns {Promise<object|void>}
 */
export const validateRepresentationsToPublish = async (req, res, next) => {
	const status = currentStatus(req.appeal);
	const { STATEMENTS, FINAL_COMMENTS } = APPEAL_CASE_STATUS;

	if (
		![STATEMENTS, FINAL_COMMENTS].includes(status) ||
		(status === STATEMENTS && canPublishIpCommentsAndStatements(req.appeal)) ||
		(status === FINAL_COMMENTS && canPublishFinalComments(req.appeal))
	) {
		return next();
	}
	res.status(400).send({ errors: { appealStatus: ERROR_REP_PUBLISH_BLOCKED } });
};
