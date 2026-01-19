import { Page } from './basePage';
import { CaseDetailsPage } from './caseDetailsPage';
import { FileUploader } from './shared';

const caseDetailsPage = new CaseDetailsPage();

export class uploadPOEAndWitnessDocPage extends Page {
	static fillPage() {
		const fileUploadSection = new FileUploader();

		fileUploadSection.uploadFiles(caseDetailsPage.sampleFiles.document);
		fileUploadSection.verifyUploadedFiles(caseDetailsPage.sampleFiles.document);
	}
}
