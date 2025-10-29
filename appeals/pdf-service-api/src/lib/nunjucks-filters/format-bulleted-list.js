export function formatBulletedList(list, fallbackText = '') {
	if (!list || list.length === 0) {
		return fallbackText;
	}
	if (list.length === 1) {
		return list[0];
	}
	return `<ul class="govuk-list govuk-list--bullet">${list
		.map((item) => '<li>' + item + '</li>')
		.join('')}</ul>`;
}
