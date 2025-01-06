const siteSafety = {
	type: 'object',
	properties: {
		details: {
			type: 'string',
			nullable: true
		},
		hasIssues: {
			type: 'boolean'
		}
	}
};

export const SiteSafety = siteSafety;
