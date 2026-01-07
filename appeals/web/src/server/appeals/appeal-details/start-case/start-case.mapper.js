import featureFlags from '#common/feature-flags.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { editLink } from '#lib/edit-utilities.js';
import { detailsComponent } from '#lib/mappers/components/page-components/details.js';
import { radiosInput } from '#lib/mappers/components/page-components/radio.js';
import { simpleHtmlComponent, textSummaryListItem } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} today
 * @param {string|undefined} backUrl
 * @returns {PageContent}
 */
export function startCasePage(appealId, appealReference, today, backUrl) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Start case',
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Start case',
		pageComponents: [
			{
				type: 'warning-text',
				wrapperHtml: {
					opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
					closing: '</div></div>'
				},
				parameters: {
					text: `Confirming will activate the timetable on ${today}. Start letters will be sent to the relevant parties.`
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening:
						'<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds"><form action="" method="POST" novalidate>',
					closing: '</form></div></div>'
				},
				parameters: {
					text: 'Confirm',
					type: 'submit'
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string} today
 * @returns {PageContent}
 */
export function changeDatePage(appealId, appealReference, today) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Change start date',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Change start date',
		pageComponents: [
			{
				type: 'warning-text',
				parameters: {
					text: `Confirming will change the start day to ${today} and update the case timetable. New start letters will be sent to relevant parties.`
				}
			},
			{
				type: 'button',
				wrapperHtml: {
					opening: '<form action="" method="POST" novalidate>',
					closing: '</form>'
				},
				parameters: {
					text: 'Confirm',
					type: 'submit'
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {string} appealReference
 * @param {string} backLinkUrl
 * @param {{appealProcedure: string}} [storedSessionData]
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export function selectProcedurePage(
	appealReference,
	backLinkUrl,
	storedSessionData,
	errorMessage = undefined
) {
	const dataMappers = [
		{
			//TODO: Case should be updated in the dataModel repo in the next ticket and this hsould be updated
			case: 'expeditedAppeals',
			featureFlag: FEATURE_FLAG_NAMES.EXPEDITED_APPEALS
		},
		{
			case: APPEAL_CASE_PROCEDURE.WRITTEN,
			featureFlag: FEATURE_FLAG_NAMES.SECTION_78
		},
		{
			case: APPEAL_CASE_PROCEDURE.HEARING
		},
		{
			case: APPEAL_CASE_PROCEDURE.INQUIRY,
			featureFlag: FEATURE_FLAG_NAMES.SECTION_78_INQUIRY
		}
	];

	/** @type {RadioItem[]} */
	const radioItems = [];

	dataMappers.map((item) => {
		if (!item.featureFlag || featureFlags.isFeatureActive(item.featureFlag)) {
			radioItems.push({
				value: item.case,
				text: appealProcedureToLabelText(item.case),
				checked:
					storedSessionData?.appealProcedure && storedSessionData?.appealProcedure === item.case
			});
		}
	});

	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal procedure',
		backLinkUrl,
		preHeading: `Appeal ${appealShortReference(appealReference)} - start case`,
		pageComponents: [
			radiosInput({
				name: 'appealProcedure',
				idPrefix: 'appeal-procedure',
				legendText: 'Appeal procedure',
				legendIsPageHeading: true,
				items: radioItems,
				errorMessage
			})
		]
	};

	return pageContent;
}

/**
 * @param {string|number} appealId
 * @param {string} appealReference
 * @param {string} procedureType
 * @param {{appellant: string, lpa: string}} [emailPreviews]
 * @returns {PageContent}
 */
export function confirmProcedurePage(appealId, appealReference, procedureType, emailPreviews) {
	const emailPreviewComponents = emailPreviews
		? [
				detailsComponent({
					summaryText: `Preview email to appellant`,
					html: emailPreviews.appellant
				}),
				detailsComponent({
					summaryText: `Preview email to LPA`,
					html: emailPreviews.lpa
				})
		  ]
		: [];

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check details and start case',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/start-case/select-procedure`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check details and start case',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					rows: [
						textSummaryListItem({
							id: 'appeal-procedure',
							text: 'Appeal procedure',
							value: appealProcedureToLabelText(procedureType),
							link: editLink(
								`/appeals-service/appeal-details/${appealId}/start-case/select-procedure`
							),
							editable: true
						})?.display.summaryListItem
					]
				}
			},
			simpleHtmlComponent(
				'p',
				{
					class: 'govuk-body'
				},
				`We’ll start the timetable now and send emails to the relevant parties.`
			),
			...emailPreviewComponents
		],
		submitButtonText: 'Start case'
	};

	return pageContent;
}

/**
 * @param {string} procedureType
 * @returns {string}
 */
function appealProcedureToLabelText(procedureType) {
	switch (procedureType) {
		case APPEAL_CASE_PROCEDURE.WRITTEN:
			return 'Written representations';
		//TODO: Case should be updated in the dataModel repo in the next ticket and this hsould be updated
		case 'expeditedAppeals':
			return 'Part 1';
		case APPEAL_CASE_PROCEDURE.HEARING:
		case APPEAL_CASE_PROCEDURE.INQUIRY:
			return capitalizeFirstLetter(procedureType);
		default:
			return '';
	}
}
