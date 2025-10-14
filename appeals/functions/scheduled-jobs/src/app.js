import { app } from '@azure/functions';
import updateCompletedEventsHandler from '../update-completed-events/index.js';

app.timer('update-completed-events', {
	schedule: '0 * * * * *',
	handler: updateCompletedEventsHandler
});
