import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

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

	const sessionData = session.linkableAppeal;

	const shortAppealReference = appealShortReference(currentAppeal.appealReference);

	const { leadAppeal: leadAppealRef, linkableAppealSummary } = sessionData;

	const linkCandidateHtml = `
		<span>${linkableAppealSummary.appealReference}${
		linkableAppealSummary.source === 'horizon' ? ' (Horizon)' : ''
	}</span>
		<br>
		<span>${linkableAppealSummary.appealType}</span>
	`;

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

	const leadAppealHtml = `
		<span>${leadAppeal.appealReference}${leadAppeal.source === 'horizon' ? ' (Horizon)' : ''}</span>
		<br>
		<span>${leadAppeal.appealType}</span>
	`;

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of the appeal you're linking to ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/linked-appeals/add/lead-appeal`,
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
								html: linkCandidateHtml
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
						{
							key: {
								text: 'Which is the lead appeal?'
							},
							value: {
								html: leadAppealHtml
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
	 * */
	const radioItem = (appealReference, appealType) => ({
		value: appealReference,
		html: `
			<span>${appealReference}</span>
			<br>
			<span class="govuk-caption-m">${appealType}</span>
		`
	});

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
					radioItem(appealData.appealReference, appealData.appealType),
					radioItem(linkCandidateSummary.appealReference, linkCandidateSummary.appealType)
				],
				errorMessage
			})
		]
	};

	return pageContent;
}
