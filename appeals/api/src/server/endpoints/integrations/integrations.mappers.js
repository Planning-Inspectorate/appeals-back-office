import { randomUUID } from 'node:crypto';

import {
	mapAddressIn,
	mapNeighbouringAddressIn,
	mapAddressOut,
	mapNeighbouringAddressOut,
	mapSiteAccessDetailsOut,
	mapSiteSafetyDetailsOut
} from './integrations.mappers/address.mapper.js';
import { mapLpaIn, mapLpaOut } from './integrations.mappers/lpa.mapper.js';
import { mapDocumentIn, mapDocumentOut } from './integrations.mappers/document.mapper.js';
import { mapServiceUserIn, mapServiceUserOut } from './integrations.mappers/service-user.mapper.js';
import {
	mapAppellantCaseIn,
	mapAppellantCaseOut
} from './integrations.mappers/appellant-case.mapper.js';
import {
	mapQuestionnaireIn,
	mapQuestionnaireOut
} from './integrations.mappers/questionnaire.mapper.js';
import { mapAppealTypeIn, mapAppealTypeOut } from './integrations.mappers/appeal-type.mapper.js';
import { mapAppealAllocationOut } from './integrations.mappers/appeal-allocation.mapper.js';
import {
	mapAppealStatusOut,
	mapAppealDatesOut,
	mapAppealValidationOut,
	mapQuestionnaireValidationOut,
	mapAppealRelationships
} from './integrations.mappers/casedata.mapper.js';
import { ODW_AGENT_SVCUSR, ODW_APPELLANT_SVCUSR } from '@pins/appeals/constants/common.js';
import { STAGE } from '@pins/appeals/constants/documents.js';
import { FOLDERS } from '@pins/appeals/constants/documents.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */

const mappers = {
	mapAddressIn,
	mapNeighbouringAddressIn,
	mapAddressOut,
	mapNeighbouringAddressOut,
	mapLpaIn,
	mapLpaOut,
	mapDocumentIn,
	mapDocumentOut,
	mapAppealTypeIn,
	mapAppealTypeOut,
	mapAppellantCaseIn,
	mapAppellantCaseOut,
	mapQuestionnaireIn,
	mapQuestionnaireOut,
	mapServiceUserIn,
	mapServiceUserOut,
	mapAppealAllocationOut,
	mapAppealStatusOut,
	mapAppealDatesOut,
	mapSiteAccessDetailsOut,
	mapSiteSafetyDetailsOut,
	mapAppealValidationOut,
	mapQuestionnaireValidationOut,
	mapAppealRelationships
};

/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {Pick<LPAQuestionnaireCommand, 'casedata'>} LPAQuestionnaire */

/**
 * @param {AppellantSubmissionCommand} data
 * @returns {{ appeal: *, documents: *[], relatedReferences: string[] }}
 */
const mapAppealSubmission = (data) => {
	const { casedata, documents, users } = data;
	const appellant = users?.find((user) => user.serviceUserType === ODW_APPELLANT_SVCUSR);
	const agent = users?.find((user) => user.serviceUserType === ODW_AGENT_SVCUSR);

	const neighbouringSitesInput = {
		create: casedata.neighbouringSiteAddresses?.map((site) => {
			return {
				source: 'back-office',
				address: {
					create: mappers.mapNeighbouringAddressIn(site)
				}
			};
		})
	};

	const appealInput = {
		reference: randomUUID(),
		appealType: { connect: { key: mappers.mapAppealTypeIn(casedata?.caseType) } },
		appellant: { create: mappers.mapServiceUserIn(appellant) },
		agent: { create: mappers.mapServiceUserIn(agent) },
		lpa: {
			connect: { lpaCode: casedata?.lpaCode }
		},
		applicationReference: casedata?.applicationReference,
		address: { create: mappers.mapAddressIn(casedata) },
		appellantCase: { create: mappers.mapAppellantCaseIn({ casedata }) },
		neighbouringSites: neighbouringSitesInput,
		folders: {
			create: FOLDERS.map((/** @type {string} */ path) => {
				return { path };
			})
		}
	};

	const documentsInput = (documents || []).map((document) =>
		mappers.mapDocumentIn(document, STAGE.APPELLANT_CASE)
	);

	return {
		appeal: appealInput,
		documents: documentsInput,
		relatedReferences: casedata.nearbyCaseReferences ?? []
	};
};

