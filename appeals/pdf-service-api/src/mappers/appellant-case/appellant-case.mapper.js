import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { additionalDocumentsSection } from './sections/additional-documents.section.js';
import { appealDetailsSection } from './sections/appeal-details/index.js';
import { appellantDetailsSection } from './sections/appellant-details.section.js';
import { applicationDetailsSection } from './sections/application-details/index.js';
import { beforeYouStartSection } from './sections/before-you-start/index.js';
import { siteDetailsSection } from './sections/site-details/index.js';
import { uploadDocumentsSection } from './sections/upload-documents/index.js';

/**
 * @param {any} templateData
 */
export default function mapAppellantCaseData(templateData) {
	let mappedTemplateData = templateData;

	if (templateData && templateData.isS78Expedited && templateData.appealType === APPEAL_TYPE.S78) {
		mappedTemplateData = {
			...templateData,
			appealType: APPEAL_TYPE.S78_EXPEDITED
		};
	}

	const { appealSite, appealReference, localPlanningDepartment } = mappedTemplateData;
	const sections = [
		beforeYouStartSection(mappedTemplateData),
		appellantDetailsSection(mappedTemplateData),
		siteDetailsSection(mappedTemplateData),
		applicationDetailsSection(mappedTemplateData),
		appealDetailsSection(mappedTemplateData),
		uploadDocumentsSection(mappedTemplateData),
		mappedTemplateData.appealType !== APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE
			? additionalDocumentsSection(mappedTemplateData)
			: null
	].filter(Boolean);

	return {
		details: { appealSite, appealReference, localPlanningDepartment },
		sections
	};
}
