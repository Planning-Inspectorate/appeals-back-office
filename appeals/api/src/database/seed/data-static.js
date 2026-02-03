import { APPEAL_TYPE, APPEAL_TYPE_CHANGE_APPEALS } from '@pins/appeals/constants/common.js';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_TYPE,
	APPEAL_EVENT_TYPE,
	APPEAL_KNOWS_OTHER_OWNERS,
	APPEAL_REDACTED_STATUS
} from '@planning-inspectorate/data-model';
import { importListedBuildingsDataset } from './seed-listed-buildings.js';
/**
 * Static data required by the back-office service
 */

/**
 * @typedef {import('@pins/appeals.api').Schema.ProcedureType} ProcedureType
 * @typedef {import('@pins/appeals.api').Schema.KnowledgeOfOtherLandowners} KnowledgeOfOtherLandowners
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseValidationOutcome} AppellantCaseValidationOutcome
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReason} AppellantCaseIncompleteReason
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseInvalidReason} AppellantCaseInvalidReason
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseEnforcementInvalidReason} AppellantCaseEnforcementInvalidReason
 * @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaireValidationOutcome} LPAQuestionnaireValidationOutcome
 * @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReason} LPAQuestionnaireIncompleteReason
 * @typedef {import('@pins/appeals.api').Schema.LPANotificationMethods} LPANotificationMethods
 * @typedef {import('@pins/appeals.api').Schema.SiteVisitType} SiteVisitType
 * @typedef {import('@pins/appeals.api').Schema.Specialism} Specialism
 * @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus
 * @typedef {import('@pins/appeals.api').Schema.RepresentationRejectionReason} RepresentationRejectionReason
 * @typedef {import('@pins/appeals.api').Schema.Ground} Ground
 */

/**
 * Appeal types
 *
 */
export const appealTypes = [
	{
		key: APPEAL_CASE_TYPE.D,
		type: APPEAL_TYPE.HOUSEHOLDER,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.HOUSEHOLDER,
		processCode: 'HAS',
		enabled: true
	},
	{
		key: APPEAL_CASE_TYPE.C,
		type: APPEAL_TYPE.ENFORCEMENT_NOTICE,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.ENFORCEMENT_NOTICE,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.F,
		type: APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.ENFORCEMENT_LISTED_BUILDING,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.G,
		type: APPEAL_TYPE.DISCONTINUANCE_NOTICE,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.DISCONTINUANCE_NOTICE,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.H,
		type: APPEAL_TYPE.ADVERTISEMENT,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.ADVERTISEMENT,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.L,
		type: APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.COMMUNITY_INFRASTRUCTURE_LEVY,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.Q,
		type: APPEAL_TYPE.PLANNING_OBLIGATION,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.PLANNING_OBLIGATION,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.S,
		type: APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.AFFORDABLE_HOUSING_OBLIGATION,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.V,
		type: APPEAL_TYPE.CALL_IN_APPLICATION,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.CALL_IN_APPLICATION,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.W,
		type: APPEAL_TYPE.S78,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.S78,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.X,
		type: APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.LAWFUL_DEVELOPMENT_CERTIFICATE,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.Y,
		type: APPEAL_TYPE.PLANNED_LISTED_BUILDING,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.PLANNED_LISTED_BUILDING,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.ZA,
		type: APPEAL_TYPE.CAS_ADVERTISEMENT,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.CAS_ADVERTISEMENT,
		enabled: false
	},
	{
		key: APPEAL_CASE_TYPE.ZP,
		type: APPEAL_TYPE.CAS_PLANNING,
		changeAppealType: APPEAL_TYPE_CHANGE_APPEALS.CAS_PLANNING,
		enabled: false
	}
];

/**
 * Seed static data into the database. Does not disconnect from the database or handle errors.
 * An array of procedure types.
 */
