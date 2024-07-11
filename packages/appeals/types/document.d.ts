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
	accessToken: AccessToken;
	blobStorageContainer: string;
	blobStorageHost: string;
	blobStoreUrl: string;
	documents: BlobInfo[];
}
