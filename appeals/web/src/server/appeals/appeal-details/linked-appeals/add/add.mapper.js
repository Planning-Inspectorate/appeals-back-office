import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { appealStatusToStatusText } from '#lib/nunjucks-filters/status-tag.js';

/** @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal */

/**
 * @param {Appeal} appealData
 * @param {{ appealReference: string }} [sessionData]
 * @param {string} [backLinkUrl]
 * @param {string} [errorMsg]
 * @returns {PageContent}
 */
export function addLinkedAppealPage(appealData, sessionData, backLinkUrl, errorMsg) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Add linked appeal - ${shortAppealReference}`,
		backLinkUrl: backLinkUrl || `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - add linked appeal`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'appeal-reference',
					name: 'appeal-reference',
					type: 'text',
					value: sessionData?.appealReference,
					errorMessage: errorMsg
						? {
								text: errorMsg
						  }
						: undefined,
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: true,
						text: 'Appeal reference',
						classes: 'govuk-label--l'
					}
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageContent}
 */
export function addLinkedAppealCheckAndConfirmPage(request) {
	const { currentAppeal, session } = request;
	const backUrl = getBackLinkUrlFromQuery(request);

	const sessionData = session.linkableAppeal;

	const shortAppealReference = appealShortReference(currentAppeal.appealReference);

	const { leadAppeal: leadAppealRef, linkableAppealSummary } = sessionData;

	const linkCandidateSource = linkableAppealSummary.source === 'horizon' ? ' (Horizon)' : '';
	const linkCandidate = [
		`<span>${linkableAppealSummary.appealReference}${linkCandidateSource}</span>`
	];
	if (linkableAppealSummary.siteAddress?.addressLine1) {
		linkCandidate.push(
			`<span class="govuk-hint">${linkableAppealSummary.siteAddress.addressLine1}</span>`
		);
	}
	if (linkableAppealSummary.appealType) {
		linkCandidate.push(`<span class="govuk-hint">${linkableAppealSummary.appealType}</span>`);
	}

	const [leadAppeal, childAppeal] = (() => {
		switch (leadAppealRef) {
			case currentAppeal.appealReference:
				return [currentAppeal, linkableAppealSummary];
			case linkableAppealSummary.appealReference:
				return [linkableAppealSummary, currentAppeal];
			default:
				throw new Error(
					`Appeal reference ${sessionData.leadAppeal} is not correlated with either member of the linked appeal`
				);
		}
	})();

	const leadAppealSource = leadAppeal.source === 'horizon' ? ' (Horizon)' : '';
	const leadAppealLines = [`<span>${leadAppeal.appealReference}${leadAppealSource}</span>`];
	const { addressLine1: leadAppealAddressLine1 } =
		leadAppeal.siteAddress || leadAppeal.appealSite || {};
	if (leadAppealAddressLine1) {
		leadAppealLines.push(`<span class="govuk-hint">${leadAppealAddressLine1}</span>`);
	}
	if (leadAppeal.appealType) {
		leadAppealLines.push(`<span class="govuk-hint">${leadAppeal.appealType}</span>`);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of the appeal you're linking to ${shortAppealReference}`,
		backLinkUrl:
			backUrl ||
			`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/add/lead-appeal`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check details and add linked appeal',
		submitButtonProperties: {
			text: 'Add linked appeal'
		},
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-5',
					rows: [
						{
							key: {
								text: 'Appeal reference'
							},
							value: {
								html: linkCandidate.join('\n<br>\n')
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: addBackLinkQueryToUrl(
											request,
											`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/add`
										)
									}
								]
							}
						},
						...(session.linkableAppeal.confirmOnlyLeadAppeal
							? []
							: [
									{
										key: {
											text: 'Which is the lead appeal?'
										},
										value: {
											html: leadAppealLines.join('\n<br>\n')
										},
										actions: {
											items: [
												{
													text: 'Change',
													href: addBackLinkQueryToUrl(
														request,
														`/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/add/lead-appeal`
													)
												}
											]
										}
									}
							  ])
					]
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body">${leadAppeal.appealReference} will be the lead appeal of ${childAppeal.appealReference}</p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @returns {PageContent}
 * */
export function alreadyLinkedPage(appealData, linkCandidateSummary) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const title = `You have already linked appeal ${linkCandidateSummary.appealReference}`;

	/** @type {PageContent} */
	const pageContent = {
		title,
		heading: title,
		preHeading: `Appeal ${shortAppealReference}`,
		submitButtonProperties: {
			text: 'Add a different linked appeal'
		}
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @returns {PageContent}
 * */
export function invalidCaseStatusPage(appealData, linkCandidateSummary) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const title = `You cannot link appeal ${linkCandidateSummary.appealReference}`;

	const linkableCaseStatuses = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION,
		APPEAL_CASE_STATUS.READY_TO_START,
		APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	];

	/** @type {PageContent} */
	const pageContent = {
		title,
		heading: title,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: [
						'<p class="govuk-body">This is because you can only link an appeal when the status is:</p>',
						'<ul class="govuk-list govuk-list--bullet">',
						...linkableCaseStatuses.map((status) => `<li>${appealStatusToStatusText(status)}</li>`),
						'</ul>'
					].join('\n')
				}
			}
		],
		submitButtonProperties: {
			text: 'Add a different linked appeal'
		}
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.LinkableAppealSummary} linkCandidateSummary
 * @param {string} [leadAppeal]
 * @param {string} [backUrl]
 * @param {string} [errorMessage]
 * @returns {PageContent}
 * */
export function changeLeadAppealPage(
	appealData,
	linkCandidateSummary,
	leadAppeal,
	backUrl,
	errorMessage
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const title = 'Which is the lead appeal?';

	/**
	 * @param {string | undefined | null} appealReference
	 * @param {string | undefined | null} appealType
	 * @param {string | undefined | null} appealSiteAddress
	 * */
	const radioItem = (appealReference, appealType, appealSiteAddress) => {
		const content = [`<span>${appealReference}</span>`];
		if (appealSiteAddress) {
			content.push(`<span class="govuk-hint">${appealSiteAddress}</span>`);
		}
		if (appealType) {
			content.push(`<span class="govuk-hint">${appealType}</span>`);
		}
		return {
			value: appealReference,
			html: content.join('\n<br>')
		};
	};

	const pageContent = {
		title,
		preHeading: `Appeal ${shortAppealReference} - add linked appeal`,
		backLinkUrl:
			backUrl || `/appeals-service/appeal-details/${appealData.appealId}/linked-appeals/add`,
		pageComponents: [
			radiosInput({
				name: 'lead-appeal',
				legendText: title,
				legendIsPageHeading: true,
				value: leadAppeal,
				items: [
					radioItem(
						appealData.appealReference,
						appealData.appealType,
						appealData.appealSite && appealData.appealSite.addressLine1
					),
					radioItem(
						linkCandidateSummary.appealReference,
						linkCandidateSummary.appealType,
						linkCandidateSummary.siteAddress && linkCandidateSummary.siteAddress.addressLine1
					)
				],
				errorMessage
			})
		]
	};

	return pageContent;
}
