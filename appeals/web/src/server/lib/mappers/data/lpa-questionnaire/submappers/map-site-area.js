import { permissionNames } from '#environment/permissions.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteArea = ({ lpaQuestionnaireData, currentRoute, session }) => {
	// @ts-ignore
	const value = lpaQuestionnaireData?.siteAreaSquareMetres;

	return {
		id: 'site-area-square-metres',
		display: {
			summaryListItem: {
				key: {
					text: 'What is the area of the appeal site?'
				},
				value: {
					text: value ? `${value}m²` : 'No data'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: value ? 'Change' : 'Add',
							href: `${currentRoute}/site-area`,
							visuallyHiddenText: 'area of the appeal site'
						})
					]
				}
			}
		}
	};
};
