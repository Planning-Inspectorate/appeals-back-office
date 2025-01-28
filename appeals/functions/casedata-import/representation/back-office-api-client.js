import got from 'got';
import config from './config.js';
/**
 *
 * @param {*} submission
 * @returns {Promise<{id: number | null}>}
 */
async function post(submission) {
	return await got
		.post(`https://${config.API_HOST}/appeals/representation-submission`, {
			json: submission
		})
		.json();
}

export default {
	post
};
