import { app } from './server/app.js';
import config from './server/config/config.js';
import logger from './server/utils/logger.js';
import initNotify from './server/notify/index.js';

initNotify();

app.listen(config.PORT, () => {
	logger.info(`Server is live at http://localhost:${config.PORT}`);
});
