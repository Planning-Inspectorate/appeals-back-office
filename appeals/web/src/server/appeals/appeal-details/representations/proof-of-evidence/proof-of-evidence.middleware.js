import { getSingularRepresentationByType } from '#appeals/appeal-details/representations/representations.service.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

const proofOfEvidenceTypeToAppealRepresentationTypeMap = {
	appellant: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
	lpa: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
};

/**
 * @param {string} proofOfEvidenceType
 * @returns {proofOfEvidenceType is 'appellant' | 'lpa'}
 */
const isProofOfEvidenceTypeValid = (proofOfEvidenceType) =>
	['appellant', 'lpa'].includes(proofOfEvidenceType);

/**
 * @type {import('express').RequestHandler}
 */
export const withSingularRepresentation = async (req, res, next) => {
	const { appealId, proofOfEvidenceType } = req.params;

	try {
		if (!isProofOfEvidenceTypeValid(proofOfEvidenceType)) {
			throw new Error('Invalid proofOfEvidenceType value');
		}
		const representation = await getSingularRepresentationByType(
			req.apiClient,
			appealId,
			proofOfEvidenceTypeToAppealRepresentationTypeMap[proofOfEvidenceType]
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
