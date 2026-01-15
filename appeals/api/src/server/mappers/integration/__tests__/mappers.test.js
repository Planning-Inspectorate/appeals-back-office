// @ts-nocheck

import { fullPlanningAppeal } from '#tests/appeals/mocks.js';
import { isCaseInvalid } from '#utils/case-invalid.js';
import { findStatusDate } from '#utils/mapping/map-dates.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE,
	APPEAL_DOCUMENT_TYPE
} from '@planning-inspectorate/data-model';
import { mapAppellantCaseIn } from '../commands/appellant-case.mapper.js';
import { mapDesignatedSiteNames, mapQuestionnaireIn } from '../commands/questionnaire.mapper.js';
import { mapDocumentEntity } from '../map-document-entity.js';
import { mapCaseDates } from '../shared/s20s78/map-case-dates.js';

describe('appeals generic mappers', () => {
	test('map case validation date on invalid appeal', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: false,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						valid: false,
						createdAt: new Date('2025-03-20T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-21T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		console.log(output);
		expect(output).toBe('2025-03-18T09:12:33.334Z');
	});

	test('map case validation date on invalid appellant case', async () => {
		const input = {
			appeal: {
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						valid: false,
						createdAt: new Date('2025-03-16T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.VALIDATION,
						valid: false,
						createdAt: new Date('2025-03-17T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.READY_TO_START,
						valid: false,
						createdAt: new Date('2025-03-18T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					},
					{
						status: APPEAL_CASE_STATUS.INVALID,
						valid: true,
						createdAt: new Date('2025-03-19T09:12:33.334Z'),
						subStateMachineName: null,
						compoundStateName: null,
						id: 1,
						appealId: 1
					}
				]
			}
		};

		const { appeal } = input;
		const output = isCaseInvalid(appeal.appealStatus)
			? findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START)
			: findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.INVALID) ??
			  findStatusDate(appeal.appealStatus, APPEAL_CASE_STATUS.READY_TO_START);

		expect(output).toBe('2025-03-19T09:12:33.334Z');
	});
});

describe('mapDesignatedSiteNames', () => {
	test('mapDesignatedSiteNames should connect predefined sites and manually insert a single custom answer', async () => {
		/**
		 * @type {import('@planning-inspectorate/data-model').Schemas.LPAQS78SubmissionProperties}
		 */
		const input = {
			caseReference: '',
			lpaQuestionnaireSubmittedDate: '',
			siteAccessDetails: [],
			siteSafetyDetails: [],
			nearbyCaseReferences: [],
			neighbouringSiteAddresses: [],
			designatedSitesNames: ['expected', 'first, custom', 'second custom']
		};
		const expected = [
			{ key: 'expected', name: 'Expected', id: 1 },
			{ key: 'expected2', name: 'Expected 2', id: 2 }
		];

		const result = mapDesignatedSiteNames(input, expected);

		expect(result).toEqual({
			designatedSiteNames: {
				create: [{ designatedSite: { connect: { key: 'expected' } } }]
			},
			designatedSiteNameCustom: 'first, custom'
		});
	});
});

