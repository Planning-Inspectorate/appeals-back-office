// @ts-nocheck

import { Page } from './basePage';

export class FileUploader extends Page {
	fixturesPath = 'cypress/fixtures/';

	sampleFiles = {
		document: 'sample-file.doc',
		document2: 'sample-file-2.doc',
		document3: 'sample-file-3.doc',
		img: 'sample-img.jpeg',
		pdf: 'test.pdf',
		pdf2: 'test-2.pdf'
	};

	/************************ Locators **********************/

	selectors = {
		uploadFile: 'upload-file-button',
		uploadedFileHeading: '.govuk-heading-s',
		uploadedFileRows: '.pins-file-upload__files-rows > li',
		removeButton: 'button-remove-'
	};

	fileUploaderElements = {
		uploadFile: () => cy.getByData(this.selectors.uploadFile),
		uploadedFiles: () => cy.get(this.selectors.uploadedFileRows)
	};

	/************************ Actions ***********************/

	//accepts a single file, or an array of files
	uploadFiles(fileNames) {
		const files = [].concat(fileNames);

		files.forEach((fileName) => {
			this.fileUploaderElements
				.uploadFile()
				.click()
				.selectFile(this.fixturesPath + fileName, { action: 'drag-drop' }, { force: true });
		});
	}

	//accepts a single file, or an array of files
	removeFile(filesArray) {
		const removeFiles = [].concat(filesArray);

		removeFiles.forEach((fileName) => {
			cy.get(this.selectors.uploadedFileHeading).contains(fileName).next().click();
		});
	}

	/************************ Assertions ***********************/

	//accepts a single file, or an array of files
	verifyUploadedFiles(filesArray) {
		const expectedFiles = [].concat(filesArray);

		expectedFiles.forEach((fileName) => {
			this.fileUploaderElements
				.uploadedFiles()
				.find(this.selectors.uploadedFileHeading)
				.should('include.text', `File name: ${fileName}`);
		});
	}
}
