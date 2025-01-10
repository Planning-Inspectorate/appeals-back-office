import { appealSiteToMultilineAddressStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { buildNotificationBanners } from '#lib/mappers/index.js';
import { addressInputs } from '#lib/mappers/index.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {{ address: import("@pins/appeals.api/src/server/endpoints/appeals.js").AppealSite; siteId: number; }} NeighbouringSitesItem
 * @typedef {'lpa'|'back-office'} Source
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.AppealSite} currentAddress
 * @param {Source} source
 * @param {string} origin
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function addNeighbouringSitePage(appealData, source, origin, currentAddress, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Add neighbouring site',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Add neighbouring site ${getFormattedSource(source)}`,
		pageComponents: addressInputs({ address: currentAddress, errors })
	};

	return pageContent;
}
/**
 *
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSiteData
 * @param {Source} source
 * @param {string} origin
 * @returns {PageContent}
 */
export function addNeighbouringSiteCheckAndConfirmPage(
	appealData,
	source,
	origin,
	neighbouringSiteData
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of neighbouring site you're adding to ${shortAppealReference}`,
		backLinkUrl: `${origin}/neighbouring-sites/add/${source}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check your answers',
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Address'
							},
							value: {
								html: `${appealSiteToMultilineAddressStringHtml(neighbouringSiteData)}`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `${origin}/neighbouring-sites/add/${source}`,
										visuallyHidden: 'address'
									}
								]
							}
						}
					]
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function manageNeighbouringSitesPage(request, appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const notificationBanners = buildNotificationBanners(
		request.session,
		'manageNeighbouringSites',
		request.currentAppeal.appealId
	);

	const lpaNeighbouringSitesInspectorRows = appealData.neighbouringSites
		?.filter((site) => site.source === 'lpa')
		.map((site) => neighbouringSiteTableRowFormatter(site));

	const backOfficeNeighbouringSitesInspectorRows = appealData.neighbouringSites
		?.filter((site) => site.source === 'back-office')
		.map((site) => neighbouringSiteTableRowFormatter(site));

	/**@type {PageContent} */
	const pageContent = {
		title: `Manage neighbouring sites`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Manage neighbouring sites',
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			...notificationBanners,
			{
				type: 'table',
				parameters: {
					caption: 'Neighbouring sites (LPAQ)',
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [{ text: 'Address' }, { text: 'Action', classes: 'govuk-!-text-align-right' }],
					rows: lpaNeighbouringSitesInspectorRows
				}
			},
			{
				type: 'table',
				parameters: {
					caption: 'Neighbouring sites (inspector and/or third party request)',
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [
						{ text: 'Address' },
						{ text: 'Action', classes: 'govuk-!-width-one-quarter govuk-!-text-align-right' }
					],
					rows: backOfficeNeighbouringSitesInspectorRows
				}
			}
		]
	};
	return pageContent;
}

/**
 * @param {NeighbouringSitesItem} site
 */
function getNeighbouringSiteActions(site) {
	return [
		{
			text: 'Change',
			href: `change/site/${site.siteId}`,
			visuallyHiddenText: 'address'
		},
		{
			text: 'Remove',
			href: `remove/site/${site.siteId}`,
			visuallyHiddenText: 'address'
		}
	];
}

/**
 * @param {NeighbouringSitesItem} site
 */
function neighbouringSiteTableRowFormatter(site) {
	const actions = getNeighbouringSiteActions(site);

	return [
		{
			html: `${appealSiteToMultilineAddressStringHtml(site.address)}`
		},
		{
			html: `<ul class="govuk-summary-list__actions-list">
				${actions
					.map(
						(action) => `
					<li class="govuk-summary-list__actions-list-item">
						<a href="${action.href}" class="govuk-link">
							${action.text}<span class="govuk-visually-hidden"> ${action.visuallyHiddenText}</span>
						</a>
					</li>
				`
					)
					.join('')}
			</ul>`,
			classes: 'govuk-!-text-align-right'
		}
	];
}

/**
 * @param {Appeal} appealData
 * @param {string} siteId
 * @param {string} origin
 * @returns {PageContent}
 */
export function removeNeighbouringSitePage(appealData, origin, siteId) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let siteAddress;
	if (
		appealData.neighbouringSites &&
		appealData.neighbouringSites.findIndex((site) => site.siteId.toString() === siteId) > -1
	) {
		siteAddress =
			appealData.neighbouringSites[
				appealData.neighbouringSites.findIndex((site) => site.siteId.toString() === siteId)
			].address;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Remove neighbouring site`,
		backLinkUrl: `${origin}/neighbouring-sites/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Remove neighbouring site',
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-summary-list--no-border',
					rows: [
						{
							key: {
								text: 'Address'
							},
							value: {
								html: `${appealSiteToMultilineAddressStringHtml(siteAddress)}`
							}
						}
					]
				}
			},
			yesNoInput({
				name: 'remove-neighbouring-site',
				legendText: 'Do you want to remove this site?'
			})
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSiteData
 * @param {string} siteId
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeNeighbouringSitePage(appealData, neighbouringSiteData, siteId, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let address;
	if (appealData.neighbouringSites) {
		address = appealData.neighbouringSites.find(
			(site) => site.siteId.toString() === siteId
		)?.address;
	}

	if (neighbouringSiteData) {
		address = neighbouringSiteData;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change neighbouring site address`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/neighbouring-sites/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change neighbouring site address',
		headingClasses: 'govuk-heading-l',
		pageComponents: addressInputs({ address, errors })
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSiteData
 * @param {string} siteId
 * @returns {PageContent}
 */
export function changeNeighbouringSiteCheckAndConfirmPage(
	appealData,
	neighbouringSiteData,
	siteId
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of neighbouring site you're updating for ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/neighbouring-sites/change/site/${siteId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check your answers',
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Address'
							},
							value: {
								html: `${appealSiteToMultilineAddressStringHtml(neighbouringSiteData)}`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/neighbouring-sites/change/site/${siteId}`,
										visuallyHidden: 'address'
									}
								]
							}
						}
					]
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {string} origin
 * @returns {PageContent}
 */
export function changeNeighbouringSiteAffectedPage(appealData, origin) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Update neighbouring site affected',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'neighbouringSiteAffected',
				value: appealData.isAffectingNeighbouringSites,
				legendText: 'Could a neighbouring site be affected?',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
}

/**
 *
 * @param {Source} source
 * @returns
 */
function getFormattedSource(source) {
	const formattedSource = {
		lpa: '(LPA)',
		'back-office': '(Inspector/third party)'
	};

	return formattedSource[source];
}
