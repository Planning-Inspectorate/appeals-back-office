import { formatList } from './format-list.js';
import { formatSentenceCase } from './format-sentence-case.js';
import { formatBulletedList } from './format-bulleted-list.js';

export function formatYesNoDetails(details) {
	if (!details || !details.length) {
		return 'No';
	}
	if (typeof details === 'string') {
		return formatList(['Yes', formatSentenceCase(details)]);
	} else {
		return formatList(['Yes', formatBulletedList(details)]);
	}
}
