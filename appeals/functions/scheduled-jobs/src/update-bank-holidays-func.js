import { app } from '@azure/functions';
import { initialiseService } from '../init.js';
import { updateBankHolidays } from '../update-bank-holidays/impl.js';

const service = initialiseService();

app.timer('update-bank-holidays', {
	schedule: service.updateBankHolidaysSchedule,
	handler: updateBankHolidays(service)
});
