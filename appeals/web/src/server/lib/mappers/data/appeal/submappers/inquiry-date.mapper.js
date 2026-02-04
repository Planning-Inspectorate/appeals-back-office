import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryDate = ({
	appealDetails,
	currentRoute,
	request,
	userHasUpdateCasePermission
}) => {
	const id = 'timetable-inquiry-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		return { id, display: {} };
	}

	const inquiry = appealDetails.inquiry;

	const value = inquiry?.inquiryStartTime
		? `${dateISOStringToDisplayTime12hr(inquiry.inquiryStartTime)} on ${dateISOStringToDisplayDate(
				inquiry.inquiryStartTime
			)}`
		: 'Not set up';

	return textSummaryListItem({
		id,
		text: 'Inquiry',
		value,
		link: addBackLinkQueryToUrl(
			request,
			inquiry ? `${currentRoute}/inquiry/change/date` : `${currentRoute}/inquiry/setup`
		),
		actionText: inquiry ? 'Change' : 'Set up',
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-inquiry-date'
	});
};
