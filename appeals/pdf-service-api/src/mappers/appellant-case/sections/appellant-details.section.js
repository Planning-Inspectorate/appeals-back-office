function formatPersonalDetails(personalDetails) {
	const {
		firstName = '',
		lastName = '',
		organisationName = '',
		email = '',
		phoneNumber
	} = personalDetails || {};
	const fullName = `${firstName} ${lastName}`;
	const details = [fullName, organisationName, email, phoneNumber].filter((detail) => detail);
	return details.join('<br />');
}

export function appellantDetailsSection(templateData) {
	const { appellant, agent } = templateData;

	const items = [{ key: 'Appellant details', html: formatPersonalDetails(appellant) }];

	if (agent) {
		items.push({ key: 'Agent details', html: formatPersonalDetails(agent) });
	}

	return {
		heading: 'Appellant details',
		items
	};
}
