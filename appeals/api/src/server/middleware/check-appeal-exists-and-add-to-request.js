import appealRepository from '#repositories/appeal.repository.js';
import { isAppealTypeEnabled } from '#utils/feature-flags-appeal-types.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @deprecated too inefficient, use checkAppealExistsByIdAndAddPartialToRequest
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkAppealExistsByIdAndAddToRequest = async (req, res, next) => {
	const {
		params: { appealId }
	} = req;

	const appeal = await appealRepository.getAppealById(Number(appealId));

	if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
		return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
 */
export const checkAppealExistsByCaseReferenceAndAddToRequest = async (req, res, next) => {
	const {
		params: { caseReference }
	} = req;

	const appeal = await appealRepository.getAppealByAppealReference(caseReference);

	if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
		return res.status(404).send({ errors: { caseReference: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @typedef {import('#repositories/appeal.repository.js').appealDetailsInclude} AppealDetailsInclude
 *
 * @param {Array<keyof typeof import('#repositories/appeal.repository.js').appealDetailsIncludeMap>} [selectedKeys=[]]
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<Response | void>}
 */
export const checkAppealExistsByIdAndAddPartialToRequest =
	(selectedKeys = []) =>
	async (req, res, next) => {
		const {
			params: { appealId }
		} = req;

		let getAppealKeys = selectedKeys;
		let includeDetails = false;
		let selectAppealTypeKey = true;

		// Handle requests coming from the web to appeal details endpoint
		const include = req.query.include;
		if (include) {
			if (include === 'all') {
				// for backwards compatability
				includeDetails = true;
				selectAppealTypeKey = false;
			} else {
				// @ts-ignore
				getAppealKeys = include.split(',');
			}
		}

		if (getAppealKeys.length) {
			includeDetails = true;
		}

		const appeal = await appealRepository.getAppealById(
			Number(appealId),
			includeDetails,
			getAppealKeys,
			selectAppealTypeKey
		);

		if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
			return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
		}

		req.appeal = appeal;
		next();
	};
