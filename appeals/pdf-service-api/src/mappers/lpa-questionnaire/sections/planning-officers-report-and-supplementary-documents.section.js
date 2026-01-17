import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import { formatDocumentData, formatYesNo } from '../../../lib/nunjucks-filters/index.js';

export function planningOfficersReportAndSupplementaryDocumentsSection(templateData) {
	const {
		hasInfrastructureLevy,
		isInfrastructureLevyFormallyAdopted,
		infrastructureLevyAdoptedDate,
		infrastructureLevyExpectedDate,
		appealType,
		wasApplicationRefusedDueToHighwayOrTraffic,
		didAppellantSubmitCompletePhotosAndPlans
	} = templateData;

	const {
		planningOfficerReport,
		developmentPlanPolicies,
		supplementaryPlanning,
		emergingPlan,
		otherRelevantPolicies,
		communityInfrastructureLevy,
		plansDrawings
	} = templateData.documents || {};

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	return {
		heading: "Planning officer's report and supplementary documents",
		items: [
			{ key: "Planning officer's report", html: formatDocumentData(planningOfficerReport) },
			...([APPEAL_TYPE.CAS_ADVERTISEMENT, APPEAL_TYPE.ADVERTISEMENT].includes(appealType)
				? [
						{
							key: 'Did you refuse the application because of highway or traffic public safety?',
							html: formatYesNo(wasApplicationRefusedDueToHighwayOrTraffic)
						},
						{
							key: 'Did the appellant submit complete and accurate photographs and plans?',
							html: formatYesNo(didAppellantSubmitCompletePhotosAndPlans)
						}
					]
				: []),
			// appears here for householder, in appellant case for other appeal types
			...(isHASAppeal
				? [
						{
							key: 'Plans, drawings and list of plans',
							text: formatDocumentData(plansDrawings)
						}
					]
				: []),
			{
				key: 'Relevant policies from statutory development plan',
				html: formatDocumentData(developmentPlanPolicies)
			},
			{ key: 'Supplementary planning documents', html: formatDocumentData(supplementaryPlanning) },
			{ key: 'Emerging plan relevant to appeal', html: formatDocumentData(emergingPlan) },
			// does not appear for householder
			...(!isHASAppeal
				? [
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
				: [])
		]
	};
}
