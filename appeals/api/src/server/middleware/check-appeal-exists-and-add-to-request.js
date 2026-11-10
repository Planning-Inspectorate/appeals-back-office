import appealRepository from '#repositories/appeal.repository.js';
import { isAppealEnabled } from '#utils/feature-flags-appeal-types.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import {
	FOLDER_SELECTOR_ERROR,
	isValidFolderSelector
} from '@pins/appeals/utils/folder-selector.js';
import {
	REPRESENTATION_SELECTOR_ERROR,
	isValidRepresentationTypes
} from '@pins/appeals/utils/representation-selector.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

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

	// TODO: performance
	// is returning all data, return only needed data
	const appeal = await appealRepository.deprecatedGetAppealByAppealReference(caseReference);

	if (!appeal || !isAppealEnabled(appeal)) {
		return res.status(404).send({ errors: { caseReference: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @typedef {import('#repositories/appeal.repository.js').appealDetailsInclude} AppealDetailsInclude
 *
 * @param {Array<keyof typeof import('#repositories/appeal.repository.js').appealDetailsIncludeMap>} [selectedKeys=[]]
 * @param {import('@pins/appeals/utils/folder-selector.js').FolderSelector} [folderSelector]
 * @param {string[]} [representationTypes]
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<Response | void>}
 */
export const checkAppealExistsByIdAndAddPartialToRequest =
	(selectedKeys = [], folderSelector, representationTypes) =>
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

		const selector = folderSelector ?? {
			stage: req.query.folderStage,
			paths:
				typeof req.query.folderPaths === 'string'
					? req.query.folderPaths.split(',')
					: req.query.folderPaths
		};
		if (getAppealKeys.includes('folders') && !isValidFolderSelector(selector)) {
			return res.status(400).send({ errors: { folderSelector: FOLDER_SELECTOR_ERROR } });
		}

		const types =
			representationTypes ??
			(typeof req.query.representationTypes === 'string'
				? req.query.representationTypes.split(',')
				: req.query.representationTypes);
		if (getAppealKeys.includes('representations') && !isValidRepresentationTypes(types)) {
			return res.status(400).send({
				errors: { representationTypes: REPRESENTATION_SELECTOR_ERROR }
			});
		}

		let appeal;

		if (includeDetails && !selectAppealTypeKey) {
			appeal = await appealRepository.deprecatedGetAppealById(Number(appealId));
		} else {
			appeal = await appealRepository.getAppealById(
				Number(appealId),
				includeDetails,
				getAppealKeys,
				selectAppealTypeKey,
				isValidFolderSelector(selector) ? selector : undefined,
				isValidRepresentationTypes(types) ? types : undefined
			);
		}

		if (!appeal || !isAppealEnabled(appeal)) {
			return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
		}

		req.appeal = appeal;
		next();
	};

/**
 * @type {import('express').Handler}
 */
export const checkAppealExistsByIdForPageDisplayAndAddToRequest = async (req, res, next) => {
	const {
		params: { appealId }
	} = req;

	const appeal = await appealRepository.getAppealByIdForPageDisplay(Number(appealId));

	if (!appeal || !isAppealEnabled(appeal)) {
		return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
	}

	req.appeal = appeal;
	next();
};

/**
 * @type {import('express').Handler}
 */
export const checkAppealExistsById = async (req, res, next) => {
	const {
		params: { appealId }
	} = req;

	const appeal = await appealRepository.checkAppealExistsById(Number(appealId));

	if (!appeal) {
		return res.status(404).send({ errors: { appealId: ERROR_NOT_FOUND } });
	}

	if (!req.appeal) {
		//@ts-expect-error
		req.appeal = { id: appeal.id, reference: appeal.reference };
	}

	next();
};
