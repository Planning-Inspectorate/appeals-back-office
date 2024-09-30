import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent } from './component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { dateToDisplayDate } from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import { APPEAL_KNOWS_OTHER_OWNERS } from 'pins-data-model';
import { SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING } from '#lib/constants.js';
import { booleanDisplayField } from '#lib/page-components/boolean.js';
import { documentTypeDisplayField } from '#lib/page-components/document.js';

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
		return documentTypeDisplayField({
			id,
			text,
			appealId: appellantCaseData.appealId,
			folderInfo,
			requiredPermissionName: permissionNames.updateCase,
			uploadUrlTemplate: documentUploadUrlTemplate,
			manageUrl: mapDocumentManageUrl(appellantCaseData.appealId, folderInfo?.folderId),
			session,
			cypressDataName
		});
	};

	/** @type {MappedInstructions} */
	const mappedData = {};

	/** @type {Instructions} */
	mappedData.appellant = {
		id: 'appellant',
		display: {
			summaryListItem: {
				key: {
					text: 'Appellant'
				},
				value: {
					html: appealDetails.appellant
						? formatServiceUserAsHtmlList(appealDetails.appellant)
						: 'No appellant'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/service-user/change/appellant`,
							visuallyHiddenText: 'Appellant',
							attributes: { 'data-cy': 'appellant' }
						})
					]
				},
				classes: 'appeal-appellant'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.agent = {
		id: 'agent',
		display: {
			summaryListItem: {
				key: {
					text: 'Agent'
				},
				value: {
					html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/service-user/change/agent`,
							visuallyHiddenText: 'Agent',
							attributes: { 'data-cy': 'change-agent' }
						})
					]
				},
				classes: 'appeal-agent'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.applicationReference = {
		id: 'application-reference',
		display: {
			summaryListItem: {
				key: {
					text: 'LPA application reference'
				},
				value: {
					text: appellantCaseData.planningApplicationReference
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'LPA application reference',
							href: `${currentRoute}/lpa-reference/change`,
							attributes: { 'data-cy': 'change-application-reference' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.siteAddress = {
		id: 'site-address',
		display: {
			summaryListItem: {
				key: {
					text: 'Site address'
				},
				value: {
					text: appealSiteToAddressString(appellantCaseData.appealSite)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Site address',
							href: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
							attributes: { 'data-cy': 'change-site-address' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.siteArea = {
		id: 'site-area',
		display: {
			summaryListItem: {
				key: {
					text: 'Site area (m²)'
				},
				value: {
					text: appellantCaseData.siteAreaSquareMetres
						? `${appellantCaseData.siteAreaSquareMetres} m²`
						: ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Site area in square metres ',
							href: `${currentRoute}/site-area/change`
						})
					]
				}
			}
		}
	};

	mappedData.inGreenBelt = booleanDisplayField({
		id: 'green-belt',
		text: 'In green belt',
		value: appellantCaseData.isGreenBelt,
		defaultText: '',
		link: `${currentRoute}/green-belt/change/appellant`,
		session
	});

	/** @type {Instructions} */
	mappedData.applicationDecisionDate = {
		id: 'application-decision-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Decision date'
				},
				value: {
					text: dateToDisplayDate(appellantCaseData.applicationDecisionDate)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Decision date',
							href: `${currentRoute}/application-decision-date/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.applicationDate = {
		id: 'application-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Application submitted'
				},
				value: {
					text: dateToDisplayDate(appellantCaseData.applicationDate)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Application submitted',
							href: `${currentRoute}/application-date/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.developmentDescription = {
		id: 'development-description',
		display: {
			summaryListItem: {
				key: {
					text: 'Original Development description'
				},
				value: {
					...(appellantCaseData.developmentDescription?.details?.length &&
					appellantCaseData.developmentDescription?.details.length >
						SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING
						? {
								html: '',
								pageComponents: [
									{
										type: 'show-more',
										parameters: {
											text: appellantCaseData.developmentDescription?.details ?? 'Not provided',
											labelText: 'Original development description'
										}
									}
								]
						  }
						: {
								text: appellantCaseData.developmentDescription?.details ?? 'Not provided'
						  })
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Development description',
							href: `${currentRoute}/development-description/change`
						})
					]
				}
			}
		}
	};

	mappedData.changedDevelopmentDescription = booleanDisplayField({
		id: 'changed-development-description',
		text: 'LPA changed the development description',
		value: appellantCaseData.developmentDescription?.isChanged,
		link: `${currentRoute}/lpa-changed-description/change`,
		session
	});

	/** @type {Instructions} */
	mappedData.applicationDecision = {
		id: 'application-decision',
		display: {
			summaryListItem: {
				key: {
					text: 'Outcome'
				},
				value: {
					text:
						appellantCaseData.applicationDecision === 'not_received'
							? 'Not received'
							: capitalize(appellantCaseData.applicationDecision ?? '')
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Application outcome',
							href: `${currentRoute}/application-outcome/change`
						})
					]
				}
			}
		}
	};

	//TODO: update with new document type
	mappedData.changedDevelopmentDescriptionDocument = documentInstruction({
		id: 'changed-development-description.document',
		text: 'Agreement to change description evidence',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});

	/** @type {Instructions} */
	mappedData.localPlanningAuthority = {
		id: 'local-planning-authority',
		display: {
			summaryListItem: {
				key: {
					text: 'Local planning authority (LPA)'
				},
				value: {
					text: appellantCaseData.localPlanningDepartment
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'local planning authority (LPA)',
							href: `${currentRoute}/change-appeal-details/local-planning-authority`,
							attributes: { 'data-cy': 'change-local-planning-authority' }
						}
					]
				}
			}
		}
	};

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

	/** @type {Instructions} */
	mappedData.siteOwnership = {
		id: 'site-ownership',
		display: {
			summaryListItem: {
				key: {
					text: 'Site ownership'
				},
				value: {
					text: siteOwnershipText(
						appellantCaseData.siteOwnership.ownsAllLand,
						appellantCaseData.siteOwnership.ownsSomeLand
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Site ownership',
							href: `${currentRoute}/site-ownership/change`,
							attributes: { 'data-cy': 'change-site-ownership' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.ownersKnown = {
		id: 'owners-known',
		display: {
			summaryListItem: {
				key: {
					text: 'Owners known'
				},
				value: {
					text: mapOwnersKnownLabelText(appellantCaseData.siteOwnership.knowsOtherLandowners)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Owners known',
							href: `${currentRoute}/owners-known/change`,
							attributes: { 'data-cy': 'change-owners-known' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appealType = {
		id: 'appeal-type',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal type'
				},
				value: {
					text: appealDetails.appealType
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Appeal type',
							href: `${currentRoute}/#`,
							attributes: { 'data-cy': 'change-appeal-type' }
						})
					]
				}
			}
		}
	};

	mappedData.advertisedAppeal = booleanDisplayField({
		id: 'advertised-appeal',
		text: 'Advertised appeal',
		value: appellantCaseData.hasAdvertisedAppeal,
		defaultText: '',
		link: `${currentRoute}/change-appeal-details/advertised-appeal`,
		addCyAttribute: true,
		session
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

	mappedData.ownershipCertificateSubmitted = booleanDisplayField({
		id: 'ownership-certificate-submitted',
		text: 'Ownership certificate or land declaration submitted',
		value: appellantCaseData.ownershipCertificateSubmitted,
		defaultText: '',
		link: `${currentRoute}/ownership-certificate/change`,
		addCyAttribute: true,
		session
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

	mappedData.planningObligationInSupport = booleanDisplayField({
		id: 'planning-obligation-in-support',
		text: 'Planning obligation in support',
		value: appellantCaseData.planningObligation?.hasObligation,
		defaultText: '',
		link: `${currentRoute}/planning-obligation/change`,
		session
	});

	/** @type {Instructions} */
	mappedData.statusPlanningObligation = {
		id: 'planning-obligation-status',
		display: {
			summaryListItem: {
				key: {
					text: 'Planning obligation status'
				},
				value: {
					text: displayPageFormatter.formatPlanningObligationStatus(
						appellantCaseData.planningObligation?.status
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Planning obligation status',
							href: `${currentRoute}/planning-obligation/status/change`
						})
					]
				}
			}
		}
	};

	mappedData.partOfAgriculturalHolding = booleanDisplayField({
		id: 'part-of-agricultural-holding',
		text: 'Part of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/change`,
		session
	});

	mappedData.tenantOfAgriculturalHolding = booleanDisplayField({
		id: 'tenant-of-agricultural-holding',
		text: 'Tenant of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isTenant,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		session
	});

	mappedData.otherTenantsOfAgriculturalHolding = booleanDisplayField({
		id: 'other-tenants-of-agricultural-holding',
		text: 'Other tenants',
		value: appellantCaseData.agriculturalHolding.hasOtherTenants,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/other-tenants/change`,
		session
	});

	/** @type {Instructions} */
	mappedData.appellantCostsApplication = booleanDisplayField({
		id: 'appellant-costs-application',
		text: 'Applied for award of appeal costs',
		value: appellantCaseData.appellantCostsAppliedFor,
		link: `${currentRoute}/appeal-costs-application/change`,
		session
	});

	mappedData.costsDocument = documentInstruction({
		id: 'costs-appellant',
		text: 'Costs document',
		folderInfo: appealDetails.costs.appellantApplicationFolder
	});

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
