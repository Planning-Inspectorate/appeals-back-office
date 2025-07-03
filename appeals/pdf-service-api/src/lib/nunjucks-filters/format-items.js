export function formatItems(items) {
	if (!items?.length) {
		return [];
	}
	return items.map((item) => {
		return {
			key: { text: item.key },
			value: item.html ? { html: item.html } : { text: item.text }
		};
	});
}