export const procedureTypes = [
	{
		key: APPEAL_CASE_PROCEDURE.HEARING,
		name: 'Hearing'
	},
	{
		key: APPEAL_CASE_PROCEDURE.INQUIRY,
		name: 'Inquiry'
	},
	{
		key: APPEAL_CASE_PROCEDURE.WRITTEN,
		name: 'Written'
	}
];

/**
 * An array of document redaction statuses.
 *
 */
export const documentRedactionStatuses = [
	{
		key: APPEAL_REDACTED_STATUS.REDACTED,
		name: 'Redacted'
	},
	{
		key: APPEAL_REDACTED_STATUS.NOT_REDACTED,
		name: 'Unredacted'
	},
	{
		key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED,
		name: 'No redaction required'
	}
];

/**
 * An array of LPA notification methods.
 *
 */
export const lpaNotificationMethods = [
	{
		key: 'notice',
		name: 'A site notice'
	},
	{
		key: 'letter',
		name: 'Letter/email to interested parties'
	},
	{
		key: 'advert',
		name: 'A press advert'
	}
];

/**
 * An array of knowledge of other landowners values.
 *
 */
export const knowledgeOfOtherLandownersValues = [
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.YES.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.YES
	},
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.SOME.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.SOME
	},
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.NO.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.NO
	}
];

/**
 * An array of designated site names.
 *
 */
export const designatedSiteNames = [
	{
		name: 'SSSI (site of special scientific interest)',
		key: 'SSSI'
	},
	{
		name: 'cSAC (candidate special area of conservation)',
		key: 'cSAC'
	},
	{
		name: 'SAC (special area of conservation)',
		key: 'SAC'
	},
	{
		name: 'pSPA (potential special protection area)',
		key: 'pSPA'
	},
	{
		name: 'SPA Ramsar (Ramsar special protection area)',
		key: 'SPA'
	}
];

/**
 * An array of site visit types.
 *
 */
export const siteVisitTypes = [
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_ACCESS_REQUIRED, name: 'Access required' },
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_ACCOMPANIED, name: 'Accompanied' },
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_UNACCOMPANIED, name: 'Unaccompanied' }
];

//////////////////////////////////

/**
 * An array of appellant case validation outcomes.
 *
 * @type {Pick<AppellantCaseValidationOutcome, 'name'>[]}
 */
export const appellantCaseValidationOutcomes = [
	{
		name: 'Valid'
	},
	{
		name: 'Invalid'
	},
	{
		name: 'Incomplete'
	}
];

/**
 * An array of appellant case incomplete reasons.
 *
 * @type {Pick<AppellantCaseIncompleteReason, 'id' | 'name' | 'hasText'>[]}
 */
export const appellantCaseIncompleteReasons = [
	{
		id: 1,
		name: 'Appellant name is not the same on the application form and appeal form',
		hasText: false
	},
	{
		id: 2,
		name: 'Attachments and/or appendices have not been included to the full statement of case',
		hasText: true
	},
	{
		id: 3,
		name: "LPA's decision notice is missing",
		hasText: false
	},
	{
		id: 4,
		name: "LPA's decision notice is incorrect or incomplete",
		hasText: true
	},
	{
		id: 5,
		name: 'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing',
		hasText: true
	},
	{
		id: 6,
		name: 'Agricultural holding certificate and declaration have not been completed on the appeal form',
		hasText: false
	},
	{
		id: 7,
		name: 'The original application form is missing',
		hasText: false
	},
	{
		id: 8,
		name: 'The original application form is incomplete',
		hasText: true
	},
	{
		id: 9,
		name: 'Statement of case and ground of appeal are missing',
		hasText: false
	},
	{
		id: 11,
		name: 'Draft statement of common ground is missing',
		hasText: false
	},
	{
		id: 10,
		name: 'Other',
		hasText: true
	},
	{
		id: 12,
		name: 'Missing documents',
		hasText: false
	},
	{
		id: 13,
		name: 'Grounds and facts do not match',
		hasText: false
	},
	{
		id: 14,
		name: 'Waiting for appellant to pay the fee',
		hasText: false
	}
];

