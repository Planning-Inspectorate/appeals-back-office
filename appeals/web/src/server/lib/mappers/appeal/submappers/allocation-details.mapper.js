import { permissionNames } from '#environment/permissions.js';
import { mapActionComponent } from '../../permissions.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAllocationDetails = ({ appealDetails, currentRoute, session }) => ({
	id: 'allocation-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Allocation level'
			},
			value: {
				html: appealDetails.allocationDetails
					? `
					Level: ${appealDetails.allocationDetails.level}<br />
					Band: ${appealDetails.allocationDetails.band}<br />
					Specialisms:
					<ul class="govuk-!-margin-0"><li>${appealDetails.allocationDetails.specialisms.join(
						'</li><li>'
					)}</li></ul>
				`
					: 'No allocation level for this appeal'
			},
			actions: {
				items: [
					mapActionComponent(permissionNames.updateCase, session, {
						text: appealDetails.allocationDetails ? 'Change' : 'Add',
						href: `${currentRoute}/allocation-details/allocation-level`,
						visuallyHiddenText: 'Allocation level',
						attributes: {
							'data-cy': (appealDetails.allocationDetails ? 'change' : 'add') + '-allocation-level'
						}
					})
				]
			},
			classes: 'appeal-allocation-details'
		}
	}
});
