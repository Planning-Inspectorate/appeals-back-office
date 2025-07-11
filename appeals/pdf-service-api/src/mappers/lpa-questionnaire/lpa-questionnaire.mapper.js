import { additionalDocumentsSection } from './sections/additional-documents.section.js';
import { consultationResponsesAndRepresentationsSection } from './sections/consultation-responses-and-representations.section.js';
import { notifyingRelevantPartiesSection } from './sections/notifying-relevant-parties.section.js';
import { environmentalImpactAssessmentSection } from './sections/environmental-impact-assessment.section.js';
import { constraintsDesignationsAndOtherIssuesSection } from './sections/constraints-designations-and-other-issues.section.js';
import { planningOfficersReportAndSupplementaryDocumentsSection } from './sections/planning-officers-report-and-supplementary-documents.section.js';
import { siteAccessSection } from './sections/site-access.section.js';
import { appealProcessSection } from './sections/appeal-process.section.js';

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
