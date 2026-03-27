import { additionalDocumentsSection } from './sections/additional-documents.section.js';
import { appealProcessSection } from './sections/appeal-process/index.js';
import { constraintsDesignationsAndOtherIssuesSection } from './sections/constraints-designations-and-other-issues/index.js';
import { consultationResponsesAndRepresentationsSection } from './sections/consultation-responses-and-representations/index.js';
import { environmentalImpactAssessmentSection } from './sections/environmental-impact-assessment/index.js';
import { notifyingRelevantPartiesSection } from './sections/notifying-relevant-parties/index.js';
import { planningOfficersReportAndSupplementaryDocumentsSection } from './sections/planning-officers-report-and-supplementary-documents/index.js';
import { siteAccessSection } from './sections/site-access/index.js';

export default function mapQuestionnaireData(templateData) {
	return {
		details: templateData,
		sections: [
			constraintsDesignationsAndOtherIssuesSection(templateData),
			environmentalImpactAssessmentSection(templateData),
			notifyingRelevantPartiesSection(templateData),
			consultationResponsesAndRepresentationsSection(templateData),
			planningOfficersReportAndSupplementaryDocumentsSection(templateData),
			siteAccessSection(templateData),
			appealProcessSection(templateData),
			additionalDocumentsSection(templateData)
		]
	};
}