/**
 * An array of appellant case invalid reasons.
 *
 * @type {Pick<AppellantCaseInvalidReason, 'id' |'name' | 'hasText'>[]}
 */
export const appellantCaseInvalidReasons = [
	{
		id: 1,
		name: 'Appeal has not been submitted on time',
		hasText: false
	},
	{
		id: 2,
		name: 'Documents have not been submitted on time',
		hasText: false
	},
	{
		id: 3,
		name: 'The appellant does not have the right to appeal',
		hasText: false
	},
	{
		id: 4,
		name: 'Other reason',
		hasText: true
	},
	{
		id: 5,
		name: 'Wrong appeal type',
		hasText: false
	},
	{
		id: 6,
		name: 'Appellant does not have a legal interest in the land',
		hasText: false
	},
	{
		id: 7,
		name: 'Ground (a) barred',
		hasText: false
	}
];

/**
 * An array of appellant case invalid reasons.
 *
 * @type {Pick<AppellantCaseEnforcementInvalidReason, 'id' |'name' | 'hasText'>[]}
 */
export const appellantCaseEnforcementInvalidReasons = [
	{
		id: 1,
		name: 'It does not specify the boundaries of the land',
		hasText: true
	},
	{
		id: 2,
		name: 'It states that the recipient needs to immediately stop enforcement activity',
		hasText: true
	},
	{
		id: 3,
		name: 'There is a mistake in the wording',
		hasText: true
	},
	{
		id: 4,
		name: 'No time between the effective date and the end of the compliance period',
		hasText: true
	},
	{
		id: 5,
		name: 'It does not specify a period for compliance (only a description)',
		hasText: true
	},
	{
		id: 6,
		name: 'It does not specify a period for compliance (completely missing)',
		hasText: true
	},
	{
		id: 7,
		name: 'The period for compliance is not clear',
		hasText: true
	},
	{
		id: 8,
		name: 'Other reason',
		hasText: true
	}
];

/**
 * An array of LPA questionnaire validation outcomes.
 *
 * @type {Pick<LPAQuestionnaireValidationOutcome, 'name'>[]}
 */
export const lpaQuestionnaireValidationOutcomes = [
	{
		name: 'Complete'
	},
	{
		name: 'Incomplete'
	}
];

/**
 * An array of LPA questionnaire incomplete reasons.
 *
 * @type {Pick<LPAQuestionnaireIncompleteReason, 'name' | 'hasText'>[]}
 */
export const lpaQuestionnaireIncompleteReasons = [
	{
		name: 'Policies are missing',
		hasText: true
	},
	{
		name: 'Other documents or information are missing',
		hasText: true
	},
	{
		name: 'Other',
		hasText: true
	}
];

/**
 * An array of specialisms.
 *
 * @type {Pick<Specialism, 'name'>[]}
 */

export const specialisms = [
	{ name: 'General allocation' },
	{ name: 'Schedule 1' },
	{ name: 'Schedule 2' },
	{ name: 'Enforcement' },
	{ name: 'Housing orders' },
	{ name: 'Rights of way' },
	{ name: 'Shopping' },
	{ name: 'Gypsy' },
	{ name: 'Housing' },
	{ name: 'Access' },
	{ name: 'Advertisements' },
	{ name: 'Appearance design' },
	{ name: 'Architecture design' },
	{ name: 'High hedges' },
	{ name: 'Historic heritage' },
	{ name: 'Listed building and enforcement' },
	{ name: 'Natural heritage' },
	{ name: 'Renewable energy/wind farms' },
	{ name: 'Roads and traffics' },
	{ name: 'Transport' },
	{ name: 'Tree preservation order' },
	{ name: 'Waste' },
	{ name: 'Water' },
	{ name: 'Minerals' }
];

/**
 * An array of grounds for appeal.
 *
 * @type {Pick<Ground, 'groundRef' | 'groundDescription'>[]}
 */
