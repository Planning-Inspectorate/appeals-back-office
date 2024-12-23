import {
	SITE_VISIT_TYPE_ACCESS_REQUIRED,
	SITE_VISIT_TYPE_ACCOMPANIED,
	SITE_VISIT_TYPE_UNACCOMPANIED
} from '#endpoints/constants.js';

const siteVisit = {
	type: 'object',
	required: ['visitType', 'visitDate', 'visitStartTime'],
	nullable: true,
	properties: {
		siteVisitId: {
			type: 'number'
		},
		visitDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		visitStartTime: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		visitEndTime: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		visitType: {
			type: 'string',
			enum: [
				SITE_VISIT_TYPE_UNACCOMPANIED,
				SITE_VISIT_TYPE_ACCESS_REQUIRED,
				SITE_VISIT_TYPE_ACCOMPANIED
			]
		}
	}
};

export const SiteVisit = siteVisit;
