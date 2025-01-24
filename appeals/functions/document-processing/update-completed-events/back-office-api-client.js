import got from 'got';
import config from './config.js';

export const postUpdateCompletedEvents = () =>
	got.post(`https://${config.API_HOST}/appeals/update-complete-events`, {
		headers: { azureAdUserId: '00000000-0000-0000-0000-000000000000' }
	});