export const groundsForAppeal = [
	{
		groundRef: 'a',
		groundDescription:
			'The local planning authority (LPA) should grant planning permission for all (or part) of the development described in the alleged breach.'
	},
	{
		groundRef: 'b',
		groundDescription: 'The alleged breach did not happen.'
	},
	{
		groundRef: 'c',
		groundDescription:
			'You do not need planning permission (for example, it is a permitted development or you already have planning permission).'
	},
	{
		groundRef: 'd',
		groundDescription: 'It is too late for the LPA to take enforcement action.'
	},
	{
		groundRef: 'e',
		groundDescription:
			'The LPA did not serve the notice properly to everyone with an interest in the land.'
	},
	{
		groundRef: 'f',
		groundDescription: 'A simpler step (or steps) would achieve the same result.'
	},
	{
		groundRef: 'g',
		groundDescription: 'The time to comply with the notice is too short.'
	}
];

/**
 * An array of representation rejection reasons.
 *
 * @type {Pick<RepresentationRejectionReason, 'id' | 'name' | 'hasText' | 'representationType'>[]}
 */
export const representationRejectionReasons = [
	{
		id: 1,
		name: 'Received after deadline',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 2,
		name: 'Illegible or Incomplete Documentation',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 3,
		name: 'Includes personal or medical information',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 4,
		name: 'Includes inflammatory content',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 5,
		name: 'Duplicated or repeated comment',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 6,
		name: 'Not relevant to this appeal',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 7,
		name: 'Contains links to web pages',
		representationType: 'comment',
		hasText: false
	},
	{
		id: 8,
		name: 'Other reason',
		representationType: 'comment',
		hasText: true
	},
	{
		id: 12,
		name: 'Supporting documents missing',
		representationType: 'lpa_statement',
		hasText: true
	},
	{
		id: 13,
		name: 'No list of suggested conditions',
		representationType: 'lpa_statement',
		hasText: false
	},
	{
		id: 14,
		name: 'Other',
		representationType: 'lpa_statement',
		hasText: true
	},
	{
		id: 15,
		name: 'Supporting documents missing',
		representationType: 'appellant_statement',
		hasText: true
	},
	{
		id: 16,
		name: 'No list of suggested conditions',
		representationType: 'appellant_statement',
		hasText: false
	},
	{
		id: 17,
		name: 'Other',
		representationType: 'appellant_statement',
		hasText: true
	},
	{
		id: 18,
		name: 'Includes personal or medical information',
		representationType: 'lpa_final_comment',
		hasText: false
	},
	{
		id: 19,
		name: 'Includes inflammatory content',
		representationType: 'lpa_final_comment',
		hasText: false
	},
	{
		id: 20,
		name: 'Not relevant to this appeal',
		representationType: 'lpa_final_comment',
		hasText: false
	},
	{
		id: 21,
		name: 'Contains links to web pages',
		representationType: 'lpa_final_comment',
		hasText: false
	},
	{
		id: 22,
		name: 'Other reason',
		representationType: 'lpa_final_comment',
		hasText: true
	},
	{
		id: 23,
		name: 'Includes personal or medical information',
		representationType: 'appellant_final_comment',
		hasText: false
	},
	{
		id: 24,
		name: 'Includes inflammatory content',
		representationType: 'appellant_final_comment',
		hasText: false
	},
	{
		id: 25,
		name: 'Not relevant to this appeal',
		representationType: 'appellant_final_comment',
		hasText: false
	},
	{
		id: 26,
		name: 'Contains links to web pages',
		representationType: 'appellant_final_comment',
		hasText: false
	},
	{
		id: 27,
		name: 'Other reason',
		representationType: 'appellant_final_comment',
		hasText: true
	},
	{
		id: 28,
		name: 'Includes personal or medical information',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 29,
		name: 'Includes inflammatory content',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 30,
		name: 'Not relevant to this appeal',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 31,
		name: 'Contains links to web pages',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 32,
		name: 'Other reason',
		representationType: 'lpa_proofs_evidence',
		hasText: true
	},

	{
		id: 35,
		name: 'Not complete',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 36,
		name: 'Not relevant',
		representationType: 'lpa_proofs_evidence',
		hasText: false
	},
	{
		id: 33,
		name: 'Supporting documents missing',
		representationType: 'appellant_proofs_evidence',
		hasText: false
	},
	{
		id: 34,
		name: 'Other reason',
		representationType: 'appellant_proofs_evidence',
		hasText: true
	},
	{
		id: 37,
		name: 'Supporting documents missing',
		representationType: 'rule_6_party_statement',
		hasText: true
	},
	{
		id: 38,
		name: 'No list of suggested conditions',
		representationType: 'rule_6_party_statement',
		hasText: false
	},
	{
		id: 39,
		name: 'Other',
		representationType: 'rule_6_party_statement',
		hasText: true
	},
	{
		id: 40,
		name: 'Supporting documents missing',
		representationType: 'rule_6_party_proofs_evidence',
		hasText: false
	},
	{
		id: 41,
		name: 'Other',
		representationType: 'rule_6_party_proofs_evidence',
		hasText: true
	}
];

