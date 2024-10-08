import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent, userHasPermission } from './permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import { APPEAL_APPLICATION_DECISION, APPEAL_KNOWS_OTHER_OWNERS } from 'pins-data-model';
import { booleanDisplayInstruction } from '#lib/page-components/boolean.js';
import { documentTypeDisplayInstruction } from '#lib/page-components/document.js';
import { textDisplayField } from '#lib/page-components/text.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 */

/**
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('../../app/auth/auth-session.service').SessionWithAuth} session
 * @param {string} currentRoute
 * @returns {MappedInstructions}
 */
export function initialiseAndMapData(appellantCaseData, appealDetails, currentRoute, session) {
	if (!appellantCaseData || appellantCaseData === null) {
		throw new Error('appellantCaseDetails is null or undefined');
	}

	currentRoute =
		currentRoute[currentRoute.length - 1] === '/' ? currentRoute.slice(0, -1) : currentRoute;

	/**
	 * Generates a document field with defaults
	 *
	 * @param {Object} options
	 * @param {string} options.id
	 * @param {string} options.text
	 * @param {FolderInfo|null|undefined} options.folderInfo
	 * @param {string} [options.cypressDataName]
	 * @returns {Instructions}
	 */
	const documentInstruction = ({ id, text, folderInfo, cypressDataName }) => {
		return documentTypeDisplayInstruction({
			id,
			text,
			appealId: appellantCaseData.appealId,
			folderInfo,
			userHasEditPermission: userHasPermission(permissionNames.updateCase, session),
			uploadUrlTemplate: documentUploadUrlTemplate,
			manageUrl: mapDocumentManageUrl(appellantCaseData.appealId, folderInfo?.folderId),
			cypressDataName
		});
	};
	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	/** @type {MappedInstructions} */
	const mappedData = {};

	mappedData.appellant = textDisplayField({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No appellant'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		userHasEditPermission: userHasUpdateCase,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});

	mappedData.agent = textDisplayField({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/change/agent`,
		userHasEditPermission: userHasUpdateCase,
		classes: 'appeal-agent'
	});

	mappedData.applicationReference = textDisplayField({
		id: 'application-reference',
		text: 'LPA application reference',
		value: appellantCaseData.planningApplicationReference,
		link: `${currentRoute}/lpa-reference/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.siteAddress = textDisplayField({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appellantCaseData.appealSite),
		link: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.siteArea = textDisplayField({
		id: 'site-area',
		text: 'Site area (m²)',
		value: appellantCaseData.siteAreaSquareMetres
			? `${appellantCaseData.siteAreaSquareMetres} m²`
			: '',
		link: `${currentRoute}/site-area/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.inGreenBelt = booleanDisplayInstruction({
		id: 'green-belt',
		text: 'In green belt',
		value: appellantCaseData.isGreenBelt,
		defaultText: '',
		link: `${currentRoute}/green-belt/change/appellant`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.applicationDecisionDate = textDisplayField({
		id: 'application-decision-date',
		text: 'Decision date',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate),
		link: `${currentRoute}/application-decision-date/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.applicationDate = textDisplayField({
		id: 'application-date',
		text: 'Application submitted',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDate),
		link: `${currentRoute}/application-date/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.developmentDescription = textDisplayField({
		id: 'development-description',
		text: 'Original Development description',
		value: appellantCaseData.developmentDescription?.details || 'Not provided',
		link: `${currentRoute}/development-description/change`,
		userHasEditPermission: userHasUpdateCase,
		withShowMore: true
	});

	mappedData.changedDevelopmentDescription = booleanDisplayInstruction({
		id: 'changed-development-description',
		text: 'LPA changed the development description',
		value: appellantCaseData.developmentDescription?.isChanged,
		link: `${currentRoute}/lpa-changed-description/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.applicationDecision = textDisplayField({
		id: 'application-decision',
		text: 'Outcome',
		value:
			appellantCaseData.applicationDecision === APPEAL_APPLICATION_DECISION.NOT_RECEIVED
				? 'Not received'
				: capitalize(appellantCaseData.applicationDecision ?? ''),
		link: `${currentRoute}/application-outcome/change`,
		userHasEditPermission: userHasUpdateCase
	});

	//TODO: update with new document type
	mappedData.changedDevelopmentDescriptionDocument = documentInstruction({
		id: 'changed-development-description.document',
		text: 'Agreement to change description evidence',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});

	mappedData.localPlanningAuthority = textDisplayField({
		id: 'local-planning-authority',
		text: 'Local planning authority (LPA)',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		userHasEditPermission: userHasUpdateCase
	});

	/**
	 * @param {Boolean | null} ownsAllLand
	 * @param {Boolean | null} ownsSomeLand
	 * @returns {string}
	 */
	const siteOwnershipText = (ownsAllLand, ownsSomeLand) => {
		if (ownsAllLand) {
			return 'Fully owned';
		} else if (ownsSomeLand) {
			return 'Partially owned';
		} else {
			return 'Not owned';
		}
	};

	mappedData.siteOwnership = textDisplayField({
		id: 'site-ownership',
		text: 'Site ownership',
		value: siteOwnershipText(
			appellantCaseData.siteOwnership.ownsAllLand,
			appellantCaseData.siteOwnership.ownsSomeLand
		),
		link: `${currentRoute}/site-ownership/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.ownersKnown = textDisplayField({
		id: 'owners-known',
		text: 'Owners known',
		value: mapOwnersKnownLabelText(appellantCaseData.siteOwnership.knowsOtherLandowners),
		link: `${currentRoute}/owners-known/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.appealType = textDisplayField({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType,
		link: `${currentRoute}/#`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.advertisedAppeal = booleanDisplayInstruction({
		id: 'advertised-appeal',
		text: 'Advertised appeal',
		value: appellantCaseData.hasAdvertisedAppeal,
		defaultText: '',
		link: `${currentRoute}/change-appeal-details/advertised-appeal`,
		addCyAttribute: true,
		userHasEditPermission: userHasUpdateCase
	});

	/** @type {Instructions} */
	mappedData.inspectorAccess = {
		id: 'inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspector access required'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(
							appealDetails.inspectorAccess.appellantCase.isRequired,
							'No answer provided'
						),
						appealDetails.inspectorAccess.appellantCase.details
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/inspector-access/change/appellant`,
							visuallyHiddenText: 'Inspector access required',
							attributes: { 'data-cy': 'change-inspector-access' }
						})
					]
				},
				classes: 'appellantcase-inspector-access'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.healthAndSafetyIssues = {
		id: 'appellant-case-health-and-safety',
		display: {
			summaryListItem: {
				key: {
					text: 'Potential safety risks'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(
							appealDetails.healthAndSafety.appellantCase.hasIssues,
							'No answer provided'
						),
						appealDetails.healthAndSafety.appellantCase.details
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/safety-risks/change/appellant`,
							visuallyHiddenText: 'potential safety risks',
							attributes: { 'data-cy': 'change-appellant-case-health-and-safety' }
						})
					]
				}
			}
		}
	};

	mappedData.applicationForm = documentInstruction({
		id: 'application-form',
		text: 'Application form',
		folderInfo: appellantCaseData.documents.originalApplicationForm
	});

	mappedData.designAccessStatement = documentInstruction({
		id: 'design-access-statement',
		text: 'Design and access statement',
		folderInfo: appellantCaseData.documents.designAccessStatement
	});

	mappedData.newPlansDrawings = documentInstruction({
		id: 'new-plans-drawings',
		text: 'New plans or drawings',
		folderInfo: appellantCaseData.documents.newPlansDrawings
	});

	mappedData.supportingDocuments = documentInstruction({
		id: 'supporting-documents',
		text: 'Supporting documents submitted with statement',
		folderInfo: appellantCaseData.documents.plansDrawings
	});

	mappedData.planningObligation = documentInstruction({
		id: 'planning-obligation',
		text: 'Planning obligation',
		folderInfo: appellantCaseData.documents.planningObligation
	});

	mappedData.ownershipCertificateSubmitted = booleanDisplayInstruction({
		id: 'ownership-certificate-submitted',
		text: 'Ownership certificate or land declaration submitted',
		value: appellantCaseData.ownershipCertificateSubmitted,
		defaultText: '',
		link: `${currentRoute}/ownership-certificate/change`,
		addCyAttribute: true,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.ownershipCertificate = documentInstruction({
		id: 'ownership-certificate',
		text: 'Ownership certificate or land declaration',
		folderInfo: appellantCaseData.documents.ownershipCertificate
	});

	mappedData.decisionLetter = documentInstruction({
		id: 'decision-letter',
		text: 'Decision letter',
		folderInfo: appellantCaseData.documents.applicationDecisionLetter
	});

	mappedData.appealStatement = documentInstruction({
		id: 'appeal-statement',
		text: 'Appeal statement',
		folderInfo: appellantCaseData.documents.appellantStatement
	});

	mappedData.otherNewDocuments = documentInstruction({
		id: 'new-supporting-documents',
		text: 'New supporting documents',
		folderInfo: appellantCaseData.documents.otherNewDocuments
	});

	/** @type {Instructions} */
	mappedData.additionalDocuments = {
		id: 'additional-documents',
		display: {
			...((isFolderInfo(appellantCaseData.documents.appellantCaseCorrespondence)
				? appellantCaseData.documents.appellantCaseCorrespondence.documents || []
				: []
			).length > 0
				? {
						summaryListItems: (isFolderInfo(appellantCaseData.documents.appellantCaseCorrespondence)
							? appellantCaseData.documents.appellantCaseCorrespondence.documents || []
							: []
						).map((document) => ({
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: displayPageFormatter.formatDocumentValues(
								appellantCaseData.appealId,
								[document],
								document.latestDocumentVersion?.isLateEntry || false
							),
							actions: {
								items: []
							}
						}))
				  }
				: {
						summaryListItems: [
							{
								key: {
									text: 'Additional documents',
									classes: 'govuk-visually-hidden'
								},
								value: {
									text: 'None'
								}
							}
						]
				  })
		}
	};

	/** @type {Instructions} */
	mappedData.reviewOutcome = {
		id: 'review-outcome',
		display: {
			summaryListItem: {
				key: {
					text: 'Appellant case review outcome'
				},
				value: {
					text: appellantCaseData.validation?.outcome || 'Not yet reviewed'
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'Appellant case review outcome',
							href: `/appeals-service/appeal-details/${appellantCaseData.appealId}/lpa-questionnaire`,
							attributes: { 'data-cy': 'change-review-outcome' }
						}
					]
				}
			}
		},
		input: {
			displayName: 'Review outcome',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'reviewOutcome',
						value: appellantCaseData.validation?.outcome,
						fieldset: {
							legend: {
								text: 'What is the outcome of your review?',
								classes: 'govuk-fieldset__legend--m'
							}
						},
						items: [
							{
								value: 'valid',
								text: 'Valid'
							},
							{
								value: 'invalid',
								text: 'Invalid'
							},
							{
								value: 'incomplete',
								text: 'Incomplete'
							}
						]
					}
				}
			]
		}
	};

	const otherAppealsItems = [];

	if (appealDetails.otherAppeals.length) {
		otherAppealsItems.push(
			mapActionComponent(permissionNames.updateCase, session, {
				text: 'Manage',
				href: `${currentRoute}/other-appeals/manage`,
				visuallyHiddenText: 'Related appeals',
				attributes: { 'data-cy': 'manage-related-appeals' }
			})
		);
	}

	otherAppealsItems.push(
		mapActionComponent(permissionNames.updateCase, session, {
			text: 'Add',
			href: `${currentRoute}/other-appeals/add`,
			visuallyHiddenText: 'Related appeals',
			attributes: { 'data-cy': 'add-related-appeals' }
		})
	);

	/** @type {Instructions} */
	mappedData.relatedAppeals = {
		id: 'related-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Related appeals'
				},
				value: {
					html:
						displayPageFormatter.formatListOfRelatedAppeals(appealDetails.otherAppeals) ||
						'No related appeals'
				},
				actions: {
					items: otherAppealsItems
				},
				classes: 'appeal-related-appeals'
			}
		}
	};

	mappedData.planningObligationInSupport = booleanDisplayInstruction({
		id: 'planning-obligation-in-support',
		text: 'Planning obligation in support',
		value: appellantCaseData.planningObligation?.hasObligation,
		defaultText: '',
		link: `${currentRoute}/planning-obligation/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.statusPlanningObligation = textDisplayField({
		id: 'planning-obligation-status',
		text: 'Planning obligation status',
		value: displayPageFormatter.formatPlanningObligationStatus(
			appellantCaseData.planningObligation?.status
		),
		link: `${currentRoute}/planning-obligation/status/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.partOfAgriculturalHolding = booleanDisplayInstruction({
		id: 'part-of-agricultural-holding',
		text: 'Part of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.tenantOfAgriculturalHolding = booleanDisplayInstruction({
		id: 'tenant-of-agricultural-holding',
		text: 'Tenant of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isTenant,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.otherTenantsOfAgriculturalHolding = booleanDisplayInstruction({
		id: 'other-tenants-of-agricultural-holding',
		text: 'Other tenants',
		value: appellantCaseData.agriculturalHolding.hasOtherTenants,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/other-tenants/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.appellantCostsApplication = booleanDisplayInstruction({
		id: 'appellant-costs-application',
		text: 'Applied for award of appeal costs',
		value: appellantCaseData.appellantCostsAppliedFor,
		link: `${currentRoute}/appeal-costs-application/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.costsDocument = documentInstruction({
		id: 'costs-appellant',
		text: 'Costs document',
		folderInfo: appealDetails.costs.appellantApplicationFolder,
		cypressDataName: 'costs-document'
	});

	/** @type {Instructions} */
	mappedData.procedurePreference = {
		id: 'procedure-preference',
		display: {
			summaryListItem: {
				key: {
					text: 'Procedure preference'
				},
				value: {
					text: capitalize(appellantCaseData.appellantProcedurePreference || 'Not answered')
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'procedure preference',
							href: `${currentRoute}/procedure-preference/change`,
							attributes: { 'data-cy': 'change-procedure-preference' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.procedurePreferenceDetails = {
		id: 'procedure-preference-details',
		display: {
			summaryListItem: {
				key: {
					text: 'Reason for preference'
				},
				value: {
					text: appellantCaseData.appellantProcedurePreferenceDetails || 'Not applicable'
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'reason for preference',
							href: `${currentRoute}/procedure-preference/details/change`,
							attributes: { 'data-cy': 'change-procedure-preference-details' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.procedurePreferenceDuration = {
		id: 'procedure-preference-duration',
		display: {
			summaryListItem: {
				key: {
					text: 'Expected length of procedure'
				},
				value: {
					text:
						'appellantProcedurePreferenceDuration' in appellantCaseData
							? `${appellantCaseData.appellantProcedurePreferenceDuration} days`
							: 'Not applicable'
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'Expected length of procedure',
							href: `${currentRoute}/procedure-preference/duration/change`,
							attributes: { 'data-cy': 'change-procedure-preference-duration' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.inquiryNumberOfWitnesses = {
		id: 'inquiry-number-of-witnesses',
		display: {
			summaryListItem: {
				key: {
					text: 'Expected number of witnesses'
				},
				value: {
					text: appellantCaseData.inquiryHowManyWitnesses || 'Not applicable'
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'Expected number of witnesses',
							href: `${currentRoute}/procedure-preference/inquiry/witnesses/change`,
							attributes: { 'data-cy': 'change-inquiry-number-of-witnesses' }
						}
					]
				}
			}
		}
	};

	return mappedData;
}

export const documentUploadUrlTemplate =
	'/appeals-service/appeal-details/{{appealId}}/appellant-case/add-documents/{{folderId}}/{{documentId}}';

/**
 *
 * @param {Number} caseId
 * @param {number|undefined} folderId
 * @returns {string}
 */
export const mapDocumentManageUrl = (caseId, folderId) => {
	if (folderId === undefined) {
		return '';
	}
	return `/appeals-service/appeal-details/${caseId}/appellant-case/manage-documents/${folderId}/`;
};

/**
 * @param {typeof APPEAL_KNOWS_OTHER_OWNERS.YES | typeof APPEAL_KNOWS_OTHER_OWNERS.NO | typeof APPEAL_KNOWS_OTHER_OWNERS.SOME | null} knowsOtherLandowners
 * @returns {string}
 */
const mapOwnersKnownLabelText = (knowsOtherLandowners) => {
	switch (knowsOtherLandowners) {
		case APPEAL_KNOWS_OTHER_OWNERS.YES:
			return 'Yes';
		case APPEAL_KNOWS_OTHER_OWNERS.NO:
			return 'No';
		case APPEAL_KNOWS_OTHER_OWNERS.SOME:
			return 'Some';
		case null:
		default:
			return 'Not applicable';
	}
};
