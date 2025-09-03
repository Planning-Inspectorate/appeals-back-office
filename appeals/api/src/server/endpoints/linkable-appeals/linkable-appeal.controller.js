import { canLinkAppeals } from '#endpoints/link-appeals/link-appeals.service.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { getLinkableAppealSummaryByCaseReference } from './linkable-appeal.service.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getLinkableAppealById = async (req, res) => {
	const { appealReference, linkableType } = req.params;

	try {
		const linkableAppeal = await getLinkableAppealSummaryByCaseReference(
			appealReference,
			linkableType
		);

		if (linkableAppeal.source === 'horizon') {
			return res.send(linkableAppeal);
		}

		if (
			isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS) &&
			linkableType === CASE_RELATIONSHIP_LINKED &&
			!canLinkAppeals(linkableAppeal, linkableType, 'lead')
		) {
			throw 409;
		}

		return res.send(linkableAppeal);
	} catch (/** @type {*} */ statusCode) {
		return res.status(typeof statusCode === 'number' ? statusCode : 500).end();
	}
};
