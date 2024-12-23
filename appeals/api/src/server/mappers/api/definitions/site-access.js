const siteAccess = {
	type: 'object',
	properties: {
		details: {
			type: 'string',
			nullable: true
		},
		isRequired: {
			type: 'boolean'
		}
	}
};

export const SiteAccess = siteAccess;