/**
 * Seed static data into the database. Does not disconnect from the database or handle errors.
 *
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
export async function seedStaticData(databaseConnector) {
	await importListedBuildingsDataset(
		'https://files.planning.data.gov.uk/dataset/listed-building.json'
	);

	const systemUserId = '00000000-0000-0000-0000-000000000000';
	await databaseConnector.user.upsert({
		where: {
			azureAdUserId: systemUserId
		},
		update: {},
		create: {
			azureAdUserId: systemUserId
		}
	});

	for (const appealType of appealTypes) {
		await databaseConnector.appealType.upsert({
			create: appealType,
			where: { key: appealType.key },
			update: appealType
		});
	}
	for (const procedureType of procedureTypes) {
		await databaseConnector.procedureType.upsert({
			create: procedureType,
			where: { name: procedureType.name },
			update: procedureType
		});
	}
	for (const lpaNotificationMethod of lpaNotificationMethods) {
		await databaseConnector.lPANotificationMethods.upsert({
			create: lpaNotificationMethod,
			where: { name: lpaNotificationMethod.name },
			update: lpaNotificationMethod
		});
	}
	for (const knowledgeOfOtherLandownersValue of knowledgeOfOtherLandownersValues) {
		await databaseConnector.knowledgeOfOtherLandowners.upsert({
			create: knowledgeOfOtherLandownersValue,
			where: { name: knowledgeOfOtherLandownersValue.name },
			update: knowledgeOfOtherLandownersValue
		});
	}
	for (const siteVisitType of siteVisitTypes) {
		await databaseConnector.siteVisitType.upsert({
			create: siteVisitType,
			where: { name: siteVisitType.name },
			update: siteVisitType
		});
	}
	for (const documentRedactionStatus of documentRedactionStatuses) {
		await databaseConnector.documentRedactionStatus.upsert({
			create: documentRedactionStatus,
			where: { name: documentRedactionStatus.name },
			update: documentRedactionStatus
		});
	}
	for (const appellantCaseValidationOutcome of appellantCaseValidationOutcomes) {
		await databaseConnector.appellantCaseValidationOutcome.upsert({
			create: appellantCaseValidationOutcome,
			where: { name: appellantCaseValidationOutcome.name },
			update: {}
		});
	}
	for (const appellantCaseIncompleteReason of appellantCaseIncompleteReasons) {
		await databaseConnector.appellantCaseIncompleteReason.upsert({
			create: appellantCaseIncompleteReason,
			where: { name: appellantCaseIncompleteReason.name },
			update: {}
		});
	}
	for (const appellantCaseInvalidReason of appellantCaseInvalidReasons) {
		await databaseConnector.appellantCaseInvalidReason.upsert({
			create: appellantCaseInvalidReason,
			where: { id: appellantCaseInvalidReason.id },
			update: { name: appellantCaseInvalidReason.name, hasText: appellantCaseInvalidReason.hasText }
		});
	}
	for (const appellantCaseEnforcementInvalidReason of appellantCaseEnforcementInvalidReasons) {
		await databaseConnector.appellantCaseEnforcementInvalidReason.upsert({
			create: appellantCaseEnforcementInvalidReason,
			where: { id: appellantCaseEnforcementInvalidReason.id },
			update: {
				name: appellantCaseEnforcementInvalidReason.name
			}
		});
	}
	for (const lpaQuestionnaireValidationOutcome of lpaQuestionnaireValidationOutcomes) {
		await databaseConnector.lPAQuestionnaireValidationOutcome.upsert({
			create: lpaQuestionnaireValidationOutcome,
			where: { name: lpaQuestionnaireValidationOutcome.name },
			update: {}
		});
	}
	for (const lpaQuestionnaireIncompleteReason of lpaQuestionnaireIncompleteReasons) {
		await databaseConnector.lPAQuestionnaireIncompleteReason.upsert({
			create: lpaQuestionnaireIncompleteReason,
			where: { name: lpaQuestionnaireIncompleteReason.name },
			update: {}
		});
	}
	for (const specialism of specialisms) {
		await databaseConnector.specialism.upsert({
			create: { name: specialism.name },
			where: { name: specialism.name },
			update: {}
		});
	}
	for (const designatedSiteName of designatedSiteNames) {
		await databaseConnector.designatedSite.upsert({
			create: designatedSiteName,
			where: { key: designatedSiteName.key },
			update: designatedSiteName
		});
	}
	for (const rejectionReason of representationRejectionReasons) {
		await databaseConnector.representationRejectionReason.upsert({
			create: rejectionReason,
			where: {
				id: rejectionReason.id
			},
			update: {
				name: rejectionReason.name,
				hasText: rejectionReason.hasText
			}
		});
	}

	for (const ground of groundsForAppeal) {
		await databaseConnector.ground.upsert({
			create: ground,
			where: { groundRef: ground.groundRef },
			update: ground
		});
	}

	await updateFolderDefinitionsForExistingAppeals(databaseConnector);
}

/**
 *
 * @param {import('../../server/utils/db-client/client.ts').PrismaClient} databaseConnector
 */
