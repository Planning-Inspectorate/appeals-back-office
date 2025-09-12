import { getSingularRepresentationByType } from '#appeals/appeal-details/representations/representations.service.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

const finalCommentsTypeToAppealRepresentationTypeMap = {
	appellant: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
	lpa: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
};

/**
 * @param {string} finalCommentsType
 * @returns {finalCommentsType is 'appellant' | 'lpa'}
 */
const isFinalCommentsTypeValid = (finalCommentsType) =>
	['appellant', 'lpa'].includes(finalCommentsType);

/**
 * @type {import('express').RequestHandler}
 */
export const withSingularRepresentation = async (req, res, next) => {
	const { appealId, finalCommentsType } = req.params;

	try {
		if (!isFinalCommentsTypeValid(finalCommentsType)) {
			throw new Error('Invalid finalCommentsType value');
		}
		const representation = await getSingularRepresentationByType(
			req.apiClient,
			appealId,
			finalCommentsTypeToAppealRepresentationTypeMap[finalCommentsType]
		);

		if (!representation) {
			return res.status(404).render('app/404.njk');
		}

		req.currentRepresentation = representation;
	} catch (/** @type {any} */ error) {
		return res.status(500).render('app/500.njk');
	}

	next();
};
