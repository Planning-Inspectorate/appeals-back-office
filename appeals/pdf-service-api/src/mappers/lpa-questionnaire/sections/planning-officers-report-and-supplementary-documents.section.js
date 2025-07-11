import { formatDocumentData, formatYesNo } from '../../../lib/nunjucks-filters/index.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';

export function planningOfficersReportAndSupplementaryDocumentsSection(templateData) {
	const {
		hasInfrastructureLevy,
		isInfrastructureLevyFormallyAdopted,
		infrastructureLevyAdoptedDate,
		infrastructureLevyExpectedDate
	} = templateData;

	const {
		planningOfficerReport,
		developmentPlanPolicies,
		supplementaryPlanning,
		emergingPlan,
		otherRelevantPolicies,
		communityInfrastructureLevy
	} = templateData.documents || {};

	return {
		heading: "Planning officer's report and supplementary documents",
		items: [
			{ key: "Planning officer's report", html: formatDocumentData(planningOfficerReport) },
			{
				key: 'Relevant policies from statutory development plan',
				html: formatDocumentData(developmentPlanPolicies)
			},
			{ key: 'Supplementary planning documents', html: formatDocumentData(supplementaryPlanning) },
			{ key: 'Emerging plan relevant to appeal', html: formatDocumentData(emergingPlan) },
			{ key: 'Other relevant policies', html: formatDocumentData(otherRelevantPolicies) },
			{
				key: 'Community infrastructure levy',
				text: formatYesNo(hasInfrastructureLevy)
			},
			{
				key: 'Community infrastructure levy documents',
				text: formatDocumentData(communityInfrastructureLevy)
			},
			{
				key: 'Is the community infrastructure levy formally adopted?',
				text: formatYesNo(isInfrastructureLevyFormallyAdopted)
			},
			{
				key: 'When was the community infrastructure levy formally adopted?',
				text: formatDate(infrastructureLevyAdoptedDate)
			},
			{
				key: 'When do you expect to formally adopt the community infrastructure levy?',
				text: formatDate(infrastructureLevyExpectedDate)
			}
		]
	};
}
