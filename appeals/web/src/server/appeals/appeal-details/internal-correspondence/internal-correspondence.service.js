/**
 * @param {string} correspondenceCategory
 * @returns {string | undefined}
 * */
export function documentNameFromCategory(correspondenceCategory) {
	switch (correspondenceCategory) {
		case 'appellant':
			return 'appellant correspondence';
		case 'cross-team':
			return 'cross-team correspondence';
		case 'inspector':
			return 'inspector correspondence';
		case 'main-party':
			return 'main party correspondence';
	}
}
