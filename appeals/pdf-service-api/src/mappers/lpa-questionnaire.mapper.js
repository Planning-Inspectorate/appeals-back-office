import { additionalDocumentsSection } from './lpa-questionnaire/sections/additional-documents.section.js';
import { consultationResponsesAndRepresentationsSection } from './lpa-questionnaire/sections/consultation-responses-and-representations.section.js';
import { notifyingRelevantPartiesSection } from './lpa-questionnaire/sections/notifying-relevant-parties.section.js';
import { environmentalImpactAssessmentSection } from './lpa-questionnaire/sections/environmental-impact-assessment.section.js';
import { constraintsDesignationsAndOtherIssuesSection } from './lpa-questionnaire/sections/constraints-designations-and-other-issues.section.js';
import { mapPlanningOfficersReportAndSupplementaryDocumentsSection } from './lpa-questionnaire/sections/planning-officers-report-and-supplementary-documents.section.js';
import { mapSiteAccessSection } from './lpa-questionnaire/sections/site-access.section.js';

export default function mapQuestionnaireData(templateData) {
	return {
		sections: [
			constraintsDesignationsAndOtherIssuesSection(templateData),
			environmentalImpactAssessmentSection(templateData),
			notifyingRelevantPartiesSection(templateData),
			consultationResponsesAndRepresentationsSection(templateData),
			mapPlanningOfficersReportAndSupplementaryDocumentsSection(templateData),
			mapSiteAccessSection(templateData),
			additionalDocumentsSection(templateData)
		]
	};
}
