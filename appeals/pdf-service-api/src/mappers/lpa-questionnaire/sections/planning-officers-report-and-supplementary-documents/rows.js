import { formatDate } from '../../../../lib/nunjucks-filters/format-date.js';
import { formatDocumentData, formatYesNo } from '../../../../lib/nunjucks-filters/index.js';

export const rowBuilders = {
	planningOfficerReport: (data) => ({
		key: "Planning officer's report",
		html: formatDocumentData(data.documents.planningOfficerReport)
	}),

	wasApplicationRefusedDueToHighwayOrTraffic: (data) => ({
		key: 'Did you refuse the application because of highway or traffic public safety?',
		html: formatYesNo(data.wasApplicationRefusedDueToHighwayOrTraffic)
	}),

	didAppellantSubmitCompletePhotosAndPlans: (data) => ({
		key: 'Did the appellant submit complete and accurate photographs and plans?',
		html: formatYesNo(data.didAppellantSubmitCompletePhotosAndPlans)
	}),

	plansDrawings: (data) => ({
		key: 'Plans, drawings and list of plans',
		html: formatDocumentData(data.documents.plansDrawings)
	}),

	developmentPlanPolicies: (data) => ({
		key: 'Relevant policies from statutory development plan',
		html: formatDocumentData(data.documents.developmentPlanPolicies)
	}),

	supplementaryPlanning: (data) => ({
		key: 'Supplementary planning documents',
		html: formatDocumentData(data.documents.supplementaryPlanning)
	}),

	emergingPlan: (data) => ({
		key: 'Emerging plan relevant to appeal',
		html: formatDocumentData(data.documents.emergingPlan)
	}),

	otherRelevantPolicies: (data) => ({
		key: 'Other relevant policies',
		html: formatDocumentData(data.documents.otherRelevantPolicies)
	}),

	hasInfrastructureLevy: (data) => ({
		key: 'Community infrastructure levy',
		text: formatYesNo(data.hasInfrastructureLevy)
	}),

	communityInfrastructureLevy: (data) => ({
		key: 'Community infrastructure levy documents',
		html: formatDocumentData(data.documents.communityInfrastructureLevy)
	}),

	isInfrastructureLevyFormallyAdopted: (data) => ({
		key: 'Is the community infrastructure levy formally adopted?',
		text: formatYesNo(data.isInfrastructureLevyFormallyAdopted)
	}),

	infrastructureLevyAdoptedDate: (data) => ({
		key: 'When was the community infrastructure levy formally adopted?',
		text: formatDate(data.infrastructureLevyAdoptedDate)
	}),

	infrastructureLevyExpectedDate: (data) => ({
		key: 'When do you expect to formally adopt the community infrastructure levy?',
		text: formatDate(data.infrastructureLevyExpectedDate)
	}),

	otherRelevantMatters: (data) => ({
		key: 'Other relevant matters',
		html: formatDocumentData(data.documents.otherRelevantMatters)
	})
};
