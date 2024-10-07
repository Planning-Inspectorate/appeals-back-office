import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapActionComponent, userHasPermission } from './permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { booleanSummaryListItem } from '#lib/mappers/components/boolean.js';
import { documentSummaryListItem } from '#lib/mappers/components/document.js';
import { textDisplayField } from '#lib/mappers/components/text.js';

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
			appealId: lpaQuestionnaireData.appealId,
			folderInfo,
			userHasEditPermission: userHasPermission(permissionNames.updateCase, session),
			uploadUrlTemplate: buildDocumentUploadUrlTemplate(lpaQuestionnaireData.lpaQuestionnaireId),
			manageUrl: mapDocumentManageUrl(
				lpaQuestionnaireData.appealId,
				lpaQuestionnaireData.lpaQuestionnaireId,
				folderInfo?.folderId
			),
			cypressDataName
		});
	};
	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);

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

	mappedData.lpaq.isCorrectAppealType = booleanSummaryListItem({
		id: 'is-correct-appeal-type',
		text: 'Correct appeal type',
		value: lpaQuestionnaireData.isCorrectAppealType,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-correct-appeal-type/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.lpaq.conservationAreaMap = documentInstruction({
		id: 'conservation-area-map',
		text: 'Conservation area map and guidance',
		folderInfo: lpaQuestionnaireData.documents.conservationMap,
		cypressDataName: 'conservation-area-map-and-guidance'
	});

	mappedData.lpaq.siteWithinGreenBelt = booleanSummaryListItem({
		id: 'site-within-green-belt',
		text: 'Green belt',
		value: lpaQuestionnaireData.isGreenBelt,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/green-belt/change/lpa`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.lpaq.notifyingParties = documentInstruction({
		id: 'notifying-parties',
		text: 'Who was notified',
		folderInfo: lpaQuestionnaireData.documents.whoNotified
	});

	mappedData.lpaq.siteNotice = documentInstruction({
		id: 'site-notice',
		text: 'Site notice',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedSiteNotice
	});

	mappedData.lpaq.lettersToNeighbours = documentInstruction({
		id: 'letters-to-neighbours',
		text: 'Letter or email notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours,
		cypressDataName: 'letter-or-email-notification'
	});

	mappedData.lpaq.pressAdvert = documentInstruction({
		id: 'press-advert',
		text: 'Press advert notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedPressAdvert,
		cypressDataName: 'press-advert-notification'
	});

	mappedData.lpaq.notificationMethods = textDisplayField({
		id: 'notification-methods',
		text: 'Notification methods',
		value: {
			html: displayPageFormatter.formatListOfNotificationMethodsToHtml(
				lpaQuestionnaireData.lpaNotificationMethods
			)
		},
		link: `${currentRoute}/notification-methods/change`,
		userHasEditPermission: userHasUpdateCase
	});

	mappedData.lpaq.representations = documentInstruction({
		id: 'representations-from-other-parties',
		text: 'Representations from other parties documents',
		folderInfo: lpaQuestionnaireData.documents.otherPartyRepresentations
	});

	mappedData.lpaq.officersReport = documentInstruction({
		id: 'officers-report',
		text: `Planning officer's report`,
		folderInfo: lpaQuestionnaireData.documents.planningOfficerReport
	});

	mappedData.lpaq.plansDrawings = documentInstruction({
		id: 'plans-drawings',
		text: `Plans, drawings and list of plans`,
		folderInfo: lpaQuestionnaireData.documents.plansDrawings
	});

	mappedData.lpaq.developmentPlanPolicies = documentInstruction({
		id: 'development-plan-policies',
		text: `Relevant policies from statutory development plan`,
		folderInfo: lpaQuestionnaireData.documents.developmentPlanPolicies
	});

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
						convertFromBooleanToYesNo(
							lpaQuestionnaireData.doesSiteRequireInspectorAccess,
							'No answer provided'
						),
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
						convertFromBooleanToYesNo(
							lpaQuestionnaireData.doesSiteHaveHealthAndSafetyIssues,
							'No answer provided'
						),
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
						convertFromBooleanToYesNo(lpaQuestionnaireData.hasExtraConditions, ''),
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
