import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent } from './component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';

/**
 * @typedef StatusTag
 * @type {object}
 * @property {string} status
 * @property {string} classes
 */

/**
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 */

/**
 * @param {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} lpaQuestionnaireData
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {import('../../app/auth/auth-session.service').SessionWithAuth} session
 * @returns {{lpaq: MappedInstructions}}
 */
export function initialiseAndMapLPAQData(
	lpaQuestionnaireData,
	appealDetails,
	session,
	currentRoute
) {
	/** @type {{lpaq: MappedInstructions}} */
	const mappedData = {};
	mappedData.lpaq = {};

	/** @type {Instructions} */
	mappedData.lpaq.affectsListedBuildingDetails = {
		id: 'affects-listed-building-details',
		display: {
			summaryListItem: {
				key: {
					text: 'Listed buildings'
				},
				value: {
					html: displayPageFormatter.formatListOfListedBuildingNumbers(
						lpaQuestionnaireData.listedBuildingDetails || []
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Affects listed building details',
							href: `${currentRoute}/change-lpa-questionnaire/affects-listed-building-details`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-affects-listed-building-details' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.isCorrectAppealType = {
		id: 'is-correct-appeal-type',
		display: {
			summaryListItem: {
				key: {
					text: 'Correct appeal type'
				},
				value: {
					html: convertFromBooleanToYesNo(lpaQuestionnaireData.isCorrectAppealType) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Correct appeal type',
							href: `${currentRoute}/is-correct-appeal-type/change`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-is-correct-appeal-type' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.conservationAreaMap = {
		id: 'conservation-area-map',
		display: {
			summaryListItem: {
				key: {
					text: 'Conservation area map and guidance'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.conservationMap)
						? lpaQuestionnaireData.documents.conservationMap.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.conservationMap)
							? lpaQuestionnaireData.documents.conservationMap.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Conservation area map and guidance',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.conservationMap)
												? lpaQuestionnaireData.documents.conservationMap.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-conservation-area-map' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Conservation area map and guidance',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.conservationMap,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-conservation-area-map' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.siteWithinGreenBelt = {
		id: 'site-within-green-belt',
		display: {
			summaryListItem: {
				key: {
					text: 'Green belt'
				},
				value: {
					text: convertFromBooleanToYesNo(lpaQuestionnaireData.siteWithinGreenBelt) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Green belt',
							href: `${currentRoute}/change-lpa-questionnaire/site-within-green-belt`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-site-within-green-belt' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.notifyingParties = {
		id: 'notifying-parties',
		display: {
			summaryListItem: {
				key: {
					text: 'Who was notified'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.whoNotified)
						? lpaQuestionnaireData.documents.whoNotified.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.whoNotified)
							? lpaQuestionnaireData.documents.whoNotified.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Who was notified',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.whoNotified)
												? lpaQuestionnaireData.documents.whoNotified.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-notifying-parties' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Who was notified',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.whoNotified,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-notifying-parties' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.siteNotice = {
		id: 'site-notice',
		display: {
			summaryListItem: {
				key: {
					text: 'Site notice'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.siteNotice)
						? lpaQuestionnaireData.documents.siteNotice.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.siteNotice)
							? lpaQuestionnaireData.documents.siteNotice.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Site notice',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.siteNotice)
												? lpaQuestionnaireData.documents.siteNotice.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-site-notice' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Site notice',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.siteNotice,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-site-notice' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.lettersToNeighbours = {
		id: 'letters-to-neighbours',
		display: {
			summaryListItem: {
				key: {
					text: 'Letter or email notification'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.lettersToNeighbours)
						? lpaQuestionnaireData.documents.lettersToNeighbours.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.lettersToNeighbours)
							? lpaQuestionnaireData.documents.lettersToNeighbours.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Letter or email notification',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.lettersToNeighbours)
												? lpaQuestionnaireData.documents.lettersToNeighbours.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-letter-or-email-notification' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Letter or email notification',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.lettersToNeighbours,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-letter-or-email-notification' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.pressAdvert = {
		id: 'press-advert',
		display: {
			summaryListItem: {
				key: {
					text: 'Press advert notification'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.pressAdvert)
						? lpaQuestionnaireData.documents.pressAdvert.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.pressAdvert)
							? lpaQuestionnaireData.documents.pressAdvert.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Press advert notification',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.pressAdvert)
												? lpaQuestionnaireData.documents.pressAdvert.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-press-advert-notification' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Press advert notification',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.pressAdvert,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-press-advert-notification' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.representations = {
		id: 'representations-from-other-parties',
		display: {
			summaryListItem: {
				key: {
					text: 'Representations from other parties documents'
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.otherPartyRepresentations)
						? lpaQuestionnaireData.documents.otherPartyRepresentations.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.otherPartyRepresentations)
							? lpaQuestionnaireData.documents.otherPartyRepresentations.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: 'Representations from other parties documents',
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.otherPartyRepresentations)
												? lpaQuestionnaireData.documents.otherPartyRepresentations.folderId
												: undefined
										),
										attributes: {
											'lpaQuestionnaireData-cy': 'manage-representations-from-other-parties'
										}
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Representations from other parties documents',
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.otherPartyRepresentations,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-representations-from-other-parties' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.officersReport = {
		id: 'officers-report',
		display: {
			summaryListItem: {
				key: {
					text: "Planning officer's report"
				},
				value: displayPageFormatter.formatDocumentValues(
					lpaQuestionnaireData.appealId,
					isFolderInfo(lpaQuestionnaireData.documents.planningOfficerReport)
						? lpaQuestionnaireData.documents.planningOfficerReport.documents || []
						: []
				),
				actions: {
					items: [
						...((isFolderInfo(lpaQuestionnaireData.documents.planningOfficerReport)
							? lpaQuestionnaireData.documents.planningOfficerReport.documents || []
							: []
						).length
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										visuallyHiddenText: "Planning officer's report",
										href: mapDocumentManageUrl(
											lpaQuestionnaireData.appealId,
											lpaQuestionnaireData.lpaQuestionnaireId,
											isFolderInfo(lpaQuestionnaireData.documents.planningOfficerReport)
												? lpaQuestionnaireData.documents.planningOfficerReport.folderId
												: undefined
										),
										attributes: { 'lpaQuestionnaireData-cy': 'manage-officers-report' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: "Planning officer's report",
							href: displayPageFormatter.formatDocumentActionLink(
								lpaQuestionnaireData.appealId,
								lpaQuestionnaireData.documents.planningOfficerReport,
								buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
							),
							attributes: { 'lpaQuestionnaireData-cy': 'add-officers-report' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.siteAccess = {
		id: 'does-site-require-inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Site access required'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(lpaQuestionnaireData.doesSiteRequireInspectorAccess) ??
							'No answer provided',
						lpaQuestionnaireData.inspectorAccessDetails
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Site access required',
							href: `${currentRoute}/inspector-access/change/lpa`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-does-site-require-inspector-access' }
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.lpaHealthAndSafety = {
		id: 'health-and-safety',
		display: {
			summaryListItem: {
				key: {
					text: 'Potential safety risks'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(lpaQuestionnaireData.doesSiteHaveHealthAndSafetyIssues) ||
							'No answer provided',
						lpaQuestionnaireData.healthAndSafetyDetails
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/safety-risks/change/lpa`,
							visuallyHiddenText: 'potential safety risks',
							attributes: { 'lpaQuestionnaireData-cy': 'change-health-and-safety' }
						})
					]
				},
				classes: 'lpa-health-and-safety'
			}
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
	mappedData.lpaq.otherAppeals = {
		id: 'other-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeals near the site'
				},
				value: {
					html:
						displayPageFormatter.formatListOfRelatedAppeals(appealDetails.otherAppeals || []) ||
						'No other appeals'
				},
				actions: {
					items: otherAppealsItems
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.newConditions = {
		id: 'extra-conditions',
		display: {
			summaryListItem: {
				key: {
					text: 'Extra conditions'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(lpaQuestionnaireData.hasExtraConditions) || '',
						lpaQuestionnaireData.extraConditions
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Extra conditions',
							href: `${currentRoute}/change-lpa-questionnaire/extra-conditions`
						})
					]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.additionalDocumentsContents = {
		id: 'additional-documents-contents',
		display: {
			...((isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
				? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
				: []
			).length > 0
				? {
						summaryListItems: (isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
							? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents || []
							: []
						).map((/** @type {DocumentInfo} */ document) => ({
							key: {
								text: 'Additional documents',
								classes: 'govuk-visually-hidden'
							},
							value: displayPageFormatter.formatDocumentValues(
								lpaQuestionnaireData.appealId,
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
	mappedData.lpaq.additionalDocuments = {
		id: 'additional-documents',
		display: {
			cardItem: {
				classes: 'pins-summary-list--fullwidth-value',
				card: {
					title: {
						text: 'Additional documents'
					},
					actions: {
						items:
							(isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence)
								? lpaQuestionnaireData.documents.lpaCaseCorrespondence.documents
								: []
							).length > 0
								? [
										mapActionComponent(permissionNames.updateCase, session, {
											text: 'Manage',
											visuallyHiddenText: 'additional documents',
											href: mapDocumentManageUrl(
												lpaQuestionnaireData.appealId,
												lpaQuestionnaireData.lpaQuestionnaireId,
												(isFolderInfo(lpaQuestionnaireData.documents.lpaCaseCorrespondence) &&
													lpaQuestionnaireData.documents.lpaCaseCorrespondence.folderId) ||
													undefined
											)
										}),
										mapActionComponent(permissionNames.updateCase, session, {
											text: 'Add',
											visuallyHiddenText: 'additional documents',
											href: displayPageFormatter.formatDocumentActionLink(
												lpaQuestionnaireData.appealId,
												lpaQuestionnaireData.documents.lpaCaseCorrespondence,
												buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
											)
										})
								  ]
								: [
										mapActionComponent(permissionNames.updateCase, session, {
											text: 'Add',
											visuallyHiddenText: 'additional documents',
											href: displayPageFormatter.formatDocumentActionLink(
												lpaQuestionnaireData.appealId,
												lpaQuestionnaireData.documents.lpaCaseCorrespondence,
												buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId)
											)
										})
								  ]
					}
				},
				rows: mappedData.lpaq.additionalDocumentsContents.display.summaryListItems
			}
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.reviewOutcome = {
		id: 'review-outcome',
		display: {
			summaryListItem: {
				key: {
					text: 'LPA Questionnaire review outcome'
				},
				value: {
					text: lpaQuestionnaireData.validation?.outcome || 'Not yet reviewed'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'LPA Questionnaire review outcome',
							href: `/appeals-service/appeal-details/${lpaQuestionnaireData.appealId}/lpa-questionnaire/${lpaQuestionnaireData.lpaQuestionnaireId}`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-review-outcome' }
						})
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
						name: 'review-outcome',
						value: lpaQuestionnaireData.validation?.outcome,
						items: [
							{
								value: 'complete',
								text: 'Complete'
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

/**
 * @param {string|number} lpaQuestionnaireId
 * @returns {string}
 */
export const buildDocumentUploadUrlTemplate = (lpaQuestionnaireId) => {
	return `/appeals-service/appeal-details/{{appealId}}/lpa-questionnaire/${lpaQuestionnaireId}/add-documents/{{folderId}}/{{documentId}}`;
};

/**
 *
 * @param {Number} caseId
 * @param {string|number} lpaQuestionnaireId
 * @param {number|undefined} folderId
 * @returns {string}
 */
export const mapDocumentManageUrl = (caseId, lpaQuestionnaireId, folderId) => {
	if (folderId === undefined) {
		return '';
	}
	return `/appeals-service/appeal-details/${caseId}/lpa-questionnaire/${lpaQuestionnaireId}/manage-documents/${folderId}/`;
};
