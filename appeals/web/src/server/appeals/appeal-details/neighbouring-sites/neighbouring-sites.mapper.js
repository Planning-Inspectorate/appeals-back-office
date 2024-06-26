import { appealSiteToMultilineAddressStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	errorAddressLine1,
	errorPostcode,
	errorTown
} from '#lib/error-handlers/change-screen-error-handlers.js';

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
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'address-line-1',
					name: 'addressLine1',
					type: 'text',
					label: {
						isPageHeading: false,
						text: 'Address line 1'
					},
					value: currentAddress?.addressLine1 ?? '',
					errorMessage: errorAddressLine1(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-line-2',
					name: 'addressLine2',
					type: 'text',
					label: {
						isPageHeading: false,
						text: 'Address line 2 (optional)'
					},
					value: currentAddress?.addressLine2 ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-town',
					name: 'town',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'Town or city'
					},
					value: currentAddress?.town ?? '',
					errorMessage: errorTown(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-county',
					name: 'county',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'County (optional)'
					},
					value: currentAddress?.county ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-postcode',
					name: 'postCode',
					type: 'text',
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: false,
						text: 'Postcode'
					},
					value: currentAddress?.postCode ?? '',
					errorMessage: errorPostcode(errors)
				}
			}
		]
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
										visuallyHidden: 'Address'
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
 *
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function manageNeighbouringSitesPage(appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

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
			{
				type: 'table',
				parameters: {
					caption: 'Neighbouring sites (LPAQ)',
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [{ text: 'Address' }, { text: 'Action', classes: 'govuk-!-width-one-quarter' }],
					rows: lpaNeighbouringSitesInspectorRows
				}
			},
			{
				type: 'table',
				parameters: {
					caption: 'Neighbouring sites (inspector and/or third party request)',
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [{ text: 'Address' }, { text: 'Action', classes: 'govuk-!-width-one-quarter' }],
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
function neighbouringSiteTableRowFormatter(site) {
	return [
		{
			html: `${appealSiteToMultilineAddressStringHtml(site.address)}`
		},
		{
			html: `<a href="change/site/${site.siteId}" class="govuk-link" >Change</a> | <a href="remove/site/${site.siteId}" class="govuk-link">Remove</a>`
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
			{
				type: 'radios',
				parameters: {
					name: 'remove-neighbouring-site',
					fieldset: {
						legend: {
							text: 'Do you want to remove this site?',
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--m'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes'
						},
						{
							value: 'no',
							text: 'No'
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
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSiteData
 * @param {string} siteId
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeNeighbouringSitePage(appealData, neighbouringSiteData, siteId, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let siteAddress;
	if (appealData.neighbouringSites) {
		siteAddress =
			appealData.neighbouringSites[
				appealData.neighbouringSites.findIndex((site) => site.siteId.toString() === siteId)
			].address;
	}

	if (neighbouringSiteData) {
		siteAddress = neighbouringSiteData;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change neighbouring site address`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/neighbouring-sites/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change neighbouring site address',
		headingClasses: 'govuk-heading-l',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'address-line-1',
					name: 'addressLine1',
					type: 'text',
					label: {
						isPageHeading: false,
						text: 'Address line 1'
					},
					value: siteAddress?.addressLine1 ?? '',
					errorMessage: errorAddressLine1(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-line-2',
					name: 'addressLine2',
					type: 'text',
					label: {
						isPageHeading: false,
						text: 'Address line 2 (optional)'
					},
					value: siteAddress?.addressLine2 ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-town',
					name: 'town',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'Town or city'
					},
					value: siteAddress?.town ?? '',
					errorMessage: errorTown(errors)
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-county',
					name: 'county',
					type: 'text',
					classes: 'govuk-input govuk-input--width-20',
					label: {
						isPageHeading: false,
						text: 'County (optional)'
					},
					value: siteAddress?.county ?? ''
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'address-postcode',
					name: 'postCode',
					type: 'text',
					classes: 'govuk-input govuk-input--width-10',
					label: {
						isPageHeading: false,
						text: 'Postcode'
					},
					value: siteAddress?.postCode ?? '',
					errorMessage: errorPostcode(errors)
				}
			}
		]
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
										visuallyHidden: 'Address'
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
		heading: 'Could a neighbouring site be affected?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'neighbouringSiteAffected',
					id: 'neighbouring-site-affected',
					items: [
						{
							text: 'Yes',
							value: 'yes',
							checked: appealData.neighbouringSites?.length > 0
						},
						{
							text: 'No',
							value: 'no',
							checked: !appealData.neighbouringSites || appealData.neighbouringSites.length == 0
						}
					]
				}
			}
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
