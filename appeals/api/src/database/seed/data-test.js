/**
 * Test data used for development and testing
 */
import { randomUUID } from 'node:crypto';
import {
	addressesList,
	addressListForTrainers,
	getRandomisedAppellantCaseCreateInput,
	appellantsList,
	agentsList,
	createLPAQuestionnaireForAppealType
} from './data-samples.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { calculateTimetable } from '@pins/appeals/utils/business-days.js';

import neighbouringSitesRepository from '#repositories/neighbouring-sites.repository.js';
import { createAppealReference } from '#utils/appeal-reference.js';
import { APPEAL_CASE_STATUS, APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { ODW_SYSTEM_ID, APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_SYSTEM_UUID,
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '@pins/appeals/constants/support.js';
import { sub } from 'date-fns';

import { randomBool } from './data-utilities.js';
import isFPA from '@pins/appeals/utils/is-fpa.js';

/** @typedef {import('@pins/appeals.api').Appeals.AppealSite} AppealSite */

/**
 * @param {Duration} duration
 * @returns {Date} date two weeks ago
 */
function getPastDate(duration) {
	return sub(new Date(), duration);
}

/**
 *
 * @param {object[] | string[]} list
 * @returns {number}
 */
const pickRandom = (list) => Math.floor(Math.random() * list.length);

/**
 * @returns {string}
 */
function generateLpaReference() {
	const numberPrefix = Math.floor(Math.random() * 69_999 + 1);
	const numberSuffix = Math.floor(Math.random() * 699_999 + 1);
	const date = pickRandom(['2020', '2021', '2022', '2023']);

	return `${numberPrefix}/APP/${date}/${numberSuffix}`;
}

/**
 *
 * @param {{
 * 	typeShorthand: string,
 * 	status?: import('#db-client').Prisma.AppealStatusCreateWithoutAppealInput,
 *  lpaQuestionnaire?: boolean,
 *  startedAt?: Date | null,
 *  validAt?: Date | null,
 *  siteAddressList?: AppealSite[],
 *  assignCaseOfficer: boolean,
 *  agent?: boolean }} param0
 * @returns {import('#db-client').Prisma.AppealCreateInput}
 */
const appealFactory = ({
	typeShorthand,
	status = {},
	lpaQuestionnaire = false,
	startedAt = null,
	validAt = null,
	siteAddressList = addressesList,
	assignCaseOfficer = false,
	agent = true
}) => {
	const appellantInput = appellantsList[pickRandom(appellantsList)];
	const agentInput = agentsList[pickRandom(agentsList)];
	const lpaInput = localPlanningDepartmentList[pickRandom(localPlanningDepartmentList)];
	const randomAddress = siteAddressList[pickRandom(siteAddressList)];
	const formattedAddress = {
		addressLine1: randomAddress.addressLine1,
		addressLine2: randomAddress.addressLine2 || null,
		addressCounty: randomAddress.county || null,
		addressTown: randomAddress.town || null,
		postcode: randomAddress.postCode,
		addressCountry: null
	};

	const appeal = {
		appealType: { connect: { key: typeShorthand } },
		caseStartedDate: startedAt,
		caseValidDate: validAt,
		reference: randomUUID(),
		appealStatus: { create: status },
		appellantCase: { create: getRandomisedAppellantCaseCreateInput(typeShorthand) },
		appellant: {
			create: appellantInput
		},
		...(agent && {
			agent: {
				create: agentInput
			}
		}),
		lpa: {
			connectOrCreate: {
				where: { lpaCode: lpaInput.lpaCode },
				create: lpaInput
			}
		},
		applicationReference: generateLpaReference(),
		address: { create: formattedAddress },
		...(assignCaseOfficer && {
			caseOfficer: {
				connectOrCreate: {
					where: { azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID },
					create: { azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID }
				}
			}
		}),
		...(lpaQuestionnaire && {
			lpaQuestionnaire: { create: createLPAQuestionnaireForAppealType(typeShorthand) }
		})
	};

	return appeal;
};

const newAppeals = [
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.D, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.D, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.D, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.D, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		assignCaseOfficer: true
	})
];

