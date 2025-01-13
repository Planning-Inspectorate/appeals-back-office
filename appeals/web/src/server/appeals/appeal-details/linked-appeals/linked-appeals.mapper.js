import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealShortReference, linkedAppealStatus } from '#lib/appeals-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { appealStatusToStatusTag } from '#lib/nunjucks-filters/status-tag.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { generateHorizonAppealUrl } from '#lib/display-page-formatter.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.NotValidReasonOption} NotValidReasonOption
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 */

/**
 *
 * @param {Appeal} appealData
 * @param {string} appealId
 * @param {import('@pins/appeals.api/src/server/endpoints/appeals.js').LinkedAppeal} [leadLinkedAppeal]
 * @param {Appeal} [leadAppealData]
 * @returns {PageContent}
 */
export function manageLinkedAppealsPage(appealData, appealId, leadLinkedAppeal, leadAppealData) {
	const isChildAppeal = appealData.isChildAppeal === true;
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const isChildOfHorizonAppeal = isChildAppeal && leadLinkedAppeal?.externalSource;

	/** @type {PageComponent[]} **/
	const pageComponents = [];

	/** @type {PageComponent} */
	const appealStatusTagComponent = {
		type: 'status-tag',
		wrapperHtml: {
			opening: '<div class="govuk-!-margin-bottom-2">',
			closing: '</div>'
		},
		parameters: {
			status: linkedAppealStatus(!isChildAppeal, isChildAppeal)
		}
	};
	pageComponents.push(appealStatusTagComponent);

	if (isChildAppeal) {
		/** @type {PageComponent} */
		const leadAppealTable = {
			wrapperHtml: {
				opening: `<h2 class="govuk-!-margin-top-6">Lead appeal of ${shortAppealReference}</h2>`,
				closing: ''
			},
			type: 'table',
			parameters: {
				head: [
					{ text: 'Appeal Ref' },
					{ text: 'Appeal type' },
					{ text: 'Action', classes: 'govuk-!-text-align-right' }
				],
				firstCellIsHeader: false,
				rows: [
					[
						{
							html: isChildOfHorizonAppeal
								? `<a class="govuk-link" href="${generateHorizonAppealUrl(
										leadLinkedAppeal?.appealId
								  )}">${leadLinkedAppeal?.appealReference}</a>`
								: `<a class="govuk-link" href="/appeals-service/appeal-details/${
										leadLinkedAppeal?.appealId
								  }" aria-label="Appeal ${numberToAccessibleDigitLabel(
										appealShortReference(leadLinkedAppeal?.appealReference) || ''
								  )}">${appealShortReference(leadLinkedAppeal?.appealReference)}</a>`
						},
						{
							text:
								(isChildOfHorizonAppeal
									? leadLinkedAppeal.externalAppealType
									: leadLinkedAppeal?.appealType) || 'Unknown'
						},
						{
							html: (() => {
								const unlinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/unlink-appeal/${appealId}/${leadLinkedAppeal?.relationshipId}/${appealId}`;
								const leadAppealRef = appealShortReference(leadLinkedAppeal?.appealReference) || '';
								const hiddenText = `appeal ${numberToAccessibleDigitLabel(leadAppealRef)}`;

								return `<a class="govuk-link" href="${unlinkUrl}">Unlink<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
							})(),
							classes: 'govuk-!-text-align-right'
						}
					]
				]
			}
		};
		pageComponents.push(leadAppealTable);
	}

	const sourceOfLinkedChildAppeals = isChildAppeal
		? leadAppealData?.linkedAppeals
		: appealData.linkedAppeals;
	const childAppealsRows = sourceOfLinkedChildAppeals
		? sourceOfLinkedChildAppeals
				.filter(
					(linkedAppeal) =>
						!linkedAppeal.isParentAppeal && linkedAppeal.appealId !== Number(appealId)
				)
				.map((linkedAppeal) => {
					return [
						{
							html: linkedAppeal.externalSource
								? `<a class="govuk-link" href="${generateHorizonAppealUrl(
										linkedAppeal?.appealId
								  )}" data-cy="${linkedAppeal?.appealReference}"
								  >${linkedAppeal?.appealReference}</a>`
								: `<a class="govuk-link" href="/appeals-service/appeal-details/${
										linkedAppeal?.appealId
								  }" aria-label="Appeal ${numberToAccessibleDigitLabel(
										appealShortReference(linkedAppeal?.appealReference) || ''
								  )}" data-cy="${linkedAppeal?.appealReference}"
								  >${appealShortReference(linkedAppeal?.appealReference)}</a>`
						},
						{
							text:
								(linkedAppeal.externalSource
									? linkedAppeal.externalAppealType
									: linkedAppeal.appealType) || 'Unknown'
						},
						{
							html: (() => {
								const unlinkUrl = `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/unlink-appeal/${linkedAppeal.appealId}/${linkedAppeal.relationshipId}/${appealId}`;
								const childAppealRef = appealShortReference(linkedAppeal?.appealReference) || '';
								const hiddenText = `appeal ${numberToAccessibleDigitLabel(childAppealRef)}`;

								return `<a class="govuk-link" data-cy="unlink-appeal-${appealData.appealReference}" href="${unlinkUrl}">Unlink<span class="govuk-visually-hidden"> ${hiddenText}</span></a>`;
							})()
						}
					];
				})
		: [];

	const childAppealsHeading = isChildAppeal
		? `Other child appeals of ${appealShortReference(leadAppealData?.appealReference)}`
		: `Child appeals of ${shortAppealReference}`;

	/** @type {PageComponent} */
	const childAppealsTable = {
		wrapperHtml: {
			opening: `<h2 class="govuk-!-margin-top-6">${childAppealsHeading}</h2>`,
			closing: ''
		},
		type: 'table',
		parameters: {
			head: [{ text: 'Appeal Ref' }, { text: 'Appeal type' }, { text: 'Action' }],
			firstCellIsHeader: false,
			rows: childAppealsRows
		}
	};

	if (childAppealsRows.length > 0) {
		pageComponents.push(childAppealsTable);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Manage linked appeals - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Manage linked appeals',
		pageComponents
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function addLinkedAppealPage(appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Add linked appeal - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'appeal-reference',
					name: 'appeal-reference',
					type: 'text',
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: true,
						text: 'What is the appeal reference?',
						classes: 'govuk-label--l'
					}
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @param {Appeal|undefined} linkCandidateAppealData
 * @returns {PageContent}
 */
export function addLinkedAppealCheckAndConfirmPage(
	appealData,
	linkCandidateSummary,
	linkCandidateAppealData
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of the appeal you're linking to ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Details of the appeal you're linking to`,
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Appeal reference'
							},
							value: {
								text: `${linkCandidateSummary.appealReference}${
									linkCandidateSummary.source === 'horizon' ? ' (Horizon)' : ''
								}`
							}
						},
						{
							key: {
								text: 'Appeal status'
							},
							value: {
								text: appealStatusToStatusTag(linkCandidateSummary.appealStatus)
							}
						},
						{
							key: {
								text: 'Appeal type'
							},
							value: {
								text: linkCandidateSummary.appealType
							}
						},
						{
							key: {
								text: 'Site address'
							},
							value: {
								text: appealSiteToAddressString(linkCandidateSummary.siteAddress)
							}
						},
						{
							key: {
								text: 'Local planning authority (LPA)'
							},
							value: {
								text: linkCandidateSummary.localPlanningDepartment
							}
						},
						{
							key: {
								text: 'Appellant name'
							},
							value: {
								text: linkCandidateSummary.appellantName
							}
						},
						{
							key: {
								text: 'Agent name'
							},
							value: {
								text: linkCandidateSummary.agentName
							}
						},
						{
							key: {
								text: 'Submission date'
							},
							value: {
								text: dateISOStringToDisplayDate(linkCandidateSummary.submissionDate)
							}
						}
					]
				}
			}
		]
	};

	const candidateIsLead = linkCandidateAppealData && linkCandidateAppealData.isParentAppeal;
	const candidateIsChild = linkCandidateAppealData && linkCandidateAppealData.isChildAppeal;

	// candidate and target are the same appeal
	if (appealData.appealReference === linkCandidateAppealData?.appealReference) {
		pageContent.pageComponents?.unshift({
			type: 'warning-text',
			parameters: {
				text: 'This is the appeal you are currently reviewing.'
			}
		});
		pageContent.submitButtonProperties = {
			text: 'Return to search',
			href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
		};
	}
	// candidate is already linked to target
	else if (
		appealData.linkedAppeals.filter(
			(linkedAppeal) => linkedAppeal.appealReference === linkCandidateSummary.appealReference
		).length > 0
	) {
		pageContent.pageComponents?.unshift({
			type: 'warning-text',
			parameters: {
				text: 'Appeals already linked.'
			}
		});
		pageContent.submitButtonProperties = {
			text: 'Return to search',
			href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
		};
	}
	// target has no linked appeals
	else if (appealData.linkedAppeals.length === 0) {
		// candidate has no linked appeals
		if (!linkCandidateAppealData || linkCandidateAppealData?.linkedAppeals.length === 0) {
			pageContent.pageComponents?.push({
				type: 'radios',
				parameters: {
					name: 'confirmation',
					idPrefix: 'confirmation',
					fieldset: {
						legend: {
							text: 'Is this the appeal you want to link?',
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: [
						{
							value: 'lead',
							text: `Yes, make this the lead appeal for ${shortAppealReference}`
						},
						{
							value: 'child',
							text: `Yes, this is a child appeal of ${shortAppealReference}`
						},
						{
							divider: 'or'
						},
						{
							value: 'cancel',
							text: 'No, return to search'
						}
					]
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Continue',
				type: 'submit'
			};
		}
		// candidate is a lead
		else if (candidateIsLead) {
			pageContent.pageComponents?.push({
				type: 'radios',
				parameters: {
					name: 'confirmation',
					idPrefix: 'confirmation',
					fieldset: {
						legend: {
							text: 'Is this the appeal you want to link?',
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: [
						{
							value: 'lead',
							text: `Yes, make this the lead appeal for ${shortAppealReference}`
						},
						{
							divider: 'or'
						},
						{
							value: 'cancel',
							text: 'No, return to search'
						}
					]
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Continue',
				type: 'submit'
			};
		}
		// candidate is a child
		else if (candidateIsChild) {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: 'Link your case to the lead of this appeal.'
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Return to search',
				href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
			};
		}
	}
	// target is a lead
	else if (appealData.isParentAppeal) {
		// candidate has no linked appeals
		if (!linkCandidateAppealData || linkCandidateAppealData.linkedAppeals.length === 0) {
			pageContent.pageComponents?.push({
				type: 'radios',
				parameters: {
					name: 'confirmation',
					idPrefix: 'confirmation',
					fieldset: {
						legend: {
							text: 'Is this the appeal you want to link?',
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: [
						{
							value: 'child',
							text: `Yes, this is a child appeal of ${shortAppealReference}`
						},
						{
							divider: 'or'
						},
						{
							value: 'cancel',
							text: `No, return to search`
						}
					]
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Continue',
				type: 'submit'
			};
		}
		// candidate is a lead
		else if (candidateIsLead) {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: 'Appeals are both lead appeals and cannot be linked.'
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Return to search',
				href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
			};
		}
		// candidate is a child (of another appeal, because "candidate is already linked to target" scenario has already been ruled out by prior check)
		else {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: 'Appeal already linked to another lead appeal. Cannot be linked.'
				}
			});
			pageContent.submitButtonProperties = {
				text: 'Return to search',
				href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
			};
		}
	}
	// target is a child
	else if (appealData.isChildAppeal) {
		// candidate has no linked appeals
		if (!linkCandidateAppealData || linkCandidateAppealData.linkedAppeals.length === 0) {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: `Link this appeal to your case's lead appeal.`
				}
			});
		}
		// candidate is a lead (of another appeal, because "candidate is already linked to target" scenario has already been ruled out by prior check)
		else if (candidateIsLead) {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: 'Appeal already a lead appeal. Cannot be linked.'
				}
			});
			// candidate is a child (of another appeal, because "candidate is already linked to target" scenario has already been ruled out by prior check)
		} else {
			pageContent.pageComponents?.unshift({
				type: 'warning-text',
				parameters: {
					text: 'Appeal already linked to another lead appeal. Cannot be linked.'
				}
			});
		}

		pageContent.submitButtonProperties = {
			text: 'Return to search',
			href: `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`
		};
	}

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} childRef
 * @param {string} appealId
 * @param {string} relationshipId
 * @param {string} backLinkAppealId
 * @returns {PageContent}
 */
export function unlinkAppealPage(appealData, childRef, appealId, relationshipId, backLinkAppealId) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const shortChildAppealReference = appealShortReference(childRef);
	const titleAndHeading = `Do you want to unlink the appeal ${shortChildAppealReference} from appeal ${shortAppealReference}?`;

	/** @type {PageComponent} */
	const selectAppealTypeRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'unlinkAppeal',
			idPrefix: 'unlink-appeal',
			fieldset: {
				legend: {
					text: titleAndHeading,
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					text: 'Yes',
					value: 'yes'
				},
				{
					text: 'No',
					value: 'no'
				}
			]
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: titleAndHeading,
		backLinkUrl: generateUnlinkAppealBackLinkUrl(appealId, relationshipId, backLinkAppealId),
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectAppealTypeRadiosComponent]
	};

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} relationshipId
 * @param {string} backLinkAppealId
 * @returns {string}
 */
export function generateUnlinkAppealBackLinkUrl(appealId, relationshipId, backLinkAppealId) {
	return appealId === backLinkAppealId
		? `/appeals-service/appeal-details/${backLinkAppealId}/linked-appeals/manage`
		: `/appeals-service/appeal-details/${backLinkAppealId}/linked-appeals/manage/${relationshipId}/${appealId}`;
}
