// @ts-nocheck

import { randomUUID } from 'node:crypto';

import { mapAddressIn, mapAddressOut } from './integrations.mappers/address.mapper.js';
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

const mappers = {
	mapAddressIn,
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

/** @typedef {import('#config/../openapi-types.js').AppellantCaseData} AppellantCaseData */
/** @typedef {import('#config/../openapi-types.js').QuestionnaireData} QuestionnaireData */
/** @typedef {import('#config/../openapi-types.js').DocumentMetaImport} DocumentMetaImport */

const mapAppealSubmission = (/** @type {AppellantCaseData} */ data) => {
	const { appeal, documents } = data;
	const { appellant, agent } = appeal;

	const appealInput = {
		reference: randomUUID(),
		appealType: { connect: { shorthand: mappers.mapAppealTypeIn(appeal.appealType) } },
		appellant: mappers.mapServiceUserIn(appellant),
		agent: mappers.mapServiceUserIn(agent),
		lpa: {
			connectOrCreate: {
				where: { lpaCode: appeal.LPACode },
				create: mappers.mapLpaIn(appeal)
			}
		},
		planningApplicationReference: appeal.LPAApplicationReference,
		address: { create: mappers.mapAddressIn(appeal) },
		appellantCase: { create: mappers.mapAppellantCaseIn(appeal, appellant) }
	};

	const documentsInput = (documents || []).map((document) => mappers.mapDocumentIn(document));

	return {
		appeal: appealInput,
		documents: documentsInput
	};
};

const mapQuestionnaireSubmission = (/** @type {QuestionnaireData} */ data) => {
	const { questionnaire, documents } = data;
	const questionnaireInput = mappers.mapQuestionnaireIn(questionnaire);
	const documentsInput = (documents || []).map((document) => mappers.mapDocumentIn(document));

	return {
		questionnaire: questionnaireInput,
		nearbyCaseReferences: questionnaire.nearbyCaseReferences,
		documents: documentsInput,
		caseReference: questionnaire.caseReference
	};
};

const mapDocumentSubmission = (/** @type {DocumentMetaImport} */ data) => {
	return mappers.mapDocumentIn(data);
};

const mapAppeal = (appeal) => {
	const topic = {
		appealType: mappers.mapAppealTypeOut(appeal.appealType.shorthand),
		caseReference: appeal.reference,
		LPAApplicationReference: appeal.planningApplicationReference,
		...mappers.mapLpaOut(appeal),
		...mappers.mapAddressOut(appeal),
		...mappers.mapAppealAllocationOut(appeal.allocation, appeal.specialisms),
		...mappers.mapAppellantCaseOut(appeal.appellantCase),
		...mappers.mapQuestionnaireOut(appeal.lpaQuestionnaire)
	};

	return topic;
};

const mapDocument = (doc) => {
	return mappers.mapDocumentOut(doc);
};

const mapServiceUser = (caseReference, user, userType) => {
	if (caseReference && user && userType) {
		return mappers.mapServiceUserOut(user, userType, caseReference);
	}
};

export const messageMappers = {
	mapAppealSubmission,
	mapQuestionnaireSubmission,
	mapDocumentSubmission,
	mapServiceUser,
	mapDocument,
	mapAppeal
};
