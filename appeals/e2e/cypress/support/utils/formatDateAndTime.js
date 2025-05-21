function formatDateAndTime(date) {
	if (!(date instanceof Date)) {
		throw new Error('Invalid date object');
	}

	// Format date (e.g., "22 May 2025")
	const formattedDate = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	// Format time (e.g., "2:31am")
	const formattedTime = date
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		})
		.toLowerCase()
		.replace(' ', '');

	return { date: formattedDate, time: formattedTime };
}

module.exports = { formatDateAndTime };
