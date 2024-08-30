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
				value: lpaQuestionnaireData.listedBuildingDetails?.length
					? {
							html: displayPageFormatter.formatListOfListedBuildingNumbers(
								lpaQuestionnaireData.listedBuildingDetails || []
							)
					  }
					: {
							text: 'No affected listed buildings'
					  },
				actions: {
					items: [
						...(lpaQuestionnaireData.listedBuildingDetails &&
						lpaQuestionnaireData.listedBuildingDetails.length > 0
							? [
									mapActionComponent(permissionNames.updateCase, session, {
										text: 'Manage',
										href: `${currentRoute}/affected-listed-buildings/manage`,
										visuallyHiddenText: 'Affected listed building',
										attributes: { 'lpaQuestionnaireData-cy': 'manage-affected-listed-building' }
									})
							  ]
							: []),
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Add',
							visuallyHiddenText: 'Affected listed building',
							href: `${currentRoute}/affected-listed-buildings/add`,
							attributes: { 'lpaQuestionnaireData-cy': 'add-affected-listed-building' }
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
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Conservation area map and guidance',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.conservationMap,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.conservationMap)
						? lpaQuestionnaireData.documents.conservationMap.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'conservation-area-map-and-guidance'
			)
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
					text: convertFromBooleanToYesNo(lpaQuestionnaireData.isGreenBelt) || ''
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'Green belt',
							href: `${currentRoute}/green-belt/change/lpa`,
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
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Who was notified',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.whoNotified,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.whoNotified)
						? lpaQuestionnaireData.documents.whoNotified.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'notifying-parties'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.siteNotice = {
		id: 'site-notice',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Site notice',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.whoNotifiedSiteNotice,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.whoNotifiedSiteNotice)
						? lpaQuestionnaireData.documents.whoNotifiedSiteNotice.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'site-notice'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.lettersToNeighbours = {
		id: 'letters-to-neighbours',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Letter or email notification',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours)
						? lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'letter-or-email-notification'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.pressAdvert = {
		id: 'press-advert',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Press advert notification',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.whoNotifiedPressAdvert,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.whoNotifiedPressAdvert)
						? lpaQuestionnaireData.documents.whoNotifiedPressAdvert.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'press-advert-notification'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.notificationMethods = {
		id: 'notification-methods',
		display: {
			summaryListItem: {
				key: {
					text: 'Notification methods'
				},
				value: {
					html: displayPageFormatter.formatListOfNotificationMethodsToHtml(
						lpaQuestionnaireData.lpaNotificationMethods
					)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: 'notification methods',
							href: `${currentRoute}/notification-methods/change`,
							attributes: { 'lpaQuestionnaireData-cy': 'change-notification-methods' }
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
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				'Representations from other parties documents',
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.otherPartyRepresentations,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.otherPartyRepresentations)
						? lpaQuestionnaireData.documents.otherPartyRepresentations.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'representations-from-other-parties'
			)
		}
	};

	/** @type {Instructions} */
	mappedData.lpaq.officersReport = {
		id: 'officers-report',
		display: {
			summaryListItem: displayPageFormatter.formatFolderSummaryListItem(
				"Planning officer's report",
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.documents.planningOfficerReport,
				permissionNames.updateCase,
				session,
				mapDocumentManageUrl(
					lpaQuestionnaireData.appealId,
					lpaQuestionnaireData.lpaQuestionnaireId,
					isFolderInfo(lpaQuestionnaireData.documents.planningOfficerReport)
						? lpaQuestionnaireData.documents.planningOfficerReport.folderId
						: undefined
				),
				buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
				'officers-report'
			)
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
	mappedData.lpaq.extraConditions = {
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
							href: `${currentRoute}/extra-conditions/change`
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
