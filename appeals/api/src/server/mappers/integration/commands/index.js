import { randomUUID } from 'node:crypto';
import { APPEAL_CASE_STAGE, SERVICE_USER_TYPE } from 'pins-data-model';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { mapAddressIn, mapNeighbouringAddressIn } from './address.mapper.js';
import { mapDocumentIn } from './document.mapper.js';
import { mapServiceUserIn } from './service-user.mapper.js';
import { mapAppellantCaseIn } from './appellant-case.mapper.js';
import { mapQuestionnaireIn } from './questionnaire.mapper.js';
import { mapAppealTypeIn } from './appeal-type.mapper.js';
import { mapRepresentationIn } from './representation.mapper.js';

import { renameDuplicateDocuments } from '#endpoints/integrations/integrations.utils.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */
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

/**
 * @param {AppellantSubmissionCommand} data
 * @returns {{ appeal: import('#db-client').Prisma.AppealCreateInput, documents: import('#db-client').Prisma.DocumentVersionCreateInput[], relatedReferences: string[] }}
 */
const mapAppealSubmission = (data) => {
	const { casedata, documents, users } = data;
	const appellant = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.APPELLANT);
	const agent = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.AGENT);

	const caseType = mapAppealTypeIn(casedata.caseType || '');

	const neighbouringSitesInput = {
		create: casedata.neighbouringSiteAddresses?.map((site) => {
			return {
				source: 'back-office',
				address: {
					create: mapNeighbouringAddressIn(site)
				}
			};
		})
	};

	const appealInput = {
		reference: randomUUID(),
		submissionId: casedata.submissionId,
		appealType: { connect: { key: caseType } },
		appellant: { create: mapServiceUserIn(appellant) },
		agent: { create: mapServiceUserIn(agent) },
		lpa: {
			connect: { lpaCode: casedata?.lpaCode }
		},
		applicationReference: casedata?.applicationReference,
		address: { create: mapAddressIn(casedata) },
		appellantCase: { create: mapAppellantCaseIn({ casedata }) },
		neighbouringSites: neighbouringSitesInput,
		folders: {
			create: FOLDERS.map((/** @type {string} */ path) => {
				return { path };
			})
		}
	};

	const documentsInput = (renameDuplicateDocuments(documents) || []).map((document) =>
		mapDocumentIn(document, APPEAL_CASE_STAGE.APPELLANT_CASE)
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
 * @param {Appeal|undefined} appeal
 * @param {DesignatedSite[]} designatedSites
 * @returns {{ questionnaire: Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput,'appeal'>, documents: import('#db-client').Prisma.DocumentVersionCreateInput[], relatedReferences: string[], caseReference: string }}
 */
const mapQuestionnaireSubmission = (data, appeal, designatedSites) => {
	const { casedata, documents } = data;
	const questionnaireInput = {
		...mapQuestionnaireIn({ casedata }, designatedSites),
		neighbouringSites: {
			create: casedata.neighbouringSiteAddresses?.map((site) => {
				return {
					source: 'lpa',
					address: {
						create: mapNeighbouringAddressIn(site)
					}
				};
			})
		}
	};

	const documentsInput = (renameDuplicateDocuments(documents) || []).map((document) =>
		mapDocumentIn(document, APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE)
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

export const commandMappers = {
	mapAppealSubmission,
	mapQuestionnaireSubmission,
	mapRepresentation
};
