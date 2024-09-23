import { getAppealAudit, mapUser, mapMessageContent } from './audit.service.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime24hr } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAudit = async (request, response) => {
	const { appealId } = request.params;
	const appeal = request.currentAppeal;
	const auditInfo = await getAppealAudit(request.apiClient, appealId);

	if (auditInfo) {
		const auditTrails = await Promise.all(
			auditInfo.map(async (audit) => {
				const details = await mapMessageContent(appeal, audit.details, audit.doc, request.session);
				const loggedDate = new Date(audit.loggedDate);
				return {
					date: dateISOStringToDisplayDate(loggedDate),
					time: dateISOStringToDisplayTime24hr(loggedDate),
					details,
					user: await mapUser(audit.azureAdUserId, request.session)
				};
			})
		);

		const shortAppealReference = appealShortReference(appeal.appealReference);

		return response.status(200).render('appeals/appeal/audit.njk', {
			pageContent: {
				auditTrails,
				caseReference: shortAppealReference,
				backLinkUrl: `/appeals-service/appeal-details/${appeal.appealId}`,
				title: `Case history - ${shortAppealReference}`,
				preHeading: `Appeal ${shortAppealReference}`,
				heading: 'Case history'
			}
		});
	}

	return response.status(404).render('app/404.njk');
};
