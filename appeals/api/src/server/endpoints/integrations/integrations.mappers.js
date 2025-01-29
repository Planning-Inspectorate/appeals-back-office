import { randomUUID } from 'node:crypto';

import { mapAddressIn, mapNeighbouringAddressIn } from './integrations.mappers/address.mapper.js';
import { mapLpaIn } from './integrations.mappers/lpa.mapper.js';
import { mapDocumentIn } from './integrations.mappers/document.mapper.js';
import { mapServiceUserIn } from './integrations.mappers/service-user.mapper.js';
import { mapAppellantCaseIn } from './integrations.mappers/appellant-case.mapper.js';
import { mapQuestionnaireIn } from './integrations.mappers/questionnaire.mapper.js';
import { mapAppealTypeIn } from './integrations.mappers/appeal-type.mapper.js';

import { APPEAL_CASE_STAGE, SERVICE_USER_TYPE } from 'pins-data-model';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { renameDuplicateDocuments } from './integrations.utils.js';
import { mapRepresentationIn } from './integrations.mappers/representation.mapper.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('pins-data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('pins-data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('pins-data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('#db-client').Prisma.ServiceUserCreateInput} ServiceUserCreateInput */
/** @typedef {import('#db-client').Prisma.ServiceUserCreateNestedOneWithoutRepresentationsInput} ServiceUserConnectInput */
/** @typedef {import('#db-client').Prisma.RepresentationCreateInput & {represented: ServiceUserCreateInput|ServiceUserConnectInput}} RepresentationCreateInput */
/** @typedef {import('#db-client').Prisma.DocumentVersionCreateInput} DocumentVersionCreateInput */

const mappers = {
	mapAddressIn,
	mapNeighbouringAddressIn,
	mapLpaIn,
	mapDocumentIn,
	mapAppealTypeIn,
	mapAppellantCaseIn,
	mapQuestionnaireIn,
	mapServiceUserIn
};

/**
 * @param {AppellantSubmissionCommand} data
 * @returns {{ appeal: import('#db-client').Prisma.AppealCreateInput, documents: import('#db-client').Prisma.DocumentVersionCreateInput[], relatedReferences: string[] }}
 */
const mapAppealSubmission = (data) => {
	const { casedata, documents, users } = data;
	const appellant = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.APPELLANT);
	const agent = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.AGENT);

	const caseType = mappers.mapAppealTypeIn(casedata.caseType || '');

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
		appealType: { connect: { key: caseType } },
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

	const documentsInput = (renameDuplicateDocuments(documents) || []).map((document) =>
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
 * @returns {{ questionnaire: Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput,'appeal'>, documents: import('#db-client').Prisma.DocumentVersionCreateInput[], relatedReferences: string[], caseReference: string }}
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

	const documentsInput = (renameDuplicateDocuments(documents) || []).map((document) =>
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
 * @param {AppealRepresentationSubmission} data
 * @returns {{representation: Omit<import('#db-client').Prisma.RepresentationCreateInput, 'appeal'>, attachments: DocumentVersionCreateInput[]}}
 */
const mapRepresentation = (data) => {
	return mapRepresentationIn(data);
};

export const messageMappers = {
	mapAppealSubmission,
	mapQuestionnaireSubmission,
	mapRepresentation
};
