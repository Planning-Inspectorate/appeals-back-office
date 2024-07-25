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
import { APPEAL_CASE_STAGE, SERVICE_USER_TYPE } from 'pins-data-model';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { mapSiteVisitOut } from './integrations.mappers/site-visit.mapper.js';

/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('pins-data-model').Schemas.ServiceUser} AppealServiceUser */
/** @typedef {import('pins-data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */

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
	mapAppealRelationships,
	mapSiteVisitOut
};

/**
 * @param {AppellantSubmissionCommand} data
 * @returns {{ appeal: import('#db-client').Prisma.AppealCreateInput, documents: *[], relatedReferences: string[] }}
 */
const mapAppealSubmission = (data) => {
	const { casedata, documents, users } = data;
	const appellant = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.APPELLANT);
	const agent = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.AGENT);

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
		submissionId: casedata.submissionId,
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
		mappers.mapDocumentIn(document, APPEAL_CASE_STAGE.APPELLANT_CASE)
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
 * @returns {{ questionnaire: import('#db-client').Prisma.LPAQuestionnaireCreateInput, documents: *[], relatedReferences: string[], caseReference: string }}
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
		mappers.mapDocumentIn(document, APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE)
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
		submissionId: appeal.submissionId,
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
 * @param {Document} doc
 * @returns
 */
const mapDocument = (doc) => {
	return mappers.mapDocumentOut(doc);
};

/**
 *
 * @param {SiteVisit} siteVisit
 * @returns
 */
const mapSiteVisit = (siteVisit) => mapSiteVisitOut(siteVisit);

// {
// try {
// 	return mapSiteVisitOut(siteVisit);
// } catch (e) {
// 	console.log('site-visit-map', e)
// }
//}

/**
 *
 * @param {string} caseReference
 * @param {ServiceUser} user
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
	mapAppeal,
	mapSiteVisit
};
