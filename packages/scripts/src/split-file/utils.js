export const functionTypeRegex =
	// eslint-disable-next-line no-useless-escape
	/\/\*\*(?:[\s*]+)?(?:\s+\* @param \{[a-zA-Z<,>\[\]\s'"\(\).@\/|&\-#]+\} [a-zA-Z\[\]]+.{0,256}\n)+(?:\s\* @returns(?: \{[a-zA-Z<,>\[\]\s'"\(\).@\/|&\-#]+\})?)?\s+\*\//;

/**
 * @param {string} str
 * @returns {string}
 */
export const camelToKebab = (str) =>
	str
		.replaceAll(/([a-z])([A-Z]+)/g, '$1-$2')
		.replaceAll(/([A-Z]{2,4})([A-Z])/g, '$1-$2')
		.toLowerCase();
