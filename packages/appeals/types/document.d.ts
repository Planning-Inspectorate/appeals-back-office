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

export interface AddDocumentVersionResponse {
	documents: (BlobInfo | null)[];
}

export interface BlobInfo {
	documentName: string;
	versionId: number;
	GUID: string;
	blobStoreUrl: string;
	caseType?: string | undefined;
	caseReference?: string | undefined;
	fileRowId?: string | undefined;
}

export interface DocumentAuditTrailInfo {
	documentName: string;
	GUID: string;
}

export interface UploadRequest {
	accessToken: AccessToken;
	blobStorageContainer: string;
	blobStorageHost: string;
	blobStoreUrl: string;
	documents: BlobInfo[];
}

export interface DocumentMetadata {
	blobStorageHost?: string | null;
	blobStorageContainer?: string | null;
	blobStoragePath?: string | null;
	documentURI?: string | null;
	caseId: number;
	mime: string;
	stage: string;
	documentType: string;
	documentSize: number;
	folderId: number;
	name: string;
	GUID: string;
	redactionStatusId: number;
	dateReceived: Date;
}
