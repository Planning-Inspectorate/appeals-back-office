import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAffectsListedBuildingDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	session
}) => ({
	id: 'affects-listed-building-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Affected listed buildings'
			},
			value: lpaQuestionnaireData.listedBuildingDetails?.filter(
				(lb) => lb.listEntry && lb.affectsListedBuilding === true
			)?.length
				? {
						html: displayPageFormatter.formatListOfListedBuildingNumbers(
							lpaQuestionnaireData.listedBuildingDetails.filter(
								(lb) => lb.affectsListedBuilding === true
							) || []
						)
				  }
				: {
						text: 'No affected listed buildings'
				  },
			actions: {
				items: [
					...(lpaQuestionnaireData.listedBuildingDetails &&
					lpaQuestionnaireData.listedBuildingDetails.length > 0
						? [
								mapActionComponent(permissionNames.updateCase, session, {
									text: 'Manage',
									href: `${currentRoute}/affected-listed-buildings/manage`,
									visuallyHiddenText: 'Affected listed building',
									attributes: { 'lpaQuestionnaireData-cy': 'manage-affected-listed-building' }
								})
						  ]
						: []),
					mapActionComponent(permissionNames.updateCase, session, {
						text: 'Add',
						visuallyHiddenText: 'Affected listed building',
						href: `${currentRoute}/affected-listed-buildings/add`,
						attributes: { 'lpaQuestionnaireData-cy': 'add-affected-listed-building' }
					})
				]
			}
		}
	}
});
