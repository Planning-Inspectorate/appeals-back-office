import { ValidationErrors } from '@pins/express/types/express.js';

export interface DocumentUploadPageParameters {
	backButtonUrl: string;
	appealId: string;
	appealReference: string;
	folderId: string;
	documentId?: string;
	documentOriginalFileName?: string;
	documentVersion?: number;
	documentTitle?: string | null | undefined;
	useBlobEmulator: boolean;
	filenamesInFolder?: string;
	blobStorageHost: string;
	blobStorageContainer: string;
	multiple: boolean;
	documentStage: string;
	serviceName?: string;
	pageTitle?: string;
	pageHeadingText: string;
	preHeadingText?: string;
	uploadContainerHeadingText?: string;
	pageBodyComponents: PageComponent[];
	caseInfoText?: string;
	documentType: string;
	allowedTypes: string[];
	nextPageUrl: string;
	displayLateEntryContent?: boolean;
	displayCorrectFolderConfirmationContent?: boolean;
	uncommittedFiles?: string;
	errors: ValidationErrors | undefined;
}

export interface FileUploadInfoItem {
	name: string;
	GUID: string;
	blobStoreUrl: string;
	mimeType: string;
	documentType: string;
	size: number;
	stage: string;
	receivedDate: string;
	redactionStatus: number;
}

export interface FileUploadInfo {
	appealId: string;
	folderId: string;
	files: FileUploadInfoItem[];
}

export interface FileUploadError {
	metadata?: Record<string, string>;
	message: string;
	guid: string;
	name: string;
	formId?: string;
}

export interface UploadFilesResult {
	fileUploadParameters: FileUploadParameters[];
	failedUploads: FileUploadError[];
}

export interface UncommittedFile {
	name: string;
	GUID: string;
	blobStoreUrl: string;
	mimeType: string;
	documentType: string;
	size: number;
	stage: string;
	redactionStatus?: number;
	receivedDate?: string;
}

export interface UncommittedFiles {
	files: UncommittedFile[];
}

export interface StagedFile {
	name: string;
	guid: string;
	blobStorageUrl: string;
	mimeType: string;
	documentType: string;
	size: number;
	stage: string;
}

export interface StagedFiles {
	files: StagedFile[];
	errors: StagedFileError[];
}

export interface StagedFileError {
	name: string;
	message: string;
	guid: string;
	metadata?: Record<string, string>;
	formId?: string;
}

export interface FileUploadParameters {
	file: File;
	guid: string;
	blobStorageUrl: string;
}

export interface UploadRequest {
	file: File;
	accessToken: AccessToken;
	blobStorageContainer: string;
	blobStorageHost: string;
	blobStoreUrl: string;
	documents: BlobInfo[];
}
