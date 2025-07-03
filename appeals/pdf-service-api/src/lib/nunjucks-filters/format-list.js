export function formatList(list, fallbackText = 'Not answered') {
	return list?.length > 0 ? list.join('<br>') : fallbackText;
}
