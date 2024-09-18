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

export interface StagedFiles {
	files: StagedFile[];
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