const updateFolderDefinitionsForExistingAppeals = async (databaseConnector) => {
	//Find cases that have less folders than expected
	const queryRaw = `SELECT caseId FROM [Folder] GROUP BY [Folder].[caseId] HAVING COUNT(*) != ${FOLDERS.length}`;

	/**
	 * @type {{ caseId: number }[]}
	 */
	const existingAppealIDsWithMissingFolders = await databaseConnector.$queryRawUnsafe(queryRaw);

	/**
	 * @param {number} caseId
	 * @param {{id: number; caseId: number; path: string;}[]} existingFolders
	 * @returns {{ caseId: number, path: string }[]}
	 */
	const getFoldersToAdd = (caseId, existingFolders) => {
		/**
		 * @type {{ caseId: number, path: string }[]}
		 */
		const defaultFolders = FOLDERS.map((/** @type {string} */ path) => {
			return {
				caseId: caseId,
				path
			};
		});
		const existingFolderPaths = existingFolders.map((folder) => folder.path);
		const foldersToCreate = defaultFolders.filter(
			(folder) => !existingFolderPaths.includes(folder.path)
		);

		return foldersToCreate;
	};

	for (const result of existingAppealIDsWithMissingFolders) {
		const existingFolders = await databaseConnector.folder.findMany({
			where: {
				caseId: result.caseId
			}
		});

		const missingFolders = getFoldersToAdd(result.caseId, existingFolders);

		await databaseConnector.folder.createMany({
			data: missingFolders
		});
	}
};
