import { appealDetailsPage } from './appeal-details.mapper.js';
import { getInterestedPartyComments } from './interested-party-comments/interested-party-comments.service.js';
import { APPEAL_REPRESENTATION_STATUS, APPEAL_TYPE } from '@pins/appeals/constants/common.js';

import { dayMonthYearHourMinuteToISOString, getTodaysISOString, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';

import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {


	const date = {
		year: 2024,
		month: 6,
		day: 11,
		hour: 7,
		minute: 12
	};
	const d = dayMonthYearHourMinuteToISOString(date);

	console.log("dayMonthYearHourMinuteToISOString", d);

	const dateISOString = "2024-06-11T08:12:00.000Z";

	const day = parseInt(formatInTimeZone(dateISOString, 'Europe/London', 'dd'), 10);
	const month = parseInt(formatInTimeZone(dateISOString, 'Europe/London', 'MM'), 10);
	const year = parseInt(formatInTimeZone(dateISOString, 'Europe/London', 'yyyy'), 10);
	const hour = parseInt(formatInTimeZone(dateISOString, 'Europe/London', 'HH'), 10);
	const minute = parseInt(formatInTimeZone(dateISOString, 'Europe/London', 'mm'), 10);

	const hourMinuteAmPm = formatInTimeZone(dateISOString, 'Europe/London', `hh:mmaaaaa'm'`)

	// console.log(`viewAppealDetails:${day}:${month}:${year}:${hour}:${minute}:`);
	console.log(`viewAppealDetails:${hourMinuteAmPm}:`);



	const appealDetails = request.currentAppeal;
	const session = request.session;
	try {
		if (appealDetails) {
			let unreviewedIPComments;

			if (appealDetails.appealType === APPEAL_TYPE.W) {
				unreviewedIPComments = await getInterestedPartyComments(
					request.apiClient,
					appealDetails.appealId,
					APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
				);
			}

			const currentUrl = request.originalUrl;
			const mappedPageContent = await appealDetailsPage(
				appealDetails,
				currentUrl,
				session,
				request,
				unreviewedIPComments && unreviewedIPComments.length > 0
			);

			return response.status(200).render('patterns/display-page.pattern.njk', {
				pageContent: mappedPageContent
			});
		} else {
			return response.status(404).render('app/404.njk');
		}
	} catch (error) {
		return response.status(500).render('app/500.njk');
	}
};
