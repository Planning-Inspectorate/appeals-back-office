import { checkAppealExistsByIdAndAddPartialToRequest } from '#middleware/check-appeal-exists-and-add-to-request.js';
import representationRepository from '#repositories/representation.repository.js';
import { currentStatus } from '#utils/current-status.js';
import { dateIsPast } from '#utils/date-comparison.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE,
	FEATURE_FLAG_NAMES
} from '@pins/appeals/constants/common.js';
import { ERROR_REP_PUBLISH_BLOCKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {string} status
 * @returns {string[] | undefined}
 */
export const getRepresentationTypesToPublish = (status) => {
	switch (status) {
		case APPEAL_CASE_STATUS.STATEMENTS:
			return [
				APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
				APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
			];
		case APPEAL_CASE_STATUS.FINAL_COMMENTS:
			return [
				APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
			];
		case APPEAL_CASE_STATUS.EVIDENCE:
			return [
				APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
				APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
			];
		default:
			return undefined;
	}
};

/**
 * Load appeal details after the initial partial lookup has identified current status.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const loadAppealForPublishing = async (req, res, next) => {
	const representationTypes = getRepresentationTypesToPublish(currentStatus(req.appeal));

	if (!representationTypes) {
		return next();
	}

	return checkAppealExistsByIdAndAddPartialToRequest(
		[
			'appealStatus',
			'appealType',
			'representations',
			'appealTimetable',
			'childAppeals',
			'procedureType',
			'hearing',
			'appellant',
			'agent',
			'lpa',
			'address',
			'inquiry',
			'appealRule6Parties',
			'appellantCase'
		],
		undefined,
		representationTypes
	)(req, res, next);
};

/**
 * Based on the required actions "shareIpCommentsAndLpaStatement" and "progressFromStatements" in the front end
 *
 * @param {Appeal} currentAppeal
 * @returns {boolean}
 */
const canPublishIpCommentsAndStatements = (
	currentAppeal,
	/** @type {boolean} */ hasIpCommentsAwaitingReview
) => {
	const { representations = [], appealTimetable } = currentAppeal || {};
	const { AWAITING_REVIEW } = APPEAL_REPRESENTATION_STATUS;
	const { LPA_STATEMENT, RULE_6_PARTY_STATEMENT, APPELLANT_STATEMENT } = APPEAL_REPRESENTATION_TYPE;

	const representationCheckList = [LPA_STATEMENT];
	if (isFeatureActive(FEATURE_FLAG_NAMES.APPELLANT_STATEMENT)) {
		representationCheckList.push(APPELLANT_STATEMENT);
	}
	representationCheckList.push(RULE_6_PARTY_STATEMENT);

	const hasRepresentationsAwaitingReview =
		hasIpCommentsAwaitingReview ||
		representations?.some(
			({ status, representationType }) =>
				representationCheckList.includes(representationType) && status === AWAITING_REVIEW
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
 * Based on the required actions "shareProofOfEvidence" and "progressToInquiry" in the front end
 *
 * @param {Appeal} currentAppeal
 * @returns {boolean}
 */
const canPublishProofOfEvidence = (currentAppeal) => {
	const { representations = [], appealTimetable } = currentAppeal || {};
	const { AWAITING_REVIEW } = APPEAL_REPRESENTATION_STATUS;
	const { LPA_PROOFS_EVIDENCE, APPELLANT_PROOFS_EVIDENCE, RULE_6_PARTY_PROOFS_EVIDENCE } =
		APPEAL_REPRESENTATION_TYPE;

	const hasProofOfEvidenceAwaitingReview = representations?.some(
		({ status, representationType }) =>
			[LPA_PROOFS_EVIDENCE, APPELLANT_PROOFS_EVIDENCE, RULE_6_PARTY_PROOFS_EVIDENCE].includes(
				representationType
			) && status === AWAITING_REVIEW
	);

	const today = new Date();

	const proofOfEvidenceDueDatePassed =
		appealTimetable?.proofOfEvidenceAndWitnessesDueDate &&
		dateIsPast(appealTimetable.proofOfEvidenceAndWitnessesDueDate, today);

	return Boolean(!hasProofOfEvidenceAwaitingReview || proofOfEvidenceDueDatePassed);
};

/**
@type {import("express").RequestHandler}
@returns {Promise<object|void>}
 */
export const validateRepresentationsToPublish = async (req, res, next) => {
	const status = currentStatus(req.appeal);
	const { STATEMENTS, FINAL_COMMENTS, EVIDENCE } = APPEAL_CASE_STATUS;
	const hasIpCommentsAwaitingReview = Boolean(
		status === STATEMENTS &&
		(await representationRepository.hasRepresentationsWithStatus(
			Number(req.appeal.id),
			[APPEAL_REPRESENTATION_TYPE.COMMENT],
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
		))
	);

	if (
		//@ts-ignore
		![STATEMENTS, FINAL_COMMENTS, EVIDENCE].includes(status) ||
		(status === STATEMENTS &&
			canPublishIpCommentsAndStatements(req.appeal, hasIpCommentsAwaitingReview)) ||
		(status === FINAL_COMMENTS && canPublishFinalComments(req.appeal)) ||
		(status === EVIDENCE && canPublishProofOfEvidence(req.appeal))
	) {
		return next();
	}
	res.status(400).send({ errors: { appealStatus: ERROR_REP_PUBLISH_BLOCKED } });
};
