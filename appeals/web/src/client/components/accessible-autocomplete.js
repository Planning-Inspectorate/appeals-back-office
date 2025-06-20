import accessibleAutocomplete from 'accessible-autocomplete';

document.addEventListener('DOMContentLoaded', function () {
	const selectElements = document.querySelectorAll('select.accessible-autocomplete');
	for (const selectElement of selectElements) {
		accessibleAutocomplete.enhanceSelectElement({
			selectElement
		});
	}
});
