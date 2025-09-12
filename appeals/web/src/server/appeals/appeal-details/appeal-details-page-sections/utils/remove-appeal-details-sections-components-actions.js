import { removeSummaryListActions } from '#lib/mappers/index.js';

const caseDocumentationTableActionColumnIndex = 3;

/**
 * @param {PageComponent[]} pageComponents
 * @returns {void}
 */
export function removeAppealDetailsSectionComponentsActions(pageComponents) {
	pageComponents.forEach((component) => {
		switch (component.type) {
			case 'summary-list':
				component.parameters.rows = component.parameters.rows.map(
					(/** @type {SummaryListRowProperties} */ row) => removeSummaryListActions(row)
				);
				break;
			case 'table':
				component.parameters.rows.forEach((/** @type {TableCellProperties[]} */ row) =>
					row.forEach((cell, index) => {
						if (index === caseDocumentationTableActionColumnIndex && 'html' in cell) {
							cell.html = '';
						}
					})
				);
				break;
			default:
				break;
		}
	});
}
