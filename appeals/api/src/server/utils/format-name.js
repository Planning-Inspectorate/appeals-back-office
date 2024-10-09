/**
 * @param {{ firstName: string | null, middleName: string | null, lastName: string | null }} names
 * @returns {string}
 * */
export const formatName = ({ firstName, middleName, lastName }) =>
	[firstName, middleName, lastName].filter(Boolean).join(' ');
