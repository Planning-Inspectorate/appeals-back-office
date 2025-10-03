import { fixPersonalListOnStartUp, refreshPersonalList } from '#utils/update-personal-list.js';
import { app } from './server/app.js';
import config from './server/config/config.js';
import initNotify from './server/notify/index.js';
import logger from './server/utils/logger.js';

initNotify();

if (config.featureFlags.featureFlagPersonalList) {
	refreshPersonalList();

	// TODO: Temporary fix for the personal list until this code has been deployed to production
	//  at which point it can be removed
	fixPersonalListOnStartUp();
}

app.listen(config.PORT, () => {
	logger.info(`Server is live at http://localhost:${config.PORT}`);
});
