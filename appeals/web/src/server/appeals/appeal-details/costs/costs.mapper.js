import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {Object} CostsDocumentType
 * @property {number} id
 * @property {string} name
 */

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {CostsDocumentType[]} documentTypes
 * @returns {PageContent}
 */
export function addDocumentTypePage(appealDetails, documentTypes) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the document type? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		heading: 'What is the document type?',
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'costs-document-type',
					id: 'costs-document-type',
					items: documentTypes.map((documentType) => ({
						value: documentType.id,
						text: documentType.name
					}))
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} costsApplicant
 * @param {string} folderId
 * @param {string} folderPath
 * @param {string} documentType
 * @param {import('@pins/express').ValidationErrors|undefined} errors
 * @returns {import('#appeals/appeal-documents/appeal-documents.types.js').DocumentUploadPageParameters}
 */
export function documentUploadPage(
	appealDetails,
	costsApplicant,
	folderId,
	folderPath,
	documentType,
	errors
) {
	const pathComponents = folderPath.split('/');
	const documentStage = pathComponents[0];

	let costsApplicantLabel = '';

	switch (costsApplicant) {
		case 'appellant':
			costsApplicantLabel = 'Appellant ';
			break;
		case 'lpa':
			costsApplicantLabel = 'LPA ';
			break;
	}

	const pageTitleText = `Upload ${costsApplicantLabel}costs document`;

	return {
		backButtonUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/${costsApplicant}/add`,
		appealId: `${appealDetails.appealId}`,
		folderId: folderId,
		useBlobEmulator: config.useBlobEmulator,
		blobStorageHost:
			config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
		blobStorageContainer: config.blobStorageDefaultContainer,
		multiple: false,
		documentStage: documentStage,
		pageTitle: pageTitleText,
		appealShortReference: appealShortReference(appealDetails.appealReference),
		pageHeadingText: pageTitleText,
		documentType: documentType,
		nextPageUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/${costsApplicant}/add-document-details/`,
		errors
	};
}
