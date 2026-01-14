import { isNetResidencesAppealType } from '#common/net-residences-appeal-types.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceChange = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission,
	request
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;
	const id = 'net-residence-change';

	if (
		isChildAppeal(appealDetails) ||
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE) ||
		!isNetResidencesAppealType(appealDetails.appealType) ||
		[
			APPEAL_CASE_STATUS.INVALID,
			APPEAL_CASE_STATUS.WITHDRAWN,
			APPEAL_CASE_STATUS.TRANSFERRED
			// @ts-ignore
		].includes(appealDetails.appealStatus)
	) {
		return { id, display: {} };
	}

	let value;
	if (netChange == null) {
		value = 'Not provided';
	} else if (netChange === 0) {
		value = 'No change to number of residential units';
	} else if (netChange > 0) {
		value = 'Net gain';
	} else {
		value = 'Net loss';
	}

	return textSummaryListItem({
		id,
		text: 'Is there a net gain or loss of residential units?',
		value,
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`
		),
		editable: userHasUpdateCasePermission,
		actionText: netChange != null ? 'Change' : 'Add',
		classes: 'appeal-net-residence-change'
	});
};
