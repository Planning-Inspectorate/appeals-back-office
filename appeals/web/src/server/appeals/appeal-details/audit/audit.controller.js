import nunjucksEnvironments from '#app/config/nunjucks.js';
import { getAppealCaseNotes } from '#appeals/appeal-details/case-notes/case-notes.service.js';
import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime24hr } from '#lib/dates.js';
import { utcToZonedTime } from 'date-fns-tz';
import * as interestedPartyCommentsService from '../representations/interested-party-comments/interested-party-comments.service.js';
import { mapMessageContent, tryMapUsers } from './audit.mapper.js';
import { getAppealAudit, getAppealAuditNotifications } from './audit.service.js';
/**
 * @typedef {import('@pins/appeals.api/src/server/openapi-types.js').AuditNotifications} AuditNotifications
 *
 * @typedef {Object} NotificationArrayItem
 * @property {number} dateTime
 * @property {string} date
 * @property {string} time
 * @property {string} details
 * @property {any} user
 *
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 *
 * @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationList} IPCommentsList
 */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAudit = async (request, response) => {
	const appeal = request.currentAppeal;
	const appealId = appeal.appealId;
	const auditInfoRequest = getAppealAudit(request.apiClient, appealId);
	const auditNotifications = getAppealAuditNotifications(request.apiClient, appealId);
	const caseNotesRequest = getAppealCaseNotes(request.apiClient, appealId);

	const [auditInfo, caseNotes, notifications] = await Promise.all([
		auditInfoRequest,
		caseNotesRequest,
		auditNotifications
	]);

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
							html: detailsHtml,
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

	/** @type {NotificationArrayItem[]} */
	let notificationsArray = [];
	if (config.featureFlags.featureFlagNotifyCaseHistory) {
		const ipComments = await interestedPartyCommentsService.getInterestedPartyComments(
			request.apiClient,
			appeal.appealId,
			'all',
			1,
			9999
		);
		notificationsArray = await Promise.all(
			/** @type {AuditNotifications} */ (notifications).map(async (notification) => {
				const createdAt = utcToZonedTime(notification.dateCreated, 'Europe/London');
				const opening = `${notification.subject} sent to ${mapEmailToRecipientType(
					notification.recipient,
					appeal,
					await tryMapUsers(appeal.caseOfficer || '', request.session),
					await tryMapUsers(appeal.inspector || '', request.session),
					ipComments
				)}`;
				const finalHtml = await nunjucksEnvironments.render(
					'appeals/components/page-component.njk',
					{
						component: {
							type: 'details',
							wrapperHtml: {
								opening,
								closing: '</div></div>'
							},
							parameters: {
								summaryText: 'View email',
								html: notification.renderedSubject + notification.renderedContent
							}
						}
					}
				);
				const user = await tryMapUsers(notification.sender || '', request.session);
				return {
					dateTime: createdAt.getTime(),
					date: dateISOStringToDisplayDate(notification.dateCreated),
					time: dateISOStringToDisplayTime24hr(notification.dateCreated),
					details: finalHtml,
					user
				};
			})
		);
	}
	const sortedCaseNotesAndAuditEntries = [
		...auditTrails,
		...caseNotesArray,
		...notificationsArray
	].sort((a, b) => b.dateTime - a.dateTime);

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

/**
 * Maps an email address to a recipient type based on the appeal object and other related parties.
 *
 * @param {string} recipient
 * @param {Appeal} appeal
 * @param {string} inspectorEmail
 * @param {string} caseOfficerEmail
 * @param {IPCommentsList} ipComments
 * @returns {string} -
 */
export const mapEmailToRecipientType = (
	recipient,
	appeal,
	inspectorEmail,
	caseOfficerEmail,
	ipComments
) => {
	if (!recipient || !appeal) {
		return 'unknown';
	}

	const normalizedRecipient = recipient.toLowerCase();

	const possibleRecipients = [
		{ type: 'appellant', email: appeal.appellant?.email },
		{ type: 'agent', email: appeal.agent?.email },
		{ type: 'LPA', email: appeal.lpaEmailAddress },
		{ type: 'case officer', email: caseOfficerEmail },
		{ type: 'inspector', email: inspectorEmail }
	];

	for (const { type, email } of possibleRecipients) {
		if (email && email.toLowerCase() === normalizedRecipient) {
			return type;
		}
	}

	const interestedPartyEmails = new Set(
		ipComments.items
			.filter(
				(/** @type {{ represented: { email: string; }; }} */ ipComment) =>
					ipComment.represented?.email
			)
			.map((/** @type {{ represented: { email: string; }; }} */ ipComment) =>
				ipComment.represented.email.toLowerCase()
			)
	);

	if (interestedPartyEmails.has(normalizedRecipient)) {
		return 'interested party';
	}

	return 'unknown';
};
