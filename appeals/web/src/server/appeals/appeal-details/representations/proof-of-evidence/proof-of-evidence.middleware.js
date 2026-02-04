import {
	getAllRepresentationsByType,
	getSingularRepresentationByType
} from '#appeals/appeal-details/representations/representations.service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { formatProofOfEvidenceTypeText } from './view-and-review/view-and-review.mapper.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

const proofOfEvidenceTypeToAppealRepresentationTypeMap = {
	appellant: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
	lpa: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
	'rule-6-party': APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
};

/**
 * @param {string} proofOfEvidenceType
 * @returns {proofOfEvidenceType is 'appellant' | 'lpa' | 'rule-6-party'}
 */
const isProofOfEvidenceTypeValid = (proofOfEvidenceType) =>
	['appellant', 'lpa', 'rule-6-party'].includes(proofOfEvidenceType);

/**
 * @type {import('express').RequestHandler}
 */
export const withSingularRepresentation = async (req, res, next) => {
	if (!req.params.proofOfEvidenceType && req.currentRule6Party) {
		req.params.proofOfEvidenceType = 'rule-6-party';
	}
	const { appealId, proofOfEvidenceType } = req.params;

	try {
		if (!isProofOfEvidenceTypeValid(proofOfEvidenceType)) {
			throw new Error('Invalid proofOfEvidenceType value');
		}

		const repType = proofOfEvidenceTypeToAppealRepresentationTypeMap[proofOfEvidenceType];
		let representation;

		if (proofOfEvidenceType === 'rule-6-party' && req.currentRule6Party) {
			const representations = await getAllRepresentationsByType(
				req.apiClient,
				Number(appealId),
				repType
			);
			representation = representations?.find(
				(rep) => rep.represented.id === req.currentRule6Party.serviceUserId
			);
		} else {
			representation = await getSingularRepresentationByType(
				req.apiClient,
				Number(appealId),
				repType
			);
		}

		if (!representation) {
			req.session.createNewRepresentation = true;
		} else {
			req.currentRepresentation = representation;
		}
	} catch (/** @type {any} */ error) {
		console.error('Middleware Error:', error);
		return res.status(500).render('app/500.njk');
	}

	next();
};

/**
 * Middleware to validate and attach the rule 6 party to the request
 * @type {import('express').RequestHandler}
 */
export const validateRule6Party = async (req, res, next) => {
	const { rule6PartyId } = req.params;
	const { currentAppeal } = req;

	if (!rule6PartyId) {
		return res.status(404).render('app/404.njk');
	}

	const rule6Party = currentAppeal.appealRule6Parties?.find(
		(/** @type {AppealRule6Party} */ p) => p.id === Number(rule6PartyId)
	);

	if (!rule6Party) {
		return res.status(404).render('app/404.njk');
	}

	req.currentRule6Party = rule6Party;
	next();
};

/**
 * @type {import('express').RequestHandler}
 */
export const withRule6PartyRepresentation = async (req, res, next) => {
	const { appealId } = req.params;
	const { currentRule6Party, apiClient } = req;

	try {
		if (!currentRule6Party) {
			return res.status(404).render('app/404.njk');
		}

		const url = `appeals/${appealId}/reps?type=${APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE}`;
		const apiResponse = await apiClient.get(url).json();
		const representation = apiResponse.items?.find(
			(/** @type {any} */ rep) => rep.representedId === currentRule6Party.serviceUserId
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
	const { currentAppeal, currentRule6Party } = req;
	if (!req.params.proofOfEvidenceType && currentRule6Party) {
		req.params.proofOfEvidenceType = 'rule-6-party';
	}
	const { proofOfEvidenceType } = req.params;
	const shortAppealReference = appealShortReference(currentAppeal.appealReference);

	// Get the display name for the POE type
	const orgName = currentRule6Party?.serviceUser?.organisationName || undefined;
	const typeText = formatProofOfEvidenceTypeText(proofOfEvidenceType, false, orgName);

	req.locals.pageContent = {
		preHeadingTextOverride: `Appeal ${shortAppealReference}`,
		manageDocuments: {
			pageHeadingTextOverride: `${typeText} proof of evidence and witnesses documents`,
			addButtonTextOverride: 'Add document',
			dateColumnLabelTextOverride: 'Submitted'
		},
		addDocument: {
			pageHeadingTextOverride: `Upload new proof of evidence and witnesses document`,
			uploadContainerHeadingTextOverride: 'Upload a file',
			documentTitle: 'proof of evidence and witnesses document'
		},
		dateSubmitted: {
			pageHeadingTextOverride: 'Received date'
		},
		checkYourAnswer: {
			pageHeadingTextOverride: `Check details and add ${typeText} proof of evidence and witnesses`,
			submitButtonTextOverride: `Add ${typeText} proof of evidence and witnesses`,
			supportingDocumentTextOverride: 'Proof of evidence and witnesses',
			dateSubmittedTextOverride: 'Date received'
		},
		trimUrlOnDocumentDelete: false
	};
	next();
	return;
};
