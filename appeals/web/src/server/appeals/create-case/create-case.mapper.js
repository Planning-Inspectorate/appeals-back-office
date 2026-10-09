import { radiosInput } from '#lib/mappers/components/page-components/radio.js';
import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { fieldNameCaseType } from './create-case.constants.js';

/**
 * @param {string} backLinkUrl
 * @param {string | undefined} selectedCaseType
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function selectCaseTypePage(backLinkUrl, selectedCaseType, errors) {
	const items = Object.values(GENERIC_APPEAL_TYPES).map((type) => ({
		value: type,
		text: type,
		checked: selectedCaseType === type
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Choose the case type',
		backLinkUrl,
		preHeading: 'Create a case',
		heading: 'Choose the case type',
		pageComponents: [
			radiosInput({
				name: fieldNameCaseType,
				idPrefix: fieldNameCaseType,
				items,
				value: selectedCaseType,
				errorMessage: errors?.[fieldNameCaseType]?.msg
			})
		]
	};

	return pageContent;
}