describe('mapCaseDates', () => {
	test('mapCaseDates should return the correct dates', async () => {
		const input = {
			appeal: {
				...fullPlanningAppeal,
				appealTimetable: {
					...fullPlanningAppeal.appealTimetable,
					finalCommentsDueDate: new Date('2025-03-03T09:12:33.334Z'),
					ipCommentsDueDate: new Date('2025-03-04T09:12:33.334Z'),
					lpaProofsSubmittedDate: new Date('2025-03-06T09:12:33.334Z'),
					lpaQuestionnairePublishedDate: new Date('2025-03-07T09:12:33.334Z'),
					lpaQuestionnaireValidationOutcomeDate: new Date('2025-03-08T09:12:33.334Z'),
					proofOfEvidenceAndWitnessesDueDate: new Date('2025-03-10T09:12:33.334Z'),
					siteNoticesSentDate: new Date('2025-03-11T09:12:33.334Z'),
					lpaStatementDueDate: new Date('2025-03-12T09:12:33.334Z'),
					statementOfCommonGroundDueDate: new Date('2025-03-13T09:12:33.334Z'),
					planningObligationDueDate: new Date('2025-03-14T09:12:33.334Z')
				},
				representations: [
					{
						representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
						dateCreated: new Date('2025-03-15T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
						dateCreated: new Date('2025-03-16T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
						dateCreated: new Date('2025-03-17T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
						dateCreated: new Date('2025-03-18T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
						dateCreated: new Date('2025-03-19T09:12:33.334Z')
					},
					{
						representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
						dateCreated: new Date('2025-03-20T09:12:33.334Z')
					}
				],
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.STATEMENTS,
						createdAt: new Date('2025-03-20T09:12:33.334Z')
					}
				]
			}
		};

		const result = mapCaseDates(input);

		expect(result).toEqual({
			appellantCommentsSubmittedDate: '2025-03-15T09:12:33.334Z',
			appellantStatementSubmittedDate: '2025-03-16T09:12:33.334Z',
			finalCommentsDueDate: '2025-03-03T09:12:33.334Z',
			interestedPartyRepsDueDate: '2025-03-04T09:12:33.334Z',
			lpaCommentsSubmittedDate: '2025-03-17T09:12:33.334Z',
			lpaQuestionnairePublishedDate: '2025-03-20T09:12:33.334Z',
			lpaQuestionnaireValidationOutcomeDate: '2025-03-20T09:12:33.334Z',
			lpaStatementSubmittedDate: '2025-03-18T09:12:33.334Z',
			statementDueDate: '2025-03-12T09:12:33.334Z',
			statementOfCommonGroundDueDate: '2025-03-13T09:12:33.334Z',
			planningObligationDueDate: '2025-03-14T09:12:33.334Z',
			proofsOfEvidenceDueDate: '2025-03-10T09:12:33.334Z',
			lpaProofsSubmittedDate: '2025-03-19T09:12:33.334Z',
			appellantProofsSubmittedDate: '2025-03-20T09:12:33.334Z',
			siteNoticesSentDate: null
		});
	});
});

describe('map-document-entity', () => {
	const internalRepDocType = REP_ATTACHMENT_DOCTYPE;
	test.each([
		{
			desc: 'representationAttachments - APPELLANT_FINAL_COMMENT',
			documentType: internalRepDocType,
			representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
			expected: APPEAL_DOCUMENT_TYPE.APPELLANT_FINAL_COMMENT
		},
		{
			desc: 'representationAttachments - LPA_FINAL_COMMENT',
			documentType: internalRepDocType,
			representationType: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
			expected: APPEAL_DOCUMENT_TYPE.LPA_FINAL_COMMENT
		},
		{
			desc: 'representationAttachments - APPELLANT_STATEMENT',
			documentType: internalRepDocType,
			representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
			expected: APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT
		},
		{
			desc: 'representationAttachments - LPA_STATEMENT',
			documentType: internalRepDocType,
			representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
			expected: APPEAL_DOCUMENT_TYPE.LPA_STATEMENT
		},
		{
			desc: 'representationAttachments - COMMENT',
			documentType: internalRepDocType,
			representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
			expected: APPEAL_DOCUMENT_TYPE.INTERESTED_PARTY_COMMENT
		},
		{
			desc: 'representationAttachments - unknown type',
			documentType: internalRepDocType,
			representationType: 'SOMETHING_UNKNOWN',
			expected: APPEAL_DOCUMENT_TYPE.UNCATEGORISED
		},
		{
			desc: 'other documentType',
			documentType: 'someOtherType',
			representationType: null,
			expected: 'someOtherType'
		},
		{
			desc: 'documentType undefined',
			documentType: undefined,
			representationType: null,
			expected: APPEAL_DOCUMENT_TYPE.UNCATEGORISED
		}
	])('handles document type: $desc', ({ documentType, representationType, expected }) => {
		const doc = {
			guid: 'doc-123',
			caseId: 'case-456',
			name: '123e4567-e89b-12d3-a456-426614174000_test.pdf',
			case: { reference: 'REF-1', appealType: { key: APPEAL_CASE_TYPE.D } },
			versions: [
				{
					version: 1,
					originalFilename: 'test.pdf',
					size: 1000,
					mime: 'application/pdf',
					documentURI: 'http://doc.uri',
					fileMD5: 'md5hash',
					dateCreated: new Date('2025-01-01T10:00:00.000Z'),
					dateReceived: new Date('2025-01-01T11:00:00.000Z'),
					lastModified: new Date('2025-01-01T12:00:00.000Z'),
					documentType,
					stage: APPEAL_CASE_STAGE.APPEAL_DECISION,
					redactionStatus: { key: 'NOT_REDACTED' },
					representation: representationType
						? { representation: { representationType } }
						: undefined
				}
			]
		};
		const result = mapDocumentEntity(doc);
		expect(result.documentType).toBe(expected);
	});
});

describe('mapAppellantCaseIn', () => {
	test.each([
		{
			desc: 'minimal input',
			input: { casedata: {} },
			expected: {
				applicationDate: undefined,
				applicationDecision: undefined,
				applicationDecisionDate: undefined,
				caseSubmittedDate: undefined,
				caseSubmissionDueDate: undefined,
				siteAccessDetails: null,
				siteSafetyDetails: null,
				siteAreaSquareMetres: undefined,
				floorSpaceSquareMetres: undefined,
				siteGridReferenceEasting: undefined,
				siteGridReferenceNorthing: undefined,
				ownsAllLand: undefined,
				ownsSomeLand: undefined,
				hasAdvertisedAppeal: undefined,
				appellantCostsAppliedFor: undefined,
				originalDevelopmentDescription: undefined,
				changedDevelopmentDescription: undefined,
				ownersInformed: undefined,
				isGreenBelt: undefined,
				typeOfPlanningApplication: undefined,
				numberOfResidencesNetChange: undefined
			}
		},
		{
			desc: 'common fields',
			input: {
				casedata: {
					applicationDate: '2025-10-22T00:00:00.000Z',
					applicationDecision: 'refused',
					applicationDecisionDate: '2025-10-22T00:00:00.000Z',
					caseSubmittedDate: '2025-10-22T00:00:00.000Z',
					caseSubmissionDueDate: '2025-10-22T00:00:00.000Z',
					siteAreaSquareMetres: 12,
					floorSpaceSquareMetres: 13,
					siteGridReferenceEasting: '012345',
					siteGridReferenceNorthing: '678910',
					ownsAllLand: true,
					ownsSomeLand: true,
					advertisedAppeal: true,
					appellantCostsAppliedFor: true,
					originalDevelopmentDescription: 'test',
					changedDevelopmentDescription: 'test 2',
					ownersInformed: true,
					isGreenBelt: true,
					typeOfPlanningApplication: 'full',
					numberOfResidencesNetChange: 123
				}
			},
			expected: {
				applicationDate: '2025-10-22T00:00:00.000Z',
				applicationDecision: 'refused',
				applicationDecisionDate: '2025-10-22T00:00:00.000Z',
				caseSubmittedDate: '2025-10-22T00:00:00.000Z',
				caseSubmissionDueDate: '2025-10-22T00:00:00.000Z',
				siteAreaSquareMetres: 12,
				floorSpaceSquareMetres: 13,
				siteGridReferenceEasting: '012345',
				siteGridReferenceNorthing: '678910',
				ownsAllLand: true,
				ownsSomeLand: true,
				hasAdvertisedAppeal: true,
				appellantCostsAppliedFor: true,
				originalDevelopmentDescription: 'test',
				changedDevelopmentDescription: 'test 2',
				ownersInformed: true,
				isGreenBelt: true,
				typeOfPlanningApplication: 'full',
				numberOfResidencesNetChange: 123,
				siteAccessDetails: null,
				siteSafetyDetails: null
			}
		},
		{
			desc: 'S20 case',
			input: {
				casedata: { caseType: APPEAL_CASE_TYPE.Y, knowsAllOwners: 'yes', knowsOtherOwners: 'no' }
			},
			expected: expect.objectContaining({
				knowsAllOwners: { connect: { key: 'yes' } },
				knowsOtherOwners: { connect: { key: 'no' } }
			})
		},
		{
			desc: 'S78 case',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.W,
					agriculturalHolding: true,
					tenantAgriculturalHolding: false,
					otherTenantsAgriculturalHolding: true,
					informedTenantsAgriculturalHolding: false
				}
			},
			expected: expect.objectContaining({
				agriculturalHolding: true,
				tenantAgriculturalHolding: false,
				otherTenantsAgriculturalHolding: true,
				informedTenantsAgriculturalHolding: false
			})
		},
		{
			desc: 'Enforcement case (C)',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.C,
					enforcementNotice: true,
					enforcementNoticeListedBuilding: true,
					enforcementReference: 'abcd1234',
					enforcementIssueDate: '2025-03-16T09:12:33.334Z',
					enforcementEffectiveDate: '2025-03-15T09:12:33.334Z',
					contactPlanningInspectorateDate: '2025-03-18T09:12:33.334Z',
					contactAddressLine1: 'contactAddressLine1',
					contactAddressLine2: 'contactAddressLine2',
					contactAddressCounty: 'contactAddressCounty',
					contactAddressPostcode: 'contactAddressPostcode',
					contactAddressTown: 'contactAddressTown',
					interestInLand: 'owner',
					writtenOrVerbalPermission: true,
					descriptionOfAllegedBreach: 'decription of alleged breach',
					applicationDevelopmentAllOrPart: 'all-of-the-development',
					appealDecisionDate: '2025-03-17T09:12:33.334Z'
				}
			},
			expected: expect.objectContaining({
				enforcementNotice: true,
				enforcementReference: 'abcd1234',
				enforcementNoticeListedBuilding: true,
				enforcementIssueDate: '2025-03-16T09:12:33.334Z',
				enforcementEffectiveDate: '2025-03-15T09:12:33.334Z',
				contactPlanningInspectorateDate: '2025-03-18T09:12:33.334Z',
				contactAddress: {
					create: {
						addressLine1: 'contactAddressLine1',
						addressLine2: 'contactAddressLine2',
						addressCounty: 'contactAddressCounty',
						postcode: 'contactAddressPostcode',
						addressTown: 'contactAddressTown'
					}
				},
				interestInLand: 'owner',
				writtenOrVerbalPermission: true,
				descriptionOfAllegedBreach: 'decription of alleged breach',
				applicationDevelopmentAllOrPart: 'all-of-the-development',
				appealDecisionDate: '2025-03-17T09:12:33.334Z'
			})
		},
		{
			desc: 'CAS adverts case (ZA)',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.ZA,
					advertDetails: [
						{
							isAdvertInPosition: true,
							isSiteOnHighwayLand: false
						}
					],
					hasLandownersPermission: true
				}
			},
			expected: expect.objectContaining({
				appellantCaseAdvertDetails: {
					createMany: {
						data: [
							{
								advertInPosition: true,
								highwayLand: false
							}
						]
					}
				},
				landownerPermission: true
			})
		},
		{
			desc: 'Adverts case (H)',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.H,
					advertDetails: [
						{
							isAdvertInPosition: true,
							isSiteOnHighwayLand: false
						}
					],
					hasLandownersPermission: true
				}
			},
			expected: expect.objectContaining({
				appellantCaseAdvertDetails: {
					createMany: {
						data: [
							{
								advertInPosition: true,
								highwayLand: false
							}
						]
					}
				},
				landownerPermission: true
			})
		},
		{
			desc: 'siteAccessDetails and siteSafetyDetails arrays',
			input: {
				casedata: { siteAccessDetails: ['access1', 'access2'], siteSafetyDetails: ['safety1'] }
			},
			expected: expect.objectContaining({
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1'
			})
		}
	])('mapAppellantCaseIn: $desc', ({ input, expected }) => {
		const result = mapAppellantCaseIn(input);
		expect(result).toMatchObject(expected);
	});
});

