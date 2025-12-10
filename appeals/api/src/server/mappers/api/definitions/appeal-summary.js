import { Address } from './address.js';
import { ServiceUser } from './service-user.js';

const appealSummary = {
	type: 'object',
	required: ['appealId', 'appealReference', 'createdAt'],
	properties: {
		appealId: {
			type: 'number'
		},
		appealReference: {
			type: 'string'
		},
		appealSite: {
			...Address
		},
		appealType: {
			type: 'string'
		},
		createdAt: {
			type: 'string',
			format: 'date-time'
		},
		validAt: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		startedAt: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		planningApplicationReference: {
			type: 'string',
			nullable: true
		},
		localPlanningDepartment: {
			type: 'string'
		},
		procedureType: {
			type: 'string',
			nullable: true
		},
		appellant: {
			...ServiceUser
		},
		agent: {
			...ServiceUser,
			nullable: true
		},
		lpaCode: {
			type: 'string'
		}
	}
};

export const AppealSummary = appealSummary;
