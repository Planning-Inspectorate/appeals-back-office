// @ts-nocheck
import { CaseDetailsPage } from './caseDetailsPage.js';
import { FileUploader } from './shared.js';

const fileUploader = new FileUploader();

export class FileUploaderSection extends CaseDetailsPage {
	// S E L E C T O R S

	selectors = {};

	// E L E M E N T S

	elements = {};

	// A C T I O N S

	uploadFile(filename) {
		fileUploader.uploadFiles(filename);
	}

	verifyFilesUploaded(filenames) {
		fileUploader.verifyUploadedFiles(filenames);
	}
}
