import got from 'got';
import config from './config.js';
/**
 *
 * @param {*} submission
 * @returns {Promise<{reference: string | null}>}
 */
async function post(submission) {
	return await got
		.post(`https://${config.API_HOST}/appeals/lpaq-submission`, {
			json: submission
		})
		.json();
}

export default {
	post
};
