import { permissionNames } from '#environment/permissions.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapServedStopNotice = ({ lpaQuestionnaireData, currentRoute, session }) => {
	// @ts-ignore
	const hasDocuments = (lpaQuestionnaireData.documents?.stopNotice?.documents?.length ?? 0) > 0;

	return {
		id: 'served-stop-notice',
		display: {
			summaryListItem: {
				key: { text: 'Stop notice' },
				value: { text: hasDocuments ? 'Yes' : 'No' },
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: hasDocuments ? 'Change' : 'Add',
							href: `${currentRoute}/stop-notice/change`,
							visuallyHiddenText: 'stop notice'
						})
					]
				}
			}
		}
	};
};
