import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapAddressInput } from './global-mapper-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent } from './component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

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
		},
		input: {
			displayName: 'LPA application reference',
			instructions: [
				{
					type: 'input',
					properties: {
						name: 'application-reference',
						value: appellantCaseData.planningApplicationReference
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
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
						{
							text: 'Change',
							visuallyHiddenText: 'Site address',
							href: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
							attributes: { 'data-cy': 'change-site-address' }
						}
					]
				}
			}
		},
		input: {
			displayName: 'Site address',
			instructions: mapAddressInput(appellantCaseData.appealSite)
		},
		submitApi: '#',
		inputItemApi: '#'
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
		},
		input: {
			displayName: 'Local planning authority (LPA)',
			instructions: [
				{
					type: 'input',
					properties: {
						name: 'local-planning-authority',
						value: appellantCaseData.localPlanningDepartment
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
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
					text: appellantCaseData.siteOwnership.isFullyOwned ? 'Fully owned' : 'Partially owned'
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'Site ownership',
							href: `${currentRoute}/site-ownership/change`,
							attributes: { 'data-cy': 'change-site-ownership' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.sitePartiallyOwned = {
		id: 'site-partially-owned',
		display: {
			summaryListItem: {
				key: {
					text: 'Site partially owned'
				},
				value: {
					text: convertFromBooleanToYesNo(appellantCaseData.siteOwnership.isPartiallyOwned) || ''
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'Site partially owned',
							href: `${currentRoute}/change-appeal-details/site-partially-owned`,
							attributes: { 'data-cy': 'change-site-partially-owned' }
						}
					]
				}
			}
		},
		input: {
			displayName: 'Site partially owned',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'site-partially-owned',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								checked: appellantCaseData.siteOwnership.isPartiallyOwned
							},
							{
								text: 'No',
								value: 'no',
								checked: !appellantCaseData.siteOwnership.isPartiallyOwned
							}
						]
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
	};

	/** @type {Instructions} */
	mappedData.allOwnersKnown = {
		id: 'all-owners-known',
		display: {
			summaryListItem: {
				key: {
					text: 'All owners known'
				},
				value: {
					text: appellantCaseData.siteOwnership.areAllOwnersKnown
				},
				actions: {
					items: [
						{
							text: 'Change',
							visuallyHiddenText: 'All owners known',
							href: `${currentRoute}/change-appeal-details/all-owners-known`,
							attributes: { 'data-cy': 'change-all-owners-known' }
						}
					]
				}
			}
		},
		input: {
			displayName: 'All owners known',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'all-owners-known',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								checked: appellantCaseData.siteOwnership.areAllOwnersKnown
							},
							{
								text: 'No',
								value: 'no',
								checked: !appellantCaseData.siteOwnership.areAllOwnersKnown
							}
						]
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
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
						{
							text: 'Change',
							visuallyHiddenText: 'Advertised appeal',
							href: `${currentRoute}/change-appeal-details/advertised-appeal`,
							attributes: { 'data-cy': 'change-advertised-appeal' }
						}
					]
				}
			}
		},
		input: {
			displayName: 'Advertised appeal',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'advertised-appeal',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								checked: appellantCaseData.hasAdvertisedAppeal
							},
							{
								text: 'No',
								value: 'no',
								checked: !appellantCaseData.hasAdvertisedAppeal
							}
						]
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
	};

	/** @type {Instructions} */
	mappedData.inspectorAccess = {
		id: 'inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspection access required'
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
						{
							text: 'Change',
							href: `${currentRoute}/inspector-access/change/appellant`,
							visuallyHiddenText: 'Inspector access required',
							attributes: { 'data-cy': 'change-inspector-access' }
						}
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
						{
							text: 'Change',
							href: `${currentRoute}/safety-risks/change/appellant`,
							visuallyHiddenText: 'potential safety risks',
							attributes: { 'data-cy': 'change-appellant-case-health-and-safety' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.applicationForm = {
		id: 'application-form',
		display: {
			summaryListItem: {
				key: {
					text: 'Application form'
				},
				value: displayPageFormatter.formatDocumentValues(
					appellantCaseData.appealId,
					isFolderInfo(appellantCaseData.documents.originalApplicationForm)
						? appellantCaseData.documents.originalApplicationForm?.documents || []
						: []
				),
				actions: {
					items: [
						...((
							(isFolderInfo(appellantCaseData.documents.originalApplicationForm) &&
								appellantCaseData.documents.originalApplicationForm.documents) ||
							[]
						).length
							? [
									{
										text: 'Manage',
										visuallyHiddenText: 'Application form',
										href: mapDocumentManageUrl(
											appellantCaseData.appealId,
											isFolderInfo(appellantCaseData.documents.originalApplicationForm)
												? appellantCaseData.documents.originalApplicationForm.folderId
												: undefined
										)
									}
							  ]
							: []),
						{
							text: 'Add',
							visuallyHiddenText: 'Application form',
							href: displayPageFormatter.formatDocumentActionLink(
								appellantCaseData.appealId,
								appellantCaseData.documents.originalApplicationForm,
								documentUploadUrlTemplate
							),
							attributes: { 'data-cy': 'add-application-form' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.decisionLetter = {
		id: 'decision-letter',
		display: {
			summaryListItem: {
				key: {
					text: 'Decision letter'
				},
				value: displayPageFormatter.formatDocumentValues(
					appellantCaseData.appealId,
					isFolderInfo(appellantCaseData.documents.applicationDecisionLetter)
						? appellantCaseData.documents.applicationDecisionLetter.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(appellantCaseData.documents.applicationDecisionLetter)
							? appellantCaseData.documents.applicationDecisionLetter.documents || []
							: []
						).length
							? [
									{
										text: 'Manage',
										visuallyHiddenText: 'Decision letter',
										href: mapDocumentManageUrl(
											appellantCaseData.appealId,
											isFolderInfo(appellantCaseData.documents.applicationDecisionLetter)
												? appellantCaseData.documents.applicationDecisionLetter.folderId
												: undefined
										),
										attributes: { 'data-cy': 'manage-decision-letter' }
									}
							  ]
							: []),
						{
							text: 'Add',
							visuallyHiddenText: 'Decision letter',
							href: displayPageFormatter.formatDocumentActionLink(
								appellantCaseData.appealId,
								appellantCaseData.documents.applicationDecisionLetter,
								documentUploadUrlTemplate
							),
							attributes: { 'data-cy': 'add-decision-letter' }
						}
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appealStatement = {
		id: 'appeal-statement',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal statement'
				},
				value: displayPageFormatter.formatDocumentValues(
					appellantCaseData.appealId,
					isFolderInfo(appellantCaseData.documents.appellantStatement)
						? appellantCaseData.documents.appellantStatement.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(appellantCaseData.documents.appellantStatement)
							? appellantCaseData.documents.appellantStatement.documents || []
							: []
						).length
							? [
									{
										text: 'Manage',
										visuallyHiddenText: 'Appeal statement',
										href: mapDocumentManageUrl(
											appellantCaseData.appealId,
											isFolderInfo(appellantCaseData.documents.appellantStatement)
												? appellantCaseData.documents.appellantStatement.folderId
												: undefined
										),
										attributes: { 'data-cy': 'manage-appeal-statement' }
									}
							  ]
							: []),
						{
							text: 'Add',
							visuallyHiddenText: 'Appeal statement',
							href: displayPageFormatter.formatDocumentActionLink(
								appellantCaseData.appealId,
								appellantCaseData.documents.appellantStatement,
								documentUploadUrlTemplate
							),
							attributes: { 'data-cy': 'add-appeal-statement' }
						}
					]
				}
			}
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
