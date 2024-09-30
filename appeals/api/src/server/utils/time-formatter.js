
/**
 * @param {Date | undefined} date
 * @returns {string} formatted time string,'HH:mm'
 */
const formatTime = (date) => {
    if (!date) {
        return '';
    }
	const d = new Date(date);
    return d.toISOString().split('T')[1].substr(0, 5);
};

export default formatTime;
