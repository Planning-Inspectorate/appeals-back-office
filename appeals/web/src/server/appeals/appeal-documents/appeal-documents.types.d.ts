import { ValidationErrors } from '@pins/express/types/express.js';

export interface DocumentUploadPageParameters {
	backButtonUrl: string;
	appealId: string;
	appealReference: string;
	folderId: string;
	documentId?: string;
	documentOriginalFileName?: string;
	documentVersion?: number;
	useBlobEmulator: boolean;
	blobStorageHost: string;
	blobStorageContainer: string;
	multiple: boolean;
	documentStage: string;
	serviceName?: string;
	appealShortReference?: string | null | undefined;
	pageTitle?: string;
	pageHeadingText: string;
	pageBodyComponents: PageComponent[];
	caseInfoText?: string;
	documentType: string;
	nextPageUrl: string;
	displayLateEntryContent?: boolean;
	displayCorrectFolderConfirmationContent?: boolean;
	uncommittedFiles?: string[];
	errors: ValidationErrors | undefined;
}
