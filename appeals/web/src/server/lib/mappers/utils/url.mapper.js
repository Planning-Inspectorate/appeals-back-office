/**
 * @param {string | undefined} url
 * @param {string | number | undefined} appealId
 * @returns {string}
 * */

export const constructUrl = (url = '/', appealId = undefined) => {
	/** @type {Record<string, string>} */
	const urlMap = {
		'/personal-list': '/appeals-service/personal-list',
		'/signin': '/auth/signin'
	};

	let constructedUrl = '';

	if (urlMap[url]) {
		// if found in map - return the map value
		constructedUrl = urlMap[url];
	} else if (appealId) {
		// if not found in map and appealId exists return to appeal details subroute (or just appeal details page in case of "/")
		constructedUrl =
			url === `/appeals-service/appeal-details/${appealId}`
				? url
				: `/appeals-service/appeal-details/${appealId}${url}`;
	} else {
		// if not found in map and appealId doesn't exist fall back to all cases page
		constructedUrl = '/appeals-service/all-cases';
	}

	return constructedUrl;
};
