import { appellantDetailsSection } from './sections/appellant-details.section.js';
import { siteDetailsSection } from './sections/site-details.section.js';
import { applicationDetailsSection } from './sections/application-details.section.js';
import { uploadDocumentsSection } from './sections/upload-documents.section.js';
import { appealDetailsSection } from './sections/appeal-details.section.js';

export default function mapAppellantCaseData(templateData) {
	const { appealSite, appealReference, localPlanningDepartment } = templateData;
	return {
		details: { appealSite, appealReference, localPlanningDepartment },
		sections: [
			appellantDetailsSection(templateData),
			siteDetailsSection(templateData),
			applicationDetailsSection(templateData),
			appealDetailsSection(templateData),
			uploadDocumentsSection(templateData)
		]
	};
}
