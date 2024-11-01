/**
 * Test data used for development and testing
 */
import { randomUUID } from 'node:crypto';
import { AUDIT_TRAIL_SYSTEM_UUID } from '#endpoints/constants.js';
import {
	addressesList,
	addressListForTrainers,
	getRandomisedAppellantCaseCreateInput,
	appellantsList,
	agentsList,
	createLPAQuestionnaireForAppealType
} from './data-samples.js';
import { localPlanningDepartmentList } from './LPAs/dev.js';
import { calculateTimetable } from '#utils/business-days.js';
import {
	APPEAL_TYPE_SHORTHAND_HAS,
	APPEAL_TYPE_SHORTHAND_FPA,
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED
} from '#endpoints/constants.js';

import neighbouringSitesRepository from '#repositories/neighbouring-sites.repository.js';
import { createAppealReference } from '#utils/appeal-reference.js';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { randomBool } from './data-samples.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';

/** @typedef {import('@pins/appeals.api').Appeals.AppealSite} AppealSite */

/**
 * @returns {Date} date two weeks ago
 */
function getDateTwoWeeksAgo() {
	const date = new Date();

	date.setDate(date.getDate() - 14);
	date.setHours(23);
	return date;
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
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_HAS, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_HAS, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_HAS, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_HAS, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		assignCaseOfficer: true
	})
];

const newS78Appeals = [
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_FPA, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		assignCaseOfficer: false,
		agent: false
	}),
	appealFactory({ typeShorthand: APPEAL_TYPE_SHORTHAND_FPA, assignCaseOfficer: false }),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		status: { status: APPEAL_CASE_STATUS.VALIDATION, createdAt: getDateTwoWeeksAgo() },
		lpaQuestionnaire: true,
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getDateTwoWeeksAgo() },
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true,
		agent: false
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_FPA,
		status: { status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, createdAt: getDateTwoWeeksAgo() },
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true,
		agent: false
	})
];

const appealsLpaQuestionnaireDue = [
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: true,
		startedAt: new Date(),
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	})
];

const appealsReadyToStart = [
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	}),
	appealFactory({
		typeShorthand: APPEAL_TYPE_SHORTHAND_HAS,
		status: {
			status: APPEAL_CASE_STATUS.READY_TO_START,
			createdAt: getDateTwoWeeksAgo()
		},
		lpaQuestionnaire: false,
		startedAt: null,
		validAt: getDateTwoWeeksAgo(),
		siteAddressList: addressListForTrainers,
		assignCaseOfficer: true
	})
];

const appealsData = [
	...appealsReadyToStart,
	...newAppeals,
	...appealsLpaQuestionnaireDue,
	...newS78Appeals
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

	for (const lpaQuestionnaire of lpaQuestionnaires) {
		await databaseConnector.listedBuildingSelected.createMany({
			data: ['123456', '654321', '789012', '210987'].map((listEntry, index) => ({
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

	for (const { appealTypeId, id, caseStartedDate, lpaId, appellantId } of appeals) {
		const appealType =
			appealTypes.filter(({ id }) => id === appealTypeId)[0].key || APPEAL_TYPE_SHORTHAND_HAS;

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
		if (appealType === APPEAL_TYPE_SHORTHAND_FPA) {
			const formatSourceMap = {
				[ODW_SYSTEM_ID]: 'Back Office',
				citizen: 'Front Office'
			};
			const originalRepresentation =
				'I love cheese, especially cottage cheese queso. Ricotta monterey jack emmental cheese and biscuits jarlsberg manchego roquefort babybel. Chalk and cheese cut the cheese cream cheese croque monsieur cheese strings blue castello halloumi say cheese.';

			for (let ii in appellantsList) {
				const represented = appellantsList[ii];
				const source = Number(ii) % 2 ? 'citizen' : ODW_SYSTEM_ID;
				const hasEmail = !!(Number(ii) % 3);

				await databaseConnector.representation.create({
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
						source
					},
					include: {
						represented: true
					}
				});
			}

			await databaseConnector.representation.create({
				data: {
					appeal: {
						connect: {
							id
						}
					},
					representationType: APPEAL_REPRESENTATION_TYPE.STATEMENT,
					originalRepresentation: `Statement from appellant`,
					represented: {
						create: appellantsList[pickRandom(appellantsList)]
					}
				},
				include: {
					represented: true
				}
			});

			await databaseConnector.representation.create({
				data: {
					appeal: {
						connect: {
							id
						}
					},
					representationType: APPEAL_REPRESENTATION_TYPE.STATEMENT,
					originalRepresentation: `Statement from LPA`,
					lpa: {
						connect: {
							id: lpaId
						}
					}
				},
				include: {
					represented: true
				}
			});

			await databaseConnector.representation.create({
				data: {
					appeal: {
						connect: {
							id
						}
					},
					representationType: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT,
					originalRepresentation: `Final comment from appellant`,
					represented: {
						connect: {
							// @ts-ignore
							id: appellantId
						}
					}
				},
				include: {
					represented: true
				}
			});

			await databaseConnector.representation.create({
				data: {
					appeal: {
						connect: {
							id
						}
					},
					representationType: APPEAL_REPRESENTATION_TYPE.FINAL_COMMENT,
					originalRepresentation: `Final comment from LPA`,
					lpa: {
						connect: {
							id: lpaId
						}
					}
				},
				include: {
					represented: true
				}
			});
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
