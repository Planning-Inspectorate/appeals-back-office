import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { transitionAppealStatesAfterValidationOutcomeUpdate } from '#endpoints/appellant-cases/appellant-cases.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { generateNotifyPreview } from '#notify/emulate-notify.js';
import { notifySend, renderTemplate } from '#notify/notify-send.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import commonRepository from '#repositories/common.repository.js';
import { isChildAppeal } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import { ERROR_NO_RECIPIENT_EMAIL } from '@pins/appeals/constants/support.js';
import { isAnyEnforcementAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { getEventType } from '@pins/appeals/utils/event-type.js';
import { loadEnvironment } from '@pins/platform';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#repositories/appellant-case.repository.js').UpdateAppellantCaseValidationOutcome} UpdateAppellantCaseValidationOutcome */

const LPA_ENFORCEMENT_NOTICE_WITHDRAWAL_INVALID_REASON_ID = 8;

/**
 * @param {Appeal} appeal
 * @param {string} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {boolean} [dryRun]
 */
export const enforcementNoticeWithdrawn = async (
	appeal,
	azureAdUserId,
	notifyClient,
	dryRun = false
) => {
	const { appellantCase } = appeal;

	if (!appellantCase) {
		logger.error('Appellant case not found', { appealId: appeal.id });
		throw new Error('Appellant case not found');
	}

	if (!isAnyEnforcementAppealType(appeal.appealType?.type)) {
		logger.error('Appeal type is not an enforcement appeal type', { appealId: appeal.id });
		throw new Error('Appeal type is not an enforcement appeal type');
	}

	const validationOutcome = await commonRepository.getLookupListValueByKey(
		'appellantCaseValidationOutcome',
		{ key: 'name', value: 'Invalid' }
	);

	/** @type {UpdateAppellantCaseValidationOutcome} */
	const validationOutcomeData = {
		appealId: appeal.id,
		appellantCaseId: appellantCase.id,
		validationOutcomeId: validationOutcome.id,
		invalidReasons: [{ id: LPA_ENFORCEMENT_NOTICE_WITHDRAWAL_INVALID_REASON_ID }],
		enforcementNoticeInvalid: 'no'
	};

	if (!dryRun) {
		await appellantCaseRepository.updateAppellantCaseValidationOutcome(validationOutcomeData);

		await transitionAppealStatesAfterValidationOutcomeUpdate({
			appeal: {
				appealStatus: appeal.appealStatus,
				appealType: appeal.appealType,
				appellant: appeal.appellant,
				agent: appeal.agent,
				id: appeal.id,
				reference: appeal.reference,
				applicationReference: appeal.applicationReference || '',
				parentAppeals: appeal.parentAppeals,
				childAppeals: appeal.childAppeals
			},
			validationOutcome,
			validationOutcomeData,
			azureAdUserId
		});
	}

	const isAnyEnfType = isAnyEnforcementAppealType(appeal.appealType?.type);
	const isChildAnyEnfType = isAnyEnfType && isChildAppeal(appeal);

	if (isChildAnyEnfType) {
		logger.info('Child enforcement appeal type, no notification sent', { appealId: appeal.id });
		return;
	}
	const applicantEmail = appeal.agent?.email || appeal.appellant?.email;

	if (!applicantEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';
	const teamEmail = await getTeamEmailFromAppealId(appeal.id);

	const eventType = getEventType(appeal);

	const personalisation = {
		appeal_reference_number: appeal.reference,
		local_planning_authority: appeal.lpa?.name || '',
		enforcement_reference: appellantCase.enforcementReference || '',
		issue_date: appellantCase.enforcementIssueDate
			? formatDate(new Date(appellantCase.enforcementIssueDate), false)
			: undefined,
		site_address: siteAddress,
		event_type: eventType,
		team_email_address: teamEmail
	};

	if (dryRun) {
		const environment = loadEnvironment(process.env.NODE_ENV);

		const renderedTemplate = renderTemplate(
			'appeal-cancelled-enforcement-notice-withdrawn.content.md',
			{
				...personalisation,
				front_office_url: environment.FRONT_OFFICE_URL || ''
			}
		);
		const notifyPreview = generateNotifyPreview(renderedTemplate);

		return {
			appellant: notifyPreview,
			lpa: notifyPreview
		};
	} else {
		await notifySend({
			azureAdUserId,
			templateName: 'appeal-cancelled-enforcement-notice-withdrawn',
			notifyClient,
			recipientEmail: applicantEmail,
			personalisation
		});

		if (appeal.lpa?.email) {
			await notifySend({
				azureAdUserId,
				templateName: 'appeal-cancelled-enforcement-notice-withdrawn',
				notifyClient,
				recipientEmail: appeal.lpa.email,
				personalisation
			});
		}
	}

	await broadcasters.broadcastAppeal(appeal.id);

	if (appeal.childAppeals?.length) {
		await Promise.allSettled(
			appeal.childAppeals
				.filter(({ type }) => type === 'linked')
				.map(({ childId }) => (childId ? broadcasters.broadcastAppeal(childId) : Promise.resolve()))
		);
	}
};
