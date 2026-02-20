import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { APPEAL_CASE_STAGE, SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';
import { randomUUID } from 'node:crypto';
import { mapAddressIn, mapNeighbouringAddressIn } from './address.mapper.js';
import { mapAppealTypeIn } from './appeal-type.mapper.js';
import { mapAppellantCaseIn } from './appellant-case.mapper.js';
import { mapDocumentIn } from './document.mapper.js';
import { mapQuestionnaireIn } from './questionnaire.mapper.js';
import { mapRepresentationIn } from './representation.mapper.js';
import { hasContactAddressData, mapServiceUserIn } from './service-user.mapper.js';

import { renameDuplicateDocuments } from '#endpoints/integrations/integrations.utils.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisit} SiteVisit */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentationSubmission} AppealRepresentationSubmission */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealDocument} AppealDocument */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealEvent} AppealEvent */
/** @typedef {import('#db-client/models.ts').ServiceUserCreateInput} ServiceUserCreateInput */
/** @typedef {import('#db-client/models.ts').ServiceUserCreateNestedOneWithoutRepresentationsInput} ServiceUserConnectInput */
/** @typedef {import('#db-client/models.ts').RepresentationCreateInput & {represented: ServiceUserCreateInput|ServiceUserConnectInput}} RepresentationCreateInput */
/** @typedef {import('#db-client/models.ts').DocumentVersionCreateInput} DocumentVersionCreateInput */

/**
 * @param {AppellantSubmissionCommand} data
 * @returns {{ appeal: import('#db-client/models.ts').AppealCreateInput, documents: import('#db-client/models.ts').DocumentVersionCreateInput[], relatedReferences: string[], appealGrounds: {groundRef:string,factsForGround:string}[] }}
 */
const mapAppealSubmission = (data) => {
	const { casedata, documents, users } = data;

	const contactAddress = hasContactAddressData(casedata)
		? {
				addressLine1: casedata.contactAddressLine1,
				addressLine2: casedata.contactAddressLine2,
				addressCounty: casedata.contactAddressCounty,
				addressPostcode: casedata.contactAddressPostcode,
				addressTown: casedata.contactAddressTown
			}
		: null;

	let appellant = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.APPELLANT);
	let agent = users?.find((user) => user.serviceUserType === SERVICE_USER_TYPE.AGENT);

	if (contactAddress) {
		if (agent) {
			// @ts-ignore
			agent = { ...agent, ...contactAddress };
		} else {
			// @ts-ignore
			appellant = { ...appellant, ...contactAddress };
		}
	}

	const caseType = mapAppealTypeIn(casedata.caseType || '');

	const neighbouringSitesInput = {
		//@ts-ignore
		create: casedata.neighbouringSiteAddresses?.map((site) => {
			return {
				source: 'back-office',
				address: {
					create: mapNeighbouringAddressIn(site)
				}
			};
		})
	};

	/** @type {import('#db-client/models.ts').AppealCreateInput} */
	const appealInput = {
		reference: randomUUID(),
		submissionId: casedata.submissionId,
		appealType: { connect: { key: caseType } },
		appellant: { create: mapServiceUserIn(appellant, !agent && !!contactAddress) },
		agent: { create: mapServiceUserIn(agent, !!contactAddress) },
		lpa: {
			connect: { lpaCode: casedata?.lpaCode }
		},
		applicationReference: /** @type {string | null | undefined} */ (casedata?.applicationReference),
		appellantCase: { create: mapAppellantCaseIn({ casedata }) },
		neighbouringSites: neighbouringSitesInput,
		folders: {
			create: FOLDERS.map((/** @type {string} */ path) => {
				return { path };
			})
		}
	};

	const address = mapAddressIn(casedata);
	if (address.addressLine1 && address.postcode) {
		appealInput.address = { create: address };
	}

	const documentsInput = (renameDuplicateDocuments(documents) || []).map((document) =>
		mapDocumentIn(document, APPEAL_CASE_STAGE.APPELLANT_CASE)
	);

	return {
		appeal: appealInput,
		documents: documentsInput,
		relatedReferences: casedata.nearbyCaseReferences ?? [],
		// @ts-ignore
		appealGrounds: casedata.appealGrounds ?? []
	};
};

/**
 *
 * @param {LPAQuestionnaireCommand} data
 * @param {Appeal|undefined} appeal
 * @param {DesignatedSite[]} designatedSites
 * @returns {{ questionnaire: Omit<import('#db-client/models.ts').LPAQuestionnaireCreateInput,'appeal'>, documents: import('#db-client/models.ts').DocumentVersionCreateInput[], relatedReferences: string[], caseReference: string }}
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
 * @param {boolean} isRule6Party
 * @returns {{representation: Omit<import('#db-client/models.ts').RepresentationCreateInput, 'appeal'>, attachments: DocumentVersionCreateInput[]}}
 */
const mapRepresentation = (data, isRule6Party) => {
	return mapRepresentationIn(data, isRule6Party);
};

export const commandMappers = {
	mapAppealSubmission,
	mapQuestionnaireSubmission,
	mapRepresentation
};
