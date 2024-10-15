import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '../../permissions.mapper.js';

/** @type {import('../lpa-questionnaire.mapper.js').SubMapper} */
export const mapAffectsListedBuildingDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	session
}) => ({
	id: 'affects-listed-building-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Listed buildings'
			},
			value: lpaQuestionnaireData.listedBuildingDetails?.length
				? {
						html: displayPageFormatter.formatListOfListedBuildingNumbers(
							lpaQuestionnaireData.listedBuildingDetails || []
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