// S78
const newS78Appeals = [
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.W, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ days: 5 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 2 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 1 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ weeks: 3 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ weeks: 4 }) },
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 5 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 4 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ weeks: 7 }),
		validAt: getPastDate({ months: 4 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 4 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 2 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 4 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 1 }),
		validAt: getPastDate({ months: 3 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 12 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 4 }),
		validAt: getPastDate({ months: 5 }),
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 8 }),
		validAt: getPastDate({ months: 9 }),
		assignCaseOfficer: false,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 5 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 1 }),
		validAt: getPastDate({ months: 5 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 7 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 3 }),
		validAt: getPastDate({ months: 5 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 8 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 7 }),
		validAt: getPastDate({ months: 8 }),
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.W,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 6 }),
		validAt: getPastDate({ months: 10 }),
		assignCaseOfficer: false,
		agent: true
	})
];

const newS20Appeals = [
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.Y, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ days: 5 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ days: 5 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: false,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 6 }),
		validAt: getPastDate({ months: 10 }),
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 6 }),
		validAt: getPastDate({ months: 10 }),
		assignCaseOfficer: false,
		agent: true
	})
];

const newCASAppeals = [
	appealFactory({ typeShorthand: APPEAL_CASE_TYPE.Z, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ days: 5 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getPastDate({ days: 5 }) },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: false,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.STATEMENTS, createdAt: getPastDate({ months: 6 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 2 }),
		validAt: getPastDate({ months: 6 }),
		assignCaseOfficer: true,
		agent: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 6 }),
		validAt: getPastDate({ months: 10 }),
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Z,
		status: { status: APPEAL_CASE_STATUS.FINAL_COMMENTS, createdAt: getPastDate({ months: 10 }) },
		lpaQuestionnaire: true,
		startedAt: getPastDate({ months: 6 }),
		validAt: getPastDate({ months: 10 }),
		assignCaseOfficer: false,
		agent: true
	})
];

// HAS
const appealsLpaQuestionnaireDue = [
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 6 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 6 }),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 5 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 5 }),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 3 }),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 3 }),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 1 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 1 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getPastDate({ weeks: 1 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	})
];

