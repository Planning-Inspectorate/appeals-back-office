import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import { mapActionComponent } from '../../permissions.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAgent = ({ appealDetails, currentRoute, session }) => ({
	id: 'agent',
	display: {
		summaryListItem: {
			key: {
				text: 'Agent'
			},
			value: {
				html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
			},
			actions: {
				items:
					'agent' in appealDetails
						? [
								mapActionComponent(permissionNames.updateCase, session, {
									text: 'Change',
									href: `${currentRoute}/service-user/change/agent`,
									visuallyHiddenText: 'Agent',
									attributes: { 'data-cy': 'change-agent' }
								})
						  ]
						: []
			},
			classes: 'appeal-agent'
		}
	}
});
