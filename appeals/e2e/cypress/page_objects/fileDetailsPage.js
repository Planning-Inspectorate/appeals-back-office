// @ts-nocheck
import { BANNER_TYPES, SUCCESS_MESSAGES } from '../support/consts.js';
import { CaseDetailsPage } from './caseDetailsPage.js';

export class FileDetailsPage extends CaseDetailsPage {
	// S E L E C T O R S

	// E L E M E N T S

	// A C T I O N S

	changeFileName() {
		this.changeFileManageDocuments('Name');
	}

	confirmFileRenamed(filename) {
		this.validateBannerMessage(BANNER_TYPES.success, SUCCESS_MESSAGES.filenameUpdated);
	}

	enterFileName(filename) {
		this.fillInput(filename, 1);
	}
}
