export interface AddDocumentsRequest {
	blobStorageHost: string;
	blobStorageContainer: string;
	documents: MappedDocument[];
}

export interface AddDocumentVersionRequest {
	blobStorageHost: string;
	blobStorageContainer: string;
	document: MappedDocument;
}

export interface MappedDocument {
	blobStorageHost?: string | null;
	blobStorageContainer?: string | null;
	blobStoragePath?: string | null;
	documentURI?: string | null;
	caseId: number;
	documentName: string;
	documentType: string;
	mimeType: string;
	documentSize: number;
	stage: string;
	fileRowId: string;
	folderId: number;
	GUID: string;
	receivedDate: string;
	redactionStatusId: number;
}

export interface AddDocumentsResponse {
	documents: (DocumentAuditTrailInfo | null)[];
}

export interface UploadRequest {
	file: File;
	accessToken: AccessToken;
	blobStorageContainer: string;
	blobStorageHost: string;
	blobStoreUrl: string;
	documents: BlobInfo[];
}

export interface FileUploadParameters {
	file: File;
	guid: string;
	blobStorageUrl: string;
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

export interface StagedFileError {
	name: string;
	message: string;
	guid: string;
}

export interface StagedFiles {
	files: StagedFile[];
	errors: StagedFileError[];
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

export interface RemovedUncommittedFile {
	guid: string;
	blobStorageUrl: string;
}

export interface FileUploadError {
	message: string;
	guid: string;
	name: string;
}

export interface UploadFilesResult {
	fileUploadParameters: FileUploadParameters[];
	failedUploads: FileUploadError[];
}
