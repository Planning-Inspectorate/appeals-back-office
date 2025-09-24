import { getSingularRepresentationByType } from '#appeals/appeal-details/representations/representations.service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
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

/**
 * @type {import('express').RequestHandler}
 */
export const addPageContentToLocals = async (req, _res, next) => {
	const {
		params: { proofOfEvidenceType },
		currentAppeal
	} = req;
	const shortAppealReference = appealShortReference(currentAppeal.appealReference);
	req.locals.pageContent = {
		preHeadingTextOverride: `Appeal ${shortAppealReference}`,
		manageDocuments: {
			pageHeadingTextOverride: `${
				proofOfEvidenceType === 'lpa' ? 'LPA' : 'Appellant'
			} proof of evidence and witnesses documents`,
			addButtonTextOverride: 'Add document',
			dateColumnLabelTextOverride: 'Submitted'
		},
		addDocument: {
			pageHeadingTextOverride: `Upload new proof of evidence and witnesses document`,
			uploadContainerHeadingTextOverride: 'Upload a file'
		},
		dateSubmitted: {
			pageHeadingTextOverride: 'Received date'
		},
		checkYourAnswer: {
			pageHeadingTextOverride: `Check details and add ${proofOfEvidenceType} proof of evidence and witnesses`,
			submitButtonTextOverride: `Add ${proofOfEvidenceType} proof of evidence and witnesses`,
			supportingDocumentTextOverride: 'Proof of evidence and witnesses',
			dateSubmittedTextOverride: 'Date received'
		}
	};
	next();
};
