import { getAppealAudit } from './audit.service.js';
import { tryMapUsers, mapMessageContent } from './audit.mapper.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime24hr } from '#lib/dates.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { getAppealCaseNotes } from '#appeals/appeal-details/case-notes/case-notes.service.js';
import { utcToZonedTime } from 'date-fns-tz';
import nunjucksEnvironments from '#app/config/nunjucks.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAudit = async (request, response) => {
	const { appealId } = request.params;
	const appeal = request.currentAppeal;
	const auditInfoRequest = getAppealAudit(request.apiClient, appealId);
	const caseNotesRequest = getAppealCaseNotes(request.apiClient, appealId);
	const [auditInfo, caseNotes] = await Promise.all([auditInfoRequest, caseNotesRequest]);

	if (!auditInfo && !caseNotes) {
		return response.status(404).render('app/404.njk');
	}

	const auditTrails = await Promise.all(
		auditInfo.map(async (audit) => {
			const details = await mapMessageContent(appeal, audit.details, audit.doc, request.session);
			let detailsHtml = details || '';
			if (detailsHtml.length > 300) {
				detailsHtml = nunjucksEnvironments.render('appeals/components/page-component.njk', {
					component: {
						type: 'show-more',
						parameters: {
							text: detailsHtml,
							toggleTextCollapsed: 'Show more',
							toggleTextExpanded: 'Show less'
						}
					}
				});
			}
			const loggedDate = utcToZonedTime(audit.loggedDate, 'Europe/London');
			return {
				dateTime: loggedDate.getTime(),
				date: dateISOStringToDisplayDate(audit.loggedDate),
				time: dateISOStringToDisplayTime24hr(audit.loggedDate),
				details: detailsHtml,
				user: await tryMapUsers(audit.azureAdUserId, request.session)
			};
		})
	);

	const caseNotesArray = await Promise.all(
		caseNotes.map(async (note) => {
			const createdAt = utcToZonedTime(note.createdAt, 'Europe/London');
			return {
				dateTime: createdAt.getTime(),
				date: dateISOStringToDisplayDate(note.createdAt),
				time: dateISOStringToDisplayTime24hr(note.createdAt),
				details: 'Case note added: <br>' + note.comment,
				user: await tryMapUsers(note.azureAdUserId, request.session)
			};
		})
	);

	const sortedCaseNotesAndAuditEntries = [...auditTrails, ...caseNotesArray].sort(
		(a, b) => b.dateTime - a.dateTime
	);

	const shortAppealReference = appealShortReference(appeal.appealReference);

	return response.status(200).render('appeals/appeal/audit.njk', {
		pageContent: {
			auditTrails: sortedCaseNotesAndAuditEntries,
			caseReference: shortAppealReference,
			backLinkUrl: `/appeals-service/appeal-details/${appeal.appealId}`,
			title: `Case history - ${shortAppealReference}`,
			preHeading: `Appeal ${shortAppealReference}`,
			heading: 'Case history'
		}
	});
};
