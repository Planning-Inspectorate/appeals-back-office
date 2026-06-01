import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { additionalDocumentsSection } from './sections/additional-documents.section.js';
import { appealProcessSection } from './sections/appeal-process/index.js';
import { constraintsDesignationsAndOtherIssuesSection } from './sections/constraints-designations-and-other-issues/index.js';
import { consultationResponsesAndRepresentationsSection } from './sections/consultation-responses-and-representations/index.js';
import { environmentalImpactAssessmentSection } from './sections/environmental-impact-assessment/index.js';
import { notifyingRelevantPartiesSection } from './sections/notifying-relevant-parties/index.js';
import { originalEvidenceSection } from './sections/original-evidence/index.js';
import { planningOfficersReportAndSupplementaryDocumentsSection } from './sections/planning-officers-report-and-supplementary-documents/index.js';
import { siteAccessSection } from './sections/site-access/index.js';

export default function mapQuestionnaireData(templateData) {
	let mappedTemplateData = templateData;

	if (templateData && templateData.isS78Expedited && templateData.appealType === APPEAL_TYPE.S78) {
		mappedTemplateData = {
			...templateData,
			appealType: APPEAL_TYPE.S78_EXPEDITED
		};
	}

	return {
		details: mappedTemplateData,
		sections: [
			constraintsDesignationsAndOtherIssuesSection(mappedTemplateData),
			environmentalImpactAssessmentSection(mappedTemplateData),
			notifyingRelevantPartiesSection(mappedTemplateData),
			consultationResponsesAndRepresentationsSection(mappedTemplateData),
			planningOfficersReportAndSupplementaryDocumentsSection(mappedTemplateData),
			siteAccessSection(mappedTemplateData),
			appealProcessSection(mappedTemplateData),
			originalEvidenceSection(mappedTemplateData),
			additionalDocumentsSection(mappedTemplateData)
		].filter(Boolean)
	};
}