/**
 *
 * @param {LPAQuestionnaireCommand} data
 * @returns {{ questionnaire: *, documents: *[], relatedReferences: string[], caseReference: string }}
 */
const mapQuestionnaireSubmission = (data) => {
	const { casedata, documents } = data;
	const questionnaireInput = {
		...mappers.mapQuestionnaireIn({ casedata }),
		neighbouringSites: {
			create: casedata.neighbouringSiteAddresses?.map((site) => {
				return {
					source: 'lpa',
					address: {
						create: mappers.mapNeighbouringAddressIn(site)
					}
				};
			})
		}
	};

	const documentsInput = (documents || []).map((document) =>
		mappers.mapDocumentIn(document, STAGE.LPA_QUESTIONNAIRE)
	);

	return {
		questionnaire: questionnaireInput,
		relatedReferences: casedata?.nearbyCaseReferences ?? [],
		documents: documentsInput,
		caseReference: casedata?.caseReference
	};
};

/**
 *
 * @param {Appeal} appeal
 * @returns {AppealHASCase}
 */
const mapAppeal = (appeal) => {
	const topic = {
		// Main info
		caseStatus: mappers.mapAppealStatusOut(appeal),
		caseType: mappers.mapAppealTypeOut(appeal.appealType),
		caseProcedure: appeal.procedureType?.key || 'written',
		caseId: appeal.id,
		caseReference: appeal.reference,
		applicationReference: appeal.applicationReference,
		...mappers.mapLpaOut(appeal),
		...mappers.mapAppealAllocationOut(appeal.allocation, appeal.specialisms || []),
		// EntraID users
		caseOfficerId: appeal.caseOfficer?.azureAdUserId || null,
		inspectorId: appeal.inspector?.azureAdUserId || null,
		// Site info
		...mappers.mapSiteAccessDetailsOut(appeal),
		...mappers.mapSiteSafetyDetailsOut(appeal),
		...mappers.mapAddressOut(appeal),
		// Submissions
		...mappers.mapAppellantCaseOut(appeal.appellantCase),
		...mappers.mapQuestionnaireOut(appeal.lpaQuestionnaire),
		...mappers.mapAppealDatesOut(appeal),
		...mappers.mapAppealValidationOut(appeal),
		...mappers.mapQuestionnaireValidationOut(appeal),
		neighbouringSiteAddresses: mappers.mapNeighbouringAddressOut(appeal.neighbouringSites || []),
		affectedListedBuildingNumbers:
			appeal.lpaQuestionnaire?.listedBuildingDetails?.map((lb) => lb.listEntry) || null,
		// Decision
		caseDecisionOutcome: appeal.inspectorDecision?.outcome || null,
		// linked and related appeals
		...mapAppealRelationships(appeal)
	};

	// @ts-ignore
	return topic;
};

/**
 *
 * @param {*} doc
 * @returns
 */
const mapDocument = (doc) => {
	return mappers.mapDocumentOut(doc);
};

/**
 *
 * @param {string} caseReference
 * @param {*} user
 * @param {string} userType
 * @returns
 */
const mapServiceUser = (caseReference, user, userType) => {
	if (caseReference && user && userType) {
		return mappers.mapServiceUserOut(user, userType, caseReference);
	}
};

export const messageMappers = {
	mapAppealSubmission,
	mapQuestionnaireSubmission,
	mapServiceUser,
	mapDocument,
	mapAppeal
};
