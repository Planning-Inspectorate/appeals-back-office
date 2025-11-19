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
 * @deprecated too inefficient, use checkAppealExistsByIdAndAddPartialToRequest
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
		const include = req.query.include;
		// for requests coming from the web
		if (include) {
			// @ts-ignore
			getAppealKeys = include.split(',');
		}

		const appeal = await appealRepository.getAppealById(
			Number(appealId),
			true,
			getAppealKeys,
			true
		);

		if (!appeal || !isAppealTypeEnabled(appeal.appealType?.key || '')) {
			return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
		}

		req.appeal = appeal;
		next();
	};
