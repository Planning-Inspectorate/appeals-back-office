import config from '#config/config.js';
import { initNotifyEmulator } from '#notify/emulate-notify.js';

export default function () {
	if (config.useNotifyEmulator) {
		return initNotifyEmulator();
	}
}
