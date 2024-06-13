import { randomUUID } from 'node:crypto';

import {
	mapAddressIn,
	mapNeighboouringAddressIn,
	mapAddressOut
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
import { mapCaseDataOut } from './integrations.mappers/casedata.mapper.js';
import { ODW_AGENT_SVCUSR, ODW_APPELLANT_SVCUSR } from '@pins/appeals/constants/common.js';

const mappers = {
	mapAddressIn,
	mapNeighboouringAddressIn,
	mapAddressOut,
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
	mapCaseDataOut
};

/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('#config/../openapi-types.js').QuestionnaireData} QuestionnaireData */
/** @typedef {import('#config/../openapi-types.js').DocumentVersionDetails} DocumentMetaImport */

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
					create: mappers.mapNeighboouringAddressIn(site)
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
		appellantCase: { create: mappers.mapAppellantCaseIn(casedata) },
		neighbouringSites: neighbouringSitesInput
	};

	const documentsInput = (documents || []).map((document) => mappers.mapDocumentIn(document));

	return {
		appeal: appealInput,
		documents: documentsInput,
		relatedReferences: casedata.nearbyCaseReferences ?? []
	};
};

const mapQuestionnaireSubmission = (/** @type {QuestionnaireData} */ data) => {
	const { questionnaire, documents } = data;
	const questionnaireInput = mappers.mapQuestionnaireIn(questionnaire);
	const documentsInput = (documents || []).map((document) => mappers.mapDocumentIn(document));

	return {
		questionnaire: questionnaireInput,
		nearbyCaseReferences: questionnaire?.nearbyCaseReferences,
		documents: documentsInput,
		caseReference: questionnaire?.caseReference
	};
};

/**
 *
 * @param {*} appeal
 * @returns
 */
const mapAppeal = (appeal) => {
	const topic = {
		caseType: mappers.mapAppealTypeOut(appeal.appealType.shorthand),
		caseId: appeal.id,
		caseReference: appeal.reference,
		applicationReference: appeal.planningApplicationReference,
		...mappers.mapLpaOut(appeal),
		...mappers.mapAddressOut(appeal),
		...mappers.mapAppealAllocationOut(appeal.allocation, appeal.specialisms),
		...mappers.mapAppellantCaseOut(appeal.appellantCase),
		...mappers.mapQuestionnaireOut(appeal.lpaQuestionnaire)
	};

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
