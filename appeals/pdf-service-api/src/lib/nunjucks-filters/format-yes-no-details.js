import { formatList } from './format-list.js';
import { formatYesNo } from './format-yes-no.js';
import { formatSentenceCase } from './format-sentence-case.js';

export function formatYesNoDetails(details) {
	return formatList([
		formatYesNo(Boolean(details?.trim())),
		...[details?.trim()].filter((data) => data).map((data) => formatSentenceCase(data))
	]);
}
