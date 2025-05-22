function formatDateAndTime(date) {
	if (!(date instanceof Date)) {
		throw new Error('Invalid date object');
	}

	// Format date (e.g., "22 May 2025")
	const formattedDate = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);

	// Format time (e.g., "2:31am")
	const formattedTime = new Intl.DateTimeFormat('en-GB', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	})
		.format(date)
		.toLowerCase()
		.replace(' ', '');

	return { date: formattedDate, time: formattedTime };
}

module.exports = { formatDateAndTime };
