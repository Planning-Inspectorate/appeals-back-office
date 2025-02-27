import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapChangedListedBuildingDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	session
}) => ({
	id: 'affected-listed-building-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Changed listed buildings'
			},
			value: lpaQuestionnaireData.listedBuildingDetails?.filter(
				(lb) => lb.listEntry && lb.affectsListedBuilding === false
			)?.length
				? {
						html: displayPageFormatter.formatListOfListedBuildingNumbers(
							lpaQuestionnaireData.listedBuildingDetails.filter(
								(lb) => lb.affectsListedBuilding === false
							) || []
						)
				  }
				: {
						text: 'No Changed listed buildings'
				  },
			actions: {
				items: [
					...(lpaQuestionnaireData.listedBuildingDetails &&
					lpaQuestionnaireData.listedBuildingDetails.length > 0
						? [
								mapActionComponent(permissionNames.updateCase, session, {
									text: 'Manage',
									href: `${currentRoute}/changed-listed-buildings/manage`,
									visuallyHiddenText: 'Changed listed building',
									attributes: { 'lpaQuestionnaireData-cy': 'manage--listed-building' }
								})
						  ]
						: []),
					mapActionComponent(permissionNames.updateCase, session, {
						text: 'Add',
						visuallyHiddenText: 'Changed listed building',
						href: `${currentRoute}/changed-listed-buildings/add`,
						attributes: { 'lpaQuestionnaireData-cy': 'add-changed-listed-building' }
					})
				]
			}
		}
	}
});