// HAS
const appealsReadyToStart = [
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getPastDate({ weeks: 3 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getPastDate({ weeks: 3 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getPastDate({ weeks: 2 })
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getPastDate({ weeks: 2 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getPastDate({ weeks: 1 })
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	})
];

const appealsReadyToIssueDecision = [
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.D,
		status: {
			status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_CASE_TYPE.Y,
		status: {
			status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
			createdAt: getPastDate({ weeks: 3 })
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getPastDate({ weeks: 1 }),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	})
];

const appealsData = [
	...appealsReadyToStart,
	...newAppeals,
	...appealsLpaQuestionnaireDue,
	...newS78Appeals,
	...newS20Appeals,
	...newCASAppeals,
	...appealsReadyToIssueDecision
];

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 */
export async function seedTestData(databaseConnector) {
	const appeals = [];

	for (const appealData of appealsData) {
		const appeal = await databaseConnector.appeal.create({ data: appealData });
		const defaultFolders = FOLDERS.map((/** @type {string} */ path) => {
			return {
				caseId: appeal.id,
				path
			};
		});

		await databaseConnector.folder.createMany({ data: defaultFolders });
		const appealWithReference = await databaseConnector.appeal.update({
			where: {
				id: appeal.id
			},
			data: {
				reference: createAppealReference(appeal.id)
			}
		});
		appeals.push(appealWithReference);
	}

	const lpaQuestionnaires = await databaseConnector.lPAQuestionnaire.findMany();
	const lpaNotificationMethods = await databaseConnector.lPANotificationMethods.findMany();
	const designatedSites = await databaseConnector.designatedSite.findMany();

	for (const lpaQuestionnaire of lpaQuestionnaires) {
		await databaseConnector.listedBuildingSelected.createMany({
			data: ['1021469', '1021470', '1021472', '1021473'].map((listEntry, index) => ({
				lpaQuestionnaireId: lpaQuestionnaire.id,
				listEntry,
				affectsListedBuilding: index > 1
			}))
		});

		await databaseConnector.lPANotificationMethodsSelected.createMany({
			data: [1, 2].map((item) => ({
				lpaQuestionnaireId: lpaQuestionnaire.id,
				notificationMethodId: lpaNotificationMethods[item].id
			}))
		});

		await databaseConnector.designatedSiteSelected.createMany({
			data: [1, 2].map((item) => ({
				lpaQuestionnaireId: lpaQuestionnaire.id,
				designatedSiteId: designatedSites[item].id
			}))
		});
	}

	const appealWithNeighbouringSitesId = appeals[10].id;

	const randomAddress = addressesList[pickRandom(addressesList)];
	const formattedAddress = {
		addressLine1: randomAddress.addressLine1,
		addressLine2: randomAddress.addressLine2 || null,
		addressCounty: randomAddress.county || null,
		addressTown: randomAddress.town || undefined,
		postcode: randomAddress.postCode
	};

	await neighbouringSitesRepository.addSite(
		appealWithNeighbouringSitesId,
		'back-office',
		formattedAddress
	);
	await neighbouringSitesRepository.addSite(appealWithNeighbouringSitesId, 'lpa', formattedAddress);
	const linkedAppeals = [
		{
			parentRef: appeals[0].reference,
			parentId: appeals[0].id,
			childRef: appeals[1].reference,
			childId: appeals[1].id,
			type: CASE_RELATIONSHIP_LINKED
		},
		{
			parentRef: appeals[0].reference,
			parentId: appeals[0].id,
			childRef: appeals[2].reference,
			childId: appeals[2].id,
			type: CASE_RELATIONSHIP_LINKED
		},
		{
			parentRef: appeals[0].reference,
			parentId: appeals[0].id,
			childRef: appeals[16].reference,
			childId: appeals[16].id,
			type: CASE_RELATIONSHIP_LINKED
		},
		{
			parentRef: appeals[4].reference,
			parentId: appeals[4].id,
			childRef: appeals[19].reference,
			childId: appeals[19].id,
			type: CASE_RELATIONSHIP_LINKED
		},
		{
			parentRef: appeals[4].reference,
			parentId: appeals[4].id,
			childRef: appeals[20].reference,
			childId: appeals[20].id,
			type: CASE_RELATIONSHIP_LINKED
		}
	];

	const relatedAppeals = [
		{
			parentRef: appeals[11].reference,
			parentId: appeals[11].id,
			childRef: appeals[12].reference,
			childId: appeals[12].id,
			type: CASE_RELATIONSHIP_RELATED
		},
		{
			parentRef: appeals[12].reference,
			parentId: appeals[12].id,
			childRef: appeals[13].reference,
			childId: appeals[13].id,
			type: CASE_RELATIONSHIP_RELATED
		}
	];

	await databaseConnector.appealRelationship.createMany({
		data: [...linkedAppeals, ...relatedAppeals]
	});

	const appealTypes = await databaseConnector.appealType.findMany();
	const appealStatus = await databaseConnector.appealStatus.findMany();
	const siteVisitType = await databaseConnector.siteVisitType.findMany();

	const counters = {
		finalComment: 0,
		statements: 0
	};

	for (const { appealTypeId, id, caseStartedDate, lpaId, appellantId } of appeals) {
		const appealType =
			appealTypes.filter(({ id }) => id === appealTypeId)[0].key || APPEAL_CASE_TYPE.D;

		if (caseStartedDate) {
			const appealTimetable = await calculateTimetable(appealType, caseStartedDate);

			await databaseConnector.appealTimetable.create({
				data: {
					appealId: id,
					...appealTimetable
				}
			});
		}

		//REPS
		if (isFPA(appealType)) {
			await databaseConnector.representation.create({
				data: {
					appeal: {
						connect: {
							id
						}
					},
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
					originalRepresentation: `Statement from appellant`,
					represented: {
						create: appellantsList[pickRandom(appellantsList)]
					}
				},
				include: {
					represented: true
				}
			});

			await addStatements(databaseConnector, id, lpaId, counters);
			await addFinalComments(databaseConnector, id, appellantId || 0, lpaId, counters);
		}

		const statusWithSiteVisitSet = appealStatus.find(
			({ appealId, status, valid }) =>
				appealId === id &&
				valid &&
				[APPEAL_CASE_STATUS.ISSUE_DETERMINATION, APPEAL_CASE_STATUS.COMPLETE].includes(status)
		);

		const today = new Date();

		if (statusWithSiteVisitSet) {
			await databaseConnector.siteVisit.create({
				data: {
					appealId: id,
					visitDate: today,
					visitEndTime: `${today.toISOString().split('T')[0]}T16:00:00.000Z`,
					visitStartTime: `${today.toISOString().split('T')[0]}T14:00:00.000Z`,
					siteVisitTypeId: siteVisitType[pickRandom(siteVisitType)].id
				}
			});
		}
	}

	const appellantCases = await databaseConnector.appellantCase.findMany();

	const knowledgeOfOtherLandowners = await databaseConnector.knowledgeOfOtherLandowners.findMany({
		where: {
			name: 'Some'
		}
	});

	const validationOutcomes = await databaseConnector.appellantCaseValidationOutcome.findMany({
		orderBy: {
			name: 'asc'
		}
	});

	const appellantCaseIncompleteReasons =
		await databaseConnector.appellantCaseIncompleteReason.findMany();

	const appellantCaseInvalidReasons = await databaseConnector.appellantCaseInvalidReason.findMany();

	const appellantCaseValidationOutcomes = [
		{
			validationOutcomeId: validationOutcomes[0].id,
			incompleteReasons: appellantCaseIncompleteReasons.map(({ id }) => id)
		},
		{
			validationOutcomeId: validationOutcomes[1].id,
			invalidReasons: appellantCaseInvalidReasons.map(({ id }) => id)
		},
		{
			validationOutcomeId: validationOutcomes[2].id
		}
	];

	for (const appellantCase of appellantCases) {
		const status = appealStatus.find(({ appealId }) => appealId === appellantCase.appealId);
		const validationOutcome =
			status?.status !== APPEAL_CASE_STATUS.VALIDATION &&
			status?.status !== APPEAL_CASE_STATUS.READY_TO_START &&
			status?.status !== APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER
				? appellantCaseValidationOutcomes[2]
				: null;

		const planningObligation = randomBool();
		const statusPlanningObligation = planningObligation
			? randomBool()
				? 'finalised'
				: 'not_started' // TODO (A2-173): replace with data model constants once those are available
			: null;

		await databaseConnector.appellantCase.update({
			where: { id: appellantCase.id },
			data: {
				hasAdvertisedAppeal: true,
				knowsOtherOwnersId: knowledgeOfOtherLandowners[0].id,
				...(validationOutcome && {
					appellantCaseValidationOutcomeId: validationOutcome.validationOutcomeId
				}),
				planningObligation,
				statusPlanningObligation
			}
		});

		if (validationOutcome?.incompleteReasons) {
			await databaseConnector.appellantCaseIncompleteReasonsSelected.createMany({
				data: validationOutcome?.incompleteReasons.map((item) => ({
					appellantCaseIncompleteReasonId: item,
					appellantCaseId: appellantCase.id
				}))
			});
			await databaseConnector.appeal.update({
				where: { id: appellantCase.appealId },
				data: { caseExtensionDate: new Date() }
			});
		}

		if (validationOutcome?.invalidReasons) {
			await databaseConnector.appellantCaseInvalidReasonsSelected.createMany({
				data: validationOutcome?.invalidReasons.map((item) => ({
					appellantCaseInvalidReasonId: item,
					appellantCaseId: appellantCase.id
				}))
			});
		}
	}
}

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 * @param {number} id
 * @param {number} lpaId
 * @param {Object<string, number>} counters
 */
async function addStatements(databaseConnector, id, lpaId, counters) {
	switch (counters.statements) {
		case 1:
			await addIPComments(databaseConnector, id);
			break;
		case 2:
			await addLpaStatement(databaseConnector, id, lpaId);
			break;
		case 3:
			await addIPComments(databaseConnector, id);
			await addLpaStatement(databaseConnector, id, lpaId);
			break;
		default:
			break;
	}

	if (counters.statements > 2) {
		counters.statements = 0;
	} else {
		counters.statements++;
	}
}

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 * @param {number} id
 */
async function addIPComments(databaseConnector, id) {
	const formatSourceMap = {
		[ODW_SYSTEM_ID]: 'Back Office',
		citizen: 'Front Office'
	};
	const originalRepresentation =
		'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.';

	const rejectionReason = await databaseConnector.representationRejectionReason.findFirst();
	for (let ii in appellantsList) {
		const represented = appellantsList[ii];
		const source = Number(ii) % 2 ? 'citizen' : ODW_SYSTEM_ID;
		const hasEmail = !!(Number(ii) % 3);
		const status = getRandomReviewStatus();

		const repRecord = await databaseConnector.representation.create({
			data: {
				appeal: {
					connect: {
						id
					}
				},
				representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
				originalRepresentation,
				represented: {
					create: {
						...represented,
						email: hasEmail ? represented.email : null,
						lastName: `${represented.lastName} - Source: ${formatSourceMap[source]} - Has email: ${hasEmail}`
					}
				},
				source,
				...(status && { status })
			},
			include: {
				represented: true
			}
		});

		if (status === 'invalid') {
			await databaseConnector.representationRejectionReasonsSelected.create({
				data: {
					representation: {
						connect: { id: repRecord.id }
					},
					representationRejectionReason: {
						connect: { id: rejectionReason?.id }
					}
				}
			});
		}
	}
}

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 * @param {number} id
 * @param {number} lpaId
 */
async function addLpaStatement(databaseConnector, id, lpaId) {
	await databaseConnector.representation.create({
		data: {
			appeal: {
				connect: {
					id
				}
			},
			representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
			originalRepresentation: `Every single thing in the world has its own personality - and it is up to you to make friends with the little rascals. Steve wants reflections, so let's give him reflections. It's amazing what you can do with a little love in your heart. Clouds are free they come and go as they please.

The secret to doing anything is believing that you can do it. Anything that you believe you can do strong enough, you can do. Anything. As long as you believe. It looks so good, I might as well not stop. This present moment is perfect simply due to the fact you're experiencing it. Making all those little fluffies that live in the clouds.

You don't want to kill all your dark areas they are very important. I will take some magic white, and a little bit of Vandyke brown and a little touch of yellow. Anyone can paint. Each highlight must have it's own private shadow. Don't fiddle with it all day.`,
			lpa: {
				connect: {
					id: lpaId
				}
			},
			source: 'lpa'
		},
		include: {
			represented: true
		}
	});
}

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 * @param {number} id
 * @param {number} appellantId
 * @param {number} lpaId
 * @param {Object<string, number>} counters
 */
async function addFinalComments(databaseConnector, id, appellantId, lpaId, counters) {
	switch (counters.finalComment) {
		case 1:
			await addFinalComment(databaseConnector, id, 'appellant', appellantId);
			break;
		case 2:
			await addFinalComment(databaseConnector, id, 'LPA', lpaId);
			break;
		case 3:
			await addFinalComment(databaseConnector, id, 'appellant', appellantId);
			await addFinalComment(databaseConnector, id, 'LPA', lpaId);
			break;
		default:
			break;
	}

	if (counters.finalComment > 2) {
		counters.finalComment = 0;
	} else {
		counters.finalComment++;
	}
}

/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 * @param {number} id
 * @param {'appellant'|'LPA'} source
 * @param {number} sourceId
 */
async function addFinalComment(databaseConnector, id, source, sourceId) {
	await databaseConnector.representation.create({
		data: {
			appeal: {
				connect: {
					id
				}
			},
			representationType:
				source === 'appellant'
					? APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
					: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
			originalRepresentation: `Final comment from ${source}. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.`,
			...(source === 'appellant'
				? {
						represented: {
							connect: {
								// @ts-ignore
								id: sourceId
							}
						}
				  }
				: {
						lpa: {
							connect: {
								// @ts-ignore
								id: sourceId
							}
						}
				  })
		},
		include: {
			represented: true
		}
	});
}

function getRandomReviewStatus() {
	const pmf = [0.6, 0.2, 0.2];
	const cdf = pmf.map(
		(
			(sum) => (value) =>
				(sum += value)
		)(0)
	);
	const rand = Math.random();
	const index = cdf.findIndex((el) => rand <= el);
	switch (index) {
		case 2:
			return 'valid';
		case 1:
			return 'invalid';
	}
	return null;
}
