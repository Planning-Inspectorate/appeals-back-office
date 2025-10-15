import { additionalDocumentsSection } from './sections/additional-documents.section.js';
import { appealDetailsSection } from './sections/appeal-details.section.js';
import { appellantDetailsSection } from './sections/appellant-details.section.js';
import { applicationDetailsSection } from './sections/application-details.section.js';
import { beforeYouStartSection } from './sections/before-you-start.section.js';
import { siteDetailsSection } from './sections/site-details.section.js';
import { uploadDocumentsSection } from './sections/upload-documents.section.js';

export default function mapAppellantCaseData(templateData) {
	const { appealSite, appealReference, localPlanningDepartment } = templateData;
	return {
		details: { appealSite, appealReference, localPlanningDepartment },
		sections: [
			beforeYouStartSection(templateData),
			appellantDetailsSection(templateData),
			siteDetailsSection(templateData),
			applicationDetailsSection(templateData),
			appealDetailsSection(templateData),
			uploadDocumentsSection(templateData),
			additionalDocumentsSection(templateData)
		]
	};
}
