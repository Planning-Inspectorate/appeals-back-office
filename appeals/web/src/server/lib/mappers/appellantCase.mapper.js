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

	/** @type {MappedInstructions} */
	let mappedData = {};

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

	/** @type {Instructions} */
	mappedData.inGreenBelt = {
		id: 'green-belt',
		display: {
			summaryListItem: {
				key: {
					text: 'In green belt'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.isGreenBelt) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'In green belt',
							href: `${currentRoute}/green-belt/change/appellant`
						})
					]
				}
			}
		}
	};

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

	/** @type {Instructions} */
	mappedData.changedDevelopmentDescription = {
		id: 'changed-development-description',
		display: {
			summaryListItem: {
				key: {
					text: 'LPA changed the development description'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.developmentDescription?.isChanged)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'LPA changed the development description',
							href: `${currentRoute}/lpa-changed-description/change`
						})
					]
				}
			}
		}
	};

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
	/** @type {Instructions} */
	mappedData.changedDevelopmentDescriptionDocument = {
		id: 'changed-development-description.document',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Agreement to change description evidence',
				appellantCaseData.appealId,
				appellantCaseData.documents.changedDescription,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.changedDescription?.folderId
				),
				documentUploadUrlTemplate,
				'agreement-to-change-description-evidence'
			)
		}
	};

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

	/** @type {Instructions} */
	mappedData.advertisedAppeal = {
		id: 'advertised-appeal',
		display: {
			summaryListItem: {
				key: {
					text: 'Advertised appeal'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.hasAdvertisedAppeal) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Advertised appeal',
							href: `${currentRoute}/change-appeal-details/advertised-appeal`,
							attributes: { 'data-cy': 'change-advertised-appeal' }
						})
					]
				}
			}
		}
	};

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
						convertFromBooleanToYesNo(appealDetails.inspectorAccess.appellantCase.isRequired) ??
							'No answer provided',
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
						convertFromBooleanToYesNo(appealDetails.healthAndSafety.appellantCase.hasIssues) ||
							'No answer provided',
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

	/** @type {Instructions} */
	mappedData.applicationForm = {
		id: 'application-form',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Application form',
				appellantCaseData.appealId,
				appellantCaseData.documents.originalApplicationForm,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.originalApplicationForm?.folderId
				),
				documentUploadUrlTemplate,
				'application-form'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.designAccessStatement = {
		id: 'design-access-statement',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Design and access statement',
				appellantCaseData.appealId,
				appellantCaseData.documents.designAccessStatement,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.designAccessStatement?.folderId
				),
				documentUploadUrlTemplate,
				'design-access-statement'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.newPlansDrawings = {
		id: 'new-plans-drawings',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'New plans or drawings',
				appellantCaseData.appealId,
				appellantCaseData.documents.newPlansDrawings,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.newPlansDrawings?.folderId
				),
				documentUploadUrlTemplate,
				'new-plans-drawings'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.supportingDocuments = {
		id: 'supporting-documents',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Supporting documents submitted with statement',
				appellantCaseData.appealId,
				appellantCaseData.documents.plansDrawings,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.plansDrawings?.folderId
				),
				documentUploadUrlTemplate,
				'supporting-documents'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.planningObligation = {
		id: 'planning-obligation',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Planning obligation',
				appellantCaseData.appealId,
				appellantCaseData.documents.planningObligation,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.planningObligation?.folderId
				),
				documentUploadUrlTemplate,
				'planning-obligation'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.ownershipCertificateSubmitted = {
		id: 'ownership-certificate-submitted',
		display: {
			summaryListItem: {
				key: {
					text: 'Ownership certificate or land declaration submitted'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.ownershipCertificateSubmitted) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Ownership certificate or land declaration submitted',
							href: `${currentRoute}/ownership-certificate/change`,
							attributes: { 'data-cy': 'change-ownership-certificate-submitted' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.ownershipCertificate = {
		id: 'ownership-certificate',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Ownership certificate or land declaration',
				appellantCaseData.appealId,
				appellantCaseData.documents.ownershipCertificate,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.ownershipCertificate?.folderId
				),
				documentUploadUrlTemplate,
				'ownership-certificate'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.decisionLetter = {
		id: 'decision-letter',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Decision letter',
				appellantCaseData.appealId,
				appellantCaseData.documents.applicationDecisionLetter,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.applicationDecisionLetter?.folderId
				),
				documentUploadUrlTemplate,
				'decision-letter'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.appealStatement = {
		id: 'appeal-statement',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Appeal statement',
				appellantCaseData.appealId,
				appellantCaseData.documents.appellantStatement,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.appellantStatement?.folderId
				),
				documentUploadUrlTemplate,
				'appeal-statement'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.otherNewDocuments = {
		id: 'new-supporting-documents',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'New supporting documents',
				appellantCaseData.appealId,
				appellantCaseData.documents.otherNewDocuments,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appellantCaseData.documents.otherNewDocuments?.folderId
				),
				documentUploadUrlTemplate,
				'new-supporting-documents'
			)
		}
	};

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

	/** @type {Instructions} */
	mappedData.planningObligationInSupport = {
		id: 'planning-obligation-in-support',
		display: {
			summaryListItem: {
				key: {
					text: 'Planning obligation in support'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.planningObligation?.hasObligation) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Planning obligation in support',
							href: `${currentRoute}/planning-obligation/change`
						})
					]
				}
			}
		}
	};

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

	/** @type {Instructions} */
	mappedData.partOfAgriculturalHolding = {
		id: 'part-of-agricultural-holding',
		display: {
			summaryListItem: {
				key: {
					text: 'Part of agricultural holding'
				},
				value: {
					text:
						convertFromBooleanToYesNo(
							appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding
						) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Part of agricultural holding',
							href: `${currentRoute}/agricultural-holding/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.tenantOfAgriculturalHolding = {
		id: 'tenant-of-agricultural-holding',
		display: {
			summaryListItem: {
				key: {
					text: 'Tenant of agricultural holding'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.agriculturalHolding.isTenant) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Tenant of agricultural holding',
							href: `${currentRoute}/agricultural-holding/tenant/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.otherTenantsOfAgriculturalHolding = {
		id: 'other-tenants-of-agricultural-holding',
		display: {
			summaryListItem: {
				key: {
					text: 'Other tenants'
				},
				value: {
					text:
						convertFromBooleanToYesNo(appellantCaseData.agriculturalHolding.hasOtherTenants) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Other tenants',
							href: `${currentRoute}/agricultural-holding/other-tenants/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appellantCostsApplication = {
		id: 'appellant-costs-application',
		display: {
			summaryListItem: {
				key: {
					text: 'Applied for award of appeal costs'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.appellantCostsAppliedFor)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Applied for award of appeal costs',
							href: `${currentRoute}/appeal-costs-application/change`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.costsDocument = {
		id: 'costs-appellant',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Costs document',
				appellantCaseData.appealId,
				appealDetails.costs.appellantApplicationFolder,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					appellantCaseData.appealId,
					appealDetails.costs.appellantApplicationFolder?.folderId
				),
				documentUploadUrlTemplate,
				'costs-document'
			)
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
