export function formatYesNo(value, fallbackText = 'Not answered') {
	if (typeof value !== 'boolean') {
		return fallbackText;
	}
	if (value) {
		return 'Yes';
	}
	return 'No';
}
