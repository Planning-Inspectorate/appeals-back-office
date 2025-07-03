import { formatList } from './format-list.js';

export function formatReason(reason) {
	if (!reason?.text?.length) {
		return reason?.name || '';
	}
	return formatList(reason.text.map((text) => reason.name + ': ' + text));
}
