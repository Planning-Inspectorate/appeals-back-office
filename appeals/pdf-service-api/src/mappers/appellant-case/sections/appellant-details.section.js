function formatPersonalDetails(personalDetails) {
	const { firstName = '', lastName = '', email = '' } = personalDetails || {};
	return `${firstName} ${lastName}<br>${email}`;
}

export function appellantDetailsSection(templateData) {
	const { appellant } = templateData;

	return {
		heading: 'Appellant details',
		items: [{ key: 'Appellant details', html: formatPersonalDetails(appellant) }]
	};
}
