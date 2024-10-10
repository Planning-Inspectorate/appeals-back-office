import { appealSiteToAddressString } from '#lib/address-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent, userHasPermission } from './permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import { APPEAL_APPLICATION_DECISION, APPEAL_KNOWS_OTHER_OWNERS } from 'pins-data-model';
import {
	booleanSummaryListItem,
	booleanWithDetailsSummaryListItem
} from '#lib/mappers/components/boolean.js';
import { documentSummaryListItem } from '#lib/mappers/components/document.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

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
		return documentSummaryListItem({
			id,
			text,
			appealId: appellantCaseData.appealId,
			folderInfo,
			editable: userHasPermission(permissionNames.updateCase, session),
			uploadUrlTemplate: documentUploadUrlTemplate,
			manageUrl: mapDocumentManageUrl(appellantCaseData.appealId, folderInfo?.folderId),
			cypressDataName
		});
	};
	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

	/** @type {MappedInstructions} */
	const mappedData = {};

	mappedData.appellant = textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No appellant'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});

	mappedData.agent = textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/change/agent`,
		editable: userHasUpdateCase,
		classes: 'appeal-agent'
	});

	mappedData.applicationReference = textSummaryListItem({
		id: 'application-reference',
		text: 'LPA application reference',
		value: appellantCaseData.planningApplicationReference,
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCase
	});

	mappedData.siteAddress = textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appellantCaseData.appealSite),
		link: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
		editable: userHasUpdateCase
	});

	mappedData.siteArea = textSummaryListItem({
		id: 'site-area',
		text: 'Site area (m²)',
		value: appellantCaseData.siteAreaSquareMetres
			? `${appellantCaseData.siteAreaSquareMetres} m²`
			: '',
		link: `${currentRoute}/site-area/change`,
		editable: userHasUpdateCase
	});

	mappedData.inGreenBelt = booleanSummaryListItem({
		id: 'green-belt',
		text: 'In green belt',
		value: appellantCaseData.isGreenBelt,
		defaultText: '',
		link: `${currentRoute}/green-belt/change/appellant`,
		editable: userHasUpdateCase
	});

	mappedData.applicationDecisionDate = textSummaryListItem({
		id: 'application-decision-date',
		text: 'Decision date',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate),
		link: `${currentRoute}/application-decision-date/change`,
		editable: userHasUpdateCase
	});

	mappedData.applicationDate = textSummaryListItem({
		id: 'application-date',
		text: 'Application submitted',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDate),
		link: `${currentRoute}/application-date/change`,
		editable: userHasUpdateCase
	});

	mappedData.developmentDescription = textSummaryListItem({
		id: 'development-description',
		text: 'Original Development description',
		value: appellantCaseData.developmentDescription?.details || 'Not provided',
		link: `${currentRoute}/development-description/change`,
		editable: userHasUpdateCase,
		withShowMore: true
	});

	mappedData.changedDevelopmentDescription = booleanSummaryListItem({
		id: 'changed-development-description',
		text: 'LPA changed the development description',
		value: appellantCaseData.developmentDescription?.isChanged,
		link: `${currentRoute}/lpa-changed-description/change`,
		editable: userHasUpdateCase
	});

	mappedData.applicationDecision = textSummaryListItem({
		id: 'application-decision',
		text: 'Outcome',
		value: (() => {
			switch (appellantCaseData.applicationDecision) {
				case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
					return 'Not received';
				case APPEAL_APPLICATION_DECISION.GRANTED:
					return 'Granted with conditions';
				case APPEAL_APPLICATION_DECISION.REFUSED:
					return 'Refused';
				default:
					return '';
			}
		})(),
		link: `${currentRoute}/application-outcome/change`,
		editable: userHasUpdateCase
	});

	//TODO: update with new document type
	mappedData.changedDevelopmentDescriptionDocument = documentInstruction({
		id: 'changed-development-description.document',
		text: 'Agreement to change description evidence',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});

	mappedData.localPlanningAuthority = textSummaryListItem({
		id: 'local-planning-authority',
		text: 'Local planning authority (LPA)',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCase
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

	mappedData.siteOwnership = textSummaryListItem({
		id: 'site-ownership',
		text: 'Site ownership',
		value: siteOwnershipText(
			appellantCaseData.siteOwnership.ownsAllLand,
			appellantCaseData.siteOwnership.ownsSomeLand
		),
		link: `${currentRoute}/site-ownership/change`,
		editable: userHasUpdateCase
	});

	mappedData.ownersKnown = textSummaryListItem({
		id: 'owners-known',
		text: 'Owners known',
		value: mapOwnersKnownLabelText(appellantCaseData.siteOwnership.knowsOtherLandowners),
		link: `${currentRoute}/owners-known/change`,
		editable: userHasUpdateCase
	});

	mappedData.appealType = textSummaryListItem({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType,
		link: `${currentRoute}/#`,
		editable: userHasUpdateCase
	});

	mappedData.advertisedAppeal = booleanSummaryListItem({
		id: 'advertised-appeal',
		text: 'Advertised appeal',
		value: appellantCaseData.hasAdvertisedAppeal,
		defaultText: '',
		link: `${currentRoute}/change-appeal-details/advertised-appeal`,
		addCyAttribute: true,
		editable: userHasUpdateCase
	});

	mappedData.inspectorAccess = booleanWithDetailsSummaryListItem({
		id: 'inspector-access',
		text: 'Inspector access required',
		value: appealDetails.inspectorAccess.appellantCase.isRequired,
		valueDetails: appealDetails.inspectorAccess.appellantCase.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appellantcase-inspector-access',
		addCyAttribute: true
	});

	mappedData.healthAndSafetyIssues = booleanWithDetailsSummaryListItem({
		id: 'appellant-case-health-and-safety',
		text: 'Potential safety risks',
		value: appealDetails.healthAndSafety.appellantCase.hasIssues,
		valueDetails: appealDetails.healthAndSafety.appellantCase.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/appellant`,
		editable: userHasUpdateCase,
		addCyAttribute: true
	});

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

	mappedData.ownershipCertificateSubmitted = booleanSummaryListItem({
		id: 'ownership-certificate-submitted',
		text: 'Ownership certificate or land declaration submitted',
		value: appellantCaseData.ownershipCertificateSubmitted,
		defaultText: '',
		link: `${currentRoute}/ownership-certificate/change`,
		addCyAttribute: true,
		editable: userHasUpdateCase
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

	mappedData.planningObligationInSupport = booleanSummaryListItem({
		id: 'planning-obligation-in-support',
		text: 'Planning obligation in support',
		value: appellantCaseData.planningObligation?.hasObligation,
		defaultText: '',
		link: `${currentRoute}/planning-obligation/change`,
		editable: userHasUpdateCase
	});

	mappedData.statusPlanningObligation = textSummaryListItem({
		id: 'planning-obligation-status',
		text: 'Planning obligation status',
		value: displayPageFormatter.formatPlanningObligationStatus(
			appellantCaseData.planningObligation?.status
		),
		link: `${currentRoute}/planning-obligation/status/change`,
		editable: userHasUpdateCase
	});

	mappedData.partOfAgriculturalHolding = booleanSummaryListItem({
		id: 'part-of-agricultural-holding',
		text: 'Part of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/change`,
		editable: userHasUpdateCase
	});

	mappedData.tenantOfAgriculturalHolding = booleanSummaryListItem({
		id: 'tenant-of-agricultural-holding',
		text: 'Tenant of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isTenant,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		editable: userHasUpdateCase
	});

	mappedData.otherTenantsOfAgriculturalHolding = booleanSummaryListItem({
		id: 'other-tenants-of-agricultural-holding',
		text: 'Other tenants',
		value: appellantCaseData.agriculturalHolding.hasOtherTenants,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/other-tenants/change`,
		editable: userHasUpdateCase
	});

	mappedData.appellantCostsApplication = booleanSummaryListItem({
		id: 'appellant-costs-application',
		text: 'Applied for award of appeal costs',
		value: appellantCaseData.appellantCostsAppliedFor,
		link: `${currentRoute}/appeal-costs-application/change`,
		editable: userHasUpdateCase
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
						'appellantProcedurePreferenceDuration' in appellantCaseData &&
						appellantCaseData?.appellantProcedurePreferenceDuration !== null
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