describe('mapQuestionnaireIn', () => {
	const designatedSites = [
		{ key: 'siteA', name: 'Site A', id: 1 },
		{ key: 'siteB', name: 'Site B', id: 2 }
	];

	test.each([
		{
			desc: 'common fields D',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.D,
					lpaQuestionnaireSubmittedDate: '2025-10-22',
					siteAccessDetails: ['access1'],
					siteSafetyDetails: ['safety1'],
					reasonForNeighbourVisits: 'visit',
					lpaStatement: 'statement',
					isCorrectAppealType: true,
					isGreenBelt: false,
					inConservationArea: true,
					newConditionDetails: 'details',
					lpaCostsAppliedFor: true,
					notificationMethod: ['email', 'post'],
					affectedListedBuildingNumbers: ['LB1']
				}
			},
			expected: expect.objectContaining({
				lpaQuestionnaireSubmittedDate: '2025-10-22',
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1',
				reasonForNeighbourVisits: 'visit',
				lpaStatement: 'statement',
				isCorrectAppealType: true,
				isGreenBelt: false,
				inConservationArea: true,
				newConditionDetails: 'details',
				lpaCostsAppliedFor: true,
				listedBuildingDetails: { create: [{ listEntry: 'LB1', affectsListedBuilding: true }] },
				lpaNotificationMethods: {
					create: [
						{ lpaNotificationMethod: { connect: { key: 'email' } } },
						{ lpaNotificationMethod: { connect: { key: 'post' } } }
					]
				}
			})
		},
		{
			desc: 'S78 case',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.W,
					lpaQuestionnaireSubmittedDate: '2025-10-22',
					siteAccessDetails: ['access1'],
					siteSafetyDetails: ['safety1'],
					notificationMethod: ['email'],
					affectedListedBuildingNumbers: ['LB1'],
					designatedSitesNames: ['siteA', 'customSite']
				}
			},
			expected: expect.objectContaining({
				lpaQuestionnaireSubmittedDate: '2025-10-22',
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1',
				listedBuildingDetails: { create: [{ listEntry: 'LB1', affectsListedBuilding: true }] },
				lpaNotificationMethods: {
					create: [{ lpaNotificationMethod: { connect: { key: 'email' } } }]
				},
				designatedSiteNames: {
					create: [{ designatedSite: { connect: { key: 'siteA' } } }]
				},
				designatedSiteNameCustom: 'customSite'
			})
		},
		{
			desc: 'S20 case',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.Y,
					lpaQuestionnaireSubmittedDate: '2025-10-22',
					siteAccessDetails: ['access1'],
					siteSafetyDetails: ['safety1'],
					notificationMethod: ['email'],
					affectedListedBuildingNumbers: ['LB1'],
					designatedSitesNames: ['siteB'],
					preserveGrantLoan: true,
					consultHistoricEngland: false
				}
			},
			expected: expect.objectContaining({
				lpaQuestionnaireSubmittedDate: '2025-10-22',
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1',
				listedBuildingDetails: { create: [{ listEntry: 'LB1', affectsListedBuilding: true }] },
				lpaNotificationMethods: {
					create: [{ lpaNotificationMethod: { connect: { key: 'email' } } }]
				},
				designatedSiteNames: {
					create: [{ designatedSite: { connect: { key: 'siteB' } } }]
				},
				preserveGrantLoan: true,
				historicEnglandConsultation: false
			})
		},
		{
			desc: 'CAS adverts case (ZA)',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.ZA,
					lpaQuestionnaireSubmittedDate: '2025-10-22',
					siteAccessDetails: ['access1'],
					siteSafetyDetails: ['safety1'],
					notificationMethod: ['post'],
					affectedListedBuildingNumbers: ['LB1'],
					designatedSitesNames: ['siteA'],
					affectsScheduledMonument: true,
					hasProtectedSpecies: true,
					isAonbNationalLandscape: true,
					hasStatutoryConsultees: true,
					consultedBodiesDetails: 'details',
					hasEmergingPlan: true,
					lpaProcedurePreference: 'written',
					lpaProcedurePreferenceDetails: 'preference details',
					lpaProcedurePreferenceDuration: 12,
					siteWithinSSSI: true,
					isSiteInAreaOfSpecialControlAdverts: true,
					wasApplicationRefusedDueToHighwayOrTraffic: true,
					didAppellantSubmitCompletePhotosAndPlans: true
				}
			},
			expected: expect.objectContaining({
				lpaQuestionnaireSubmittedDate: '2025-10-22',
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1',
				listedBuildingDetails: { create: [{ listEntry: 'LB1', affectsListedBuilding: true }] },
				lpaNotificationMethods: {
					create: [{ lpaNotificationMethod: { connect: { key: 'post' } } }]
				},
				designatedSiteNames: {
					create: [{ designatedSite: { connect: { key: 'siteA' } } }]
				},
				affectsScheduledMonument: true,
				hasProtectedSpecies: true,
				isAonbNationalLandscape: true,
				hasStatutoryConsultees: true,
				consultedBodiesDetails: 'details',
				hasEmergingPlan: true,
				lpaProcedurePreference: 'written',
				lpaProcedurePreferenceDetails: 'preference details',
				lpaProcedurePreferenceDuration: 12,
				isSiteInAreaOfSpecialControlAdverts: true,
				wasApplicationRefusedDueToHighwayOrTraffic: true,
				didAppellantSubmitCompletePhotosAndPlans: true
			})
		},
		{
			desc: 'CAS adverts case (H)',
			input: {
				casedata: {
					caseType: APPEAL_CASE_TYPE.H,
					lpaQuestionnaireSubmittedDate: '2025-10-22',
					siteAccessDetails: ['access1'],
					siteSafetyDetails: ['safety1'],
					notificationMethod: ['post'],
					affectedListedBuildingNumbers: ['LB1'],
					changedListedBuildingNumbers: ['LB2'],
					designatedSitesNames: ['siteA'],
					affectsScheduledMonument: true,
					hasProtectedSpecies: true,
					isAonbNationalLandscape: true,
					hasStatutoryConsultees: true,
					consultedBodiesDetails: 'details',
					hasEmergingPlan: true,
					lpaProcedurePreference: 'written',
					lpaProcedurePreferenceDetails: 'preference details',
					lpaProcedurePreferenceDuration: 12,
					siteWithinSSSI: true,
					isSiteInAreaOfSpecialControlAdverts: true,
					wasApplicationRefusedDueToHighwayOrTraffic: true,
					didAppellantSubmitCompletePhotosAndPlans: true
				}
			},
			expected: expect.objectContaining({
				lpaQuestionnaireSubmittedDate: '2025-10-22',
				siteAccessDetails: 'access1',
				siteSafetyDetails: 'safety1',
				listedBuildingDetails: {
					create: [
						{ listEntry: 'LB1', affectsListedBuilding: true },
						{ listEntry: 'LB2', affectsListedBuilding: false }
					]
				},
				lpaNotificationMethods: {
					create: [{ lpaNotificationMethod: { connect: { key: 'post' } } }]
				},
				designatedSiteNames: {
					create: [{ designatedSite: { connect: { key: 'siteA' } } }]
				},
				affectsScheduledMonument: true,
				hasProtectedSpecies: true,
				isAonbNationalLandscape: true,
				hasStatutoryConsultees: true,
				consultedBodiesDetails: 'details',
				hasEmergingPlan: true,
				lpaProcedurePreference: 'written',
				lpaProcedurePreferenceDetails: 'preference details',
				lpaProcedurePreferenceDuration: 12,
				isSiteInAreaOfSpecialControlAdverts: true,
				wasApplicationRefusedDueToHighwayOrTraffic: true,
				didAppellantSubmitCompletePhotosAndPlans: true
			})
		}
	])('mapQuestionnaireIn: $desc', ({ input, expected }) => {
		const result = mapQuestionnaireIn(input, designatedSites);
		expect(result).toMatchObject(expected);
	});
});
