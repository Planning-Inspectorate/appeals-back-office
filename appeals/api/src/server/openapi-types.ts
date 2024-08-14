export interface LinkedAppealRequest {
	/** @example 25 */
	linkedAppealId?: number;
	/** @example true */
	isCurrentAppealParent?: boolean;
}

export interface LinkedAppealLegacyRequest {
	/** @example "51243165" */
	linkedAppealReference?: string;
	/** @example false */
	isCurrentAppealParent?: boolean;
}

export interface RelatedAppealRequest {
	/** @example 25 */
	linkedAppealId?: number;
}

export interface RelatedAppealLegacyRequest {
	/** @example "51243165" */
	linkedAppealReference?: string;
}

export interface UnlinkAppealRequest {
	/** @example 1002 */
	relationshipId?: number;
}

export interface ValidateDate {
	/** @example "2024-08-17" */
	inputDate?: string;
}

export interface AppellantCaseData {
	casedata?: {
		/** @example "ea8cdd8c-20a6-466c-b925-9a8040f7b5df" */
		submissionId?: string;
		/** @example true */
		advertisedAppeal?: boolean;
		/** @example false */
		appellantCostsAppliedFor?: boolean;
		/** @example "2024-01-01T00:00:00.000Z" */
		applicationDate?: string;
		/** @example "refused" */
		applicationDecision?: string;
		/** @example "2024-01-01T00:00:00.000Z" */
		applicationDecisionDate?: string;
		/** @example "123" */
		applicationReference?: string;
		/** @example "written" */
		caseProcedure?: string;
		/** @example "2024-03-25T23:59:59.999Z" */
		caseSubmissionDueDate?: string;
		/** @example "2024-03-25T23:59:59.999Z" */
		caseSubmittedDate?: string;
		/** @example "D" */
		caseType?: string;
		/** @example false */
		changedDevelopmentDescription?: boolean;
		/** @example false */
		enforcementNotice?: boolean;
		/** @example 22 */
		floorSpaceSquareMetres?: number;
		/** @example "Some" */
		knowsAllOwners?: string;
		/** @example "Some" */
		knowsOtherOwners?: string;
		/** @example "Q9999" */
		lpaCode?: string;
		/** @example false */
		isGreenBelt?: boolean;
		/** @example ["1000000"] */
		nearbyCaseReferences?: string[];
		/** @example [] */
		neighbouringSiteAddresses?: any[];
		/** @example "A test description" */
		originalDevelopmentDescription?: string;
		/** @example true */
		ownersInformed?: boolean;
		/** @example true */
		ownsAllLand?: boolean;
		/** @example true */
		ownsSomeLand?: boolean;
		/** @example ["Come and see"] */
		siteAccessDetails?: string[];
		/** @example "Somewhere" */
		siteAddressCounty?: string;
		/** @example "Somewhere" */
		siteAddressLine1?: string;
		/** @example "Somewhere St" */
		siteAddressLine2?: string;
		/** @example "SOM3 W3R" */
		siteAddressPostcode?: string;
		/** @example "Somewhereville" */
		siteAddressTown?: string;
		/** @example 22 */
		siteAreaSquareMetres?: number;
		/** @example ["It's dangerous"] */
		siteSafetyDetails?: string[];
	};
	documents?: {
		/** @example "2024-03-01T13:48:35.847Z" */
		dateCreated?: string;
		/** @example "001" */
		documentId?: string;
		/** @example "appellantCostsApplication" */
		documentType?: string;
		/** @example "https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg" */
		documentURI?: string;
		/** @example "img1.jpg" */
		filename?: string;
		/** @example "image/jpeg" */
		mime?: string;
		/** @example "oimg.jpg" */
		originalFilename?: string;
		/** @example 10293 */
		size?: number;
	}[];
	users?: {
		/** @example "test@test.com" */
		emailAddress?: string;
		/** @example "Testy" */
		firstName?: string;
		/** @example "McTest" */
		lastName?: string;
		/** @example "Mr" */
		salutation?: string;
		/** @example "Appellant" */
		serviceUserType?: string;
		/** @example "A company" */
		organisation?: string;
		/** @example "0123456789" */
		telephoneNumber?: string;
	}[];
}

export interface QuestionnaireData {
	casedata?: {
		/** @example "6000000" */
		caseReference?: string;
		/** @example "2024-05-31T23:00:00.000Z" */
		lpaQuestionnaireSubmittedDate?: string;
		/** @example "cupidatat ipsum eu culpa" */
		lpaStatement?: string;
		/** @example ["Here it is"] */
		siteAccessDetails?: string[];
		/** @example ["Fine"] */
		siteSafetyDetails?: string[];
		/** @example true */
		isCorrectAppealType?: boolean;
		/** @example false */
		isGreenBelt?: boolean;
		/** @example true */
		inConservationArea?: boolean;
		/** @example "cupidatat" */
		newConditionDetails?: string;
		/** @example ["notice","letter"] */
		notificationMethod?: string[];
		/** @example ["1000000"] */
		nearbyCaseReferences?: string[];
		neighbouringSiteAddresses?: {
			/** @example "deserunt in irure do" */
			neighbouringSiteAddressLine1?: string;
			neighbouringSiteAddressLine2?: any;
			/** @example "laboris ut enim et laborum" */
			neighbouringSiteAddressTown?: string;
			/** @example "reprehenderit eu mollit Excepteur sit" */
			neighbouringSiteAddressCounty?: string;
			/** @example "aliqua in qui ipsum" */
			neighbouringSiteAddressPostcode?: string;
			neighbouringSiteAccessDetails?: any;
			/** @example "magna proident incididunt in non" */
			neighbouringSiteSafetyDetails?: string;
		}[];
		/** @example ["10001","10002"] */
		affectedListedBuildingNumbers?: string[];
		/** @example false */
		lpaCostsAppliedFor?: boolean;
	};
	documents?: {
		/** @example "2024-03-01T13:48:35.847Z" */
		dateCreated?: string;
		/** @example "001" */
		documentId?: string;
		/** @example "lpaCostsApplication" */
		documentType?: string;
		/** @example "https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg" */
		documentURI?: string;
		/** @example "img3.jpg" */
		filename?: string;
		/** @example "image/jpeg" */
		mime?: string;
		/** @example "oimg.jpg" */
		originalFilename?: string;
		/** @example 10293 */
		size?: number;
	}[];
}

export interface DecisionInfo {
	/** @example "allowed" */
	outcome?: string;
	/** @example "c957e9d0-1a02-4650-acdc-f9fdd689c210" */
	documentGuid?: string;
	/** @example "2024-08-17" */
	documentDate?: string;
}

export interface InvalidDecisionInfo {
	/** @example "Invalid Decision Reason" */
	invalidDecisionReason?: string;
}

export interface AddDocumentsRequest {
	/** @example "host" */
	blobStorageHost?: string;
	/** @example "document-service-uploads" */
	blobStorageContainer?: string;
	documents?: {
		/** @example 1 */
		caseId?: number;
		/** @example "mydoc.pdf" */
		documentName?: string;
		/** @example "application/pdf" */
		documentType?: string;
		/** @example 14699 */
		documentSize?: number;
		/** @example "file_row_1685470289030_16995" */
		fileRowId?: string;
		/** @example 23 */
		folderId?: number;
	}[];
}

export interface AddDocumentVersionRequest {
	/** @example "host" */
	blobStorageHost?: string;
	/** @example "document-service-uploads" */
	blobStorageContainer?: string;
	document?: {
		/** @example 1 */
		caseId?: number;
		/** @example "mydoc.pdf" */
		documentName?: string;
		/** @example "application/pdf" */
		documentType?: string;
		/** @example 14699 */
		documentSize?: number;
		/** @example "file_row_1685470289030_16995" */
		fileRowId?: string;
		/** @example 23 */
		folderId?: number;
	};
}

export interface AddDocumentsResponse {
	documents?: {
		/** @example "appeal" */
		caseType?: string;
		/** @example "1345264" */
		caseReference?: string;
		/** @example "27d0fda4-8a9a-4f5a-a158-68eaea676158" */
		GUID?: string;
		/** @example "mydoc.pdf" */
		documentName?: string;
		/** @example 1 */
		versionId?: number;
		/** @example "appeal/1345264/27d0fda4-8a9a-4f5a-a158-68eaea676158/v1/mydoc.pdf" */
		blobStoreUrl?: string;
	}[];
}

export interface Folder {
	/** @example 23 */
	folderId?: number;
	/** @example "appellant-case/appealStatement" */
	path?: string;
	/** @example "1345264" */
	caseId?: string;
	/** @example [] */
	documents?: any[];
}

export interface DocumentVersionDetails {
	/** @example "27d0fda4-8a9a-4f5a-a158-68eaea676158" */
	documentGuid?: string;
	/** @example 1 */
	version?: number;
	lastModified?: any;
	/** @example "applicationForm" */
	documentType?: string;
	/** @example false */
	published?: boolean;
	/** @example "back-office-appeals" */
	sourceSystem?: string;
	origin?: any;
	/** @example "mydoc.pdf" */
	originalFilename?: string;
	/** @example "mydoc.pdf" */
	fileName?: string;
	representative?: any;
	description?: any;
	owner?: any;
	author?: any;
	securityClassification?: any;
	/** @example "application/pdf" */
	mime?: string;
	horizonDataID?: any;
	fileMD5?: any;
	path?: any;
	virusCheckStatus?: any;
	/** @example 146995 */
	size?: number;
	/** @example "appellant_case" */
	stage?: string;
	filter1?: any;
	/** @example "document-service-uploads" */
	blobStorageContainer?: string;
	/** @example "appeal/1345264/27d0fda4-8a9a-4f5a-a158-68eaea676158/v1/mydoc.pdf" */
	blobStoragePath?: string;
	/** @example "2024-08-17T15:22:20.827Z" */
	dateCreated?: string;
	datePublished?: any;
	/** @example false */
	isDeleted?: boolean;
	/** @example false */
	isLateEntry?: boolean;
	examinationRefNo?: any;
	filter2?: any;
	/** @example "awaiting_upload" */
	publishedStatus?: string;
	publishedStatusPrev?: any;
	redactionStatusId?: any;
	/** @example false */
	redacted?: boolean;
	/** @example "https://127.0.0.1:10000/devstoreaccount1/document-service-uploads/document-service-uploads/appeal/1345264/27d0fda4-8a9a-4f5a-a158-68eaea676158/v1/mydoc.pdf" */
	documentURI?: string;
	dateReceived?: any;
}

export interface DocumentDetails {
	/** @example "27d0fda4-8a9a-4f5a-a158-68eaea676158" */
	guid?: string;
	/** @example "mydoc.pdf" */
	name?: string;
	/** @example 3779 */
	folderId?: number;
	/** @example "2024-08-17T15:22:20.827Z" */
	createdAt?: string;
	/** @example false */
	isDeleted?: boolean;
	/** @example 492 */
	caseId?: number;
	latestDocumentVersion?: {
		/** @example "27d0fda4-8a9a-4f5a-a158-68eaea676158" */
		documentId?: string;
		/** @example 1 */
		version?: number;
		/** @example "mydoc.pdf" */
		fileName?: string;
		/** @example "mydoc.pdf" */
		originalFilename?: string;
		/** @example "2024-06-11T19:42:22.713Z" */
		dateReceived?: string;
		/** @example "Unredacted" */
		redactionStatus?: string;
		/** @example "scanned" */
		virusCheckStatus?: string;
		/** @example 4688 */
		size?: number;
		/** @example "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" */
		mime?: string;
		/** @example false */
		isLateEntry?: boolean;
		/** @example false */
		isDeleted?: boolean;
		/** @example "decision" */
		documentType?: string;
		/** @example "document-service-uploads" */
		blobStorageContainer?: string;
		/** @example "appeal/6000210/d9720f12-daf9-4f47-a842-00b9313491b8/v1/preview_renamed.xlsx" */
		blobStoragePath?: string;
	}[];
	/** @example [] */
	versionAudit?: any[];
}

export interface AuditTrailUserInfo {
	/** @example 1 */
	id?: number;
	/** @example "6f930ec9-7f6f-448c-bb50-b3b898035959" */
	azureAdUserId?: string;
	/** @example "" */
	sapId?: string;
}

export interface DocumentVersionAuditEntry {
	/** @example 1 */
	id?: number;
	/** @example "27d0fda4-8a9a-4f5a-a158-68eaea676158" */
	documentGuid?: string;
	/** @example 1 */
	version?: number;
	/** @example 1 */
	auditTrailId?: number;
	/** @example "Create" */
	action?: string;
	auditTrail?: {
		/** @example 1 */
		id?: number;
		/** @example 1 */
		appealId?: number;
		/** @example 1 */
		userId?: number;
		/** @example "2024-11-10" */
		loggedAt?: string;
		/** @example "" */
		details?: string;
		user?: {
			/** @example 1 */
			id?: number;
			/** @example "6f930ec9-7f6f-448c-bb50-b3b898035959" */
			azureAdUserId?: string;
			/** @example "" */
			sapId?: string;
		};
	};
}

export interface AppealTypeChangeRequest {
	/** @example 32 */
	newAppealTypeId?: number;
	/** @example "2024-02-02" */
	newAppealTypeFinalDate?: string;
}

export interface AppealTypeTransferRequest {
	/** @example 32 */
	newAppealTypeId?: number;
}

export interface AppealTypeTransferConfirmationRequest {
	/** @example "76215416" */
	newAppealReference?: string;
}

export type AppealTypes = {
	/** @example "Appeal type name" */
	type?: string;
	/** @example "A" */
	code?: string;
	/** @example false */
	enabled?: boolean;
	/** @example "HAS" */
	shorthand?: string;
	/** @example 1 */
	id?: number;
}[];

export interface AllAppeals {
	/** @example 57 */
	itemCount?: number;
	items?: {
		/** @example 1 */
		appealId?: number;
		/** @example "APP/Q9999/D/21/235348" */
		appealReference?: string;
		appealSite?: {
			/** @example "19 Beauchamp Road" */
			addressLine1?: string;
			/** @example "Bristol" */
			town?: string;
			/** @example "Bristol" */
			county?: string;
			/** @example "BS7 8LQ" */
			postCode?: string;
		};
		/** @example "awaiting_lpa_questionnaire" */
		appealStatus?: string;
		/** @example "household" */
		appealType?: string;
		/** @example "2024-02-16T11:43:27.096Z" */
		createdAt?: string;
		/** @example "Wiltshire Council" */
		localPlanningDepartment?: string;
		/** @example "Incomplete" */
		appellantCaseStatus?: string;
		/** @example "Incomplete" */
		lpaQuestionnaireStatus?: string;
		/** @example "2024-06-18T00:00:00.000Z" */
		dueDate?: string;
	}[];
	/** @example 1 */
	page?: number;
	/** @example 27 */
	pageCount?: number;
	/** @example 30 */
	pageSize?: number;
}

export interface SingleAppealResponse {
	agent?: {
		/** @example 199 */
		serviceUserId?: number;
		/** @example "Some" */
		firstName?: string;
		/** @example "User" */
		lastName?: string;
		/** @example "Some Company" */
		organisationName?: string;
		/** @example "an email address" */
		email?: string;
		phoneNumber?: any;
	};
	appellant?: {
		/** @example 200 */
		serviceUserId?: number;
		/** @example "Another" */
		firstName?: string;
		/** @example "User" */
		lastName?: string;
		organisationName?: any;
		phoneNumber?: any;
	};
	allocationDetails?: any;
	/** @example 118 */
	appealId?: number;
	/** @example "6000118" */
	appealReference?: string;
	appealSite?: {
		/** @example 122 */
		addressId?: number;
		/** @example "FOR TRAINERS ONLY" */
		addressLine1?: string;
		/** @example "44 Rivervale" */
		addressLine2?: string;
		/** @example "Bridport" */
		town?: string;
		/** @example "DT6 5RN" */
		postCode?: string;
	};
	costs?: {
		appellantApplicationFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2200 */
			folderId?: number;
			/** @example "costs/appellantApplication" */
			path?: string;
		};
		appellantWithdrawalFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2201 */
			folderId?: number;
			/** @example "costs/appellantWithdrawal" */
			path?: string;
		};
		appellantCorrespondenceFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2202 */
			folderId?: number;
			/** @example "costs/appellantCorrespondence" */
			path?: string;
		};
		lpaApplicationFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2300 */
			folderId?: number;
			/** @example "costs/lpaApplication" */
			path?: string;
		};
		lpaWithdrawalFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2301 */
			folderId?: number;
			/** @example "costs/lpaWithdrawal" */
			path?: string;
		};
		lpaCorrespondenceFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2302 */
			folderId?: number;
			/** @example "costs/lpaCorrespondence" */
			path?: string;
		};
		decisionFolder?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2400 */
			folderId?: number;
			/** @example "costs/decision" */
			path?: string;
		};
	};
	internalCorrespondence?: {
		crossTeam?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2121 */
			folderId?: number;
			/** @example "internal/crossTeamCorrespondence" */
			path?: string;
		};
		inspector?: {
			/** @example "118" */
			caseId?: string;
			/** @example [] */
			documents?: any[];
			/** @example 2122 */
			folderId?: number;
			/** @example "internal/inspectorCorrespondence" */
			path?: string;
		};
	};
	/** @example [] */
	neighbouringSites?: any[];
	/** @example "ready_to_start" */
	appealStatus?: string;
	appealTimetable?: any;
	/** @example "Householder" */
	appealType?: string;
	/** @example 118 */
	appellantCaseId?: number;
	/** @example "00000000-0000-0000-0000-000000000000" */
	caseOfficer?: string;
	decision?: {
		/** @example 2124 */
		folderId?: number;
	};
	healthAndSafety?: {
		appellantCase?: {
			details?: any;
			/** @example false */
			hasIssues?: boolean;
		};
		lpaQuestionnaire?: {
			/** @example true */
			hasIssues?: boolean;
		};
	};
	inspector?: any;
	inspectorAccess?: {
		appellantCase?: {
			details?: any;
			/** @example false */
			isRequired?: boolean;
		};
		lpaQuestionnaire?: {
			/** @example true */
			isRequired?: boolean;
		};
	};
	/** @example [] */
	otherAppeals?: any[];
	linkedAppeals?: {
		/** @example 120 */
		appealId?: number;
		/** @example "6000120" */
		appealReference?: string;
		/** @example true */
		isParentAppeal?: boolean;
		/** @example "2024-06-26T11:57:40.270Z" */
		linkingDate?: string;
		/** @example "(D) Householder" */
		appealType?: string;
		/** @example 24 */
		relationshipId?: number;
		/** @example false */
		externalSource?: boolean;
	}[];
	/** @example false */
	isParentAppeal?: boolean;
	/** @example true */
	isChildAppeal?: boolean;
	/** @example "Some Borough Council" */
	localPlanningDepartment?: string;
	lpaQuestionnaireId?: any;
	/** @example "52279/APP/1/151419" */
	planningApplicationReference?: string;
	/** @example "Written" */
	procedureType?: string;
	/** @example "2024-06-26T11:57:39.953Z" */
	createdAt?: string;
	startedAt?: any;
	/** @example "2024-06-12T22:57:37.724Z" */
	validAt?: string;
	documentationSummary?: {
		appellantCase?: {
			/** @example "received" */
			status?: string;
			dueDate?: any;
			/** @example "2024-06-26T11:57:39.953Z" */
			receivedAt?: string;
		};
		lpaQuestionnaire?: {
			/** @example "not_received" */
			status?: string;
		};
	};
}

export interface SingleAppellantCaseResponse {
	agriculturalHolding?: {
		/** @example true */
		isAgriculturalHolding?: boolean;
		/** @example true */
		isTenant?: boolean;
		/** @example false */
		hasToldTenants?: boolean;
		/** @example true */
		hasOtherTenants?: boolean;
	};
	/** @example 1 */
	appealId?: number;
	/** @example "APP/Q9999/D/21/965625" */
	appealReference?: string;
	appealSite?: {
		/** @example 1 */
		addressId?: number;
		/** @example "21 The Pavement" */
		addressLine1?: string;
		/** @example "Wandsworth" */
		county?: string;
		/** @example "SW4 0HY" */
		postCode?: string;
	};
	/** @example 1 */
	appellantCaseId?: number;
	appellant?: {
		/** @example 1 */
		appellantId?: number;
		/** @example "Roger Simmons Ltd" */
		company?: string;
		/** @example "Roger Simmons" */
		name?: string;
	};
	applicant?: {
		/** @example "Fiona" */
		firstName?: string;
		/** @example "Burgess" */
		surname?: string;
	};
	developmentDescription?: {
		/** @example "A new extension has been added at the back" */
		details?: string;
		/** @example false */
		isChanged?: boolean;
	};
	/** @example true */
	isGreenBelt?: boolean;
	documents?: {
		appealStatement?: {
			/** @example 4562 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
		applicationForm?: {
			/** @example 4563 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
		decisionLetter?: {
			/** @example 4564 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
		newSupportingDocuments?: {
			/** @example 4569 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
		plansDrawings?: {
			/** @example 4570 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
		planningObligation?: {
			/** @example 4571 */
			folderId?: number;
			/** @example [] */
			documents?: any[];
		};
	};
	/** @example true */
	hasAdvertisedAppeal?: boolean;
	/** @example true */
	hasDesignAndAccessStatement?: boolean;
	/** @example true */
	hasNewPlansOrDrawings?: boolean;
	/** @example true */
	hasNewSupportingDocuments?: boolean;
	/** @example true */
	hasSeparateOwnershipCertificate?: boolean;
	healthAndSafety?: {
		/** @example "There is no mobile reception at the site" */
		details?: string;
		/** @example true */
		hasIssues?: boolean;
	};
	/** @example false */
	isAppellantNamedOnApplication?: boolean;
	/** @example "Wiltshire Council" */
	localPlanningDepartment?: string;
	planningObligation?: {
		/** @example true */
		hasObligation?: boolean;
		/** @example "Finalised" */
		status?: string;
	};
	/** @example "written" */
	procedureType?: string;
	siteOwnership?: {
		/** @example true */
		areAllOwnersKnown?: boolean;
		/** @example true */
		hasAttemptedToIdentifyOwners?: boolean;
		/** @example true */
		hasToldOwners?: boolean;
		/** @example false */
		ownsAllLand?: boolean;
		/** @example true */
		ownsSomeLand?: boolean;
		/** @example "Some" */
		knowsOtherLandowners?: string;
	};
	validation?: {
		/** @example "Incomplete" */
		outcome?: string;
		/** @example ["Appellant name is not the same on the application form and appeal form","Attachments and/or appendices have not been included to the full statement of case","Other"] */
		incompleteReasons?: string[];
	};
	visibility?: {
		/** @example "The site is behind a tall hedge" */
		details?: string;
		/** @example false */
		isVisible?: boolean;
	};
}

export interface UpdateCaseTeamRequest {
	/** @example "13de469c-8de6-4908-97cd-330ea73df618" */
	caseOfficer?: string;
	/** @example "f7ea429b-65d8-4c44-8fc2-7f1a34069855" */
	inspector?: string;
}

export interface UpdateCaseTeamResponse {
	/** @example "13de469c-8de6-4908-97cd-330ea73df618" */
	caseOfficer?: string;
	/** @example "f7ea429b-65d8-4c44-8fc2-7f1a34069855" */
	inspector?: string;
}

export interface StartCaseRequest {
	/** @example "2024-05-09" */
	startDate?: string;
}

export interface StartCaseResponse {
	/** @example "2024-08-09" */
	finalCommentReviewDate?: string;
	/** @example "2024-08-10" */
	issueDeterminationDate?: string;
	/** @example "2024-08-11" */
	lpaQuestionnaireDueDate?: string;
	/** @example "2024-08-12" */
	statementReviewDate?: string;
}

export interface SingleLPAQuestionnaireResponse {
	affectsListedBuildingDetails?: {
		/** @example "654321" */
		listEntry?: string;
	}[];
	/** @example 1 */
	appealId?: number;
	/** @example "APP/Q9999/D/21/526184" */
	appealReference?: string;
	appealSite?: {
		/** @example "92 Huntsmoor Road" */
		addressLine1?: string;
		/** @example "Tadley" */
		county?: string;
		/** @example "RG26 4BX" */
		postCode?: string;
	};
	/** @example "2024-05-09T01:00:00.000Z" */
	communityInfrastructureLevyAdoptionDate?: string;
	designatedSites?: {
		/** @example "cSAC" */
		name?: string;
		/** @example "candidate special area of conservation" */
		description?: string;
	}[];
	/** @example "" */
	developmentDescription?: string;
	documents?: {
		communityInfrastructureLevy?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		conservationAreaMapAndGuidance?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		consultationResponses?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		definitiveMapAndStatement?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		emergingPlans?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		environmentalStatementResponses?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		issuedScreeningOption?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		lettersToNeighbours?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		otherRelevantPolicies?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		planningOfficersReport?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		policiesFromStatutoryDevelopment?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		pressAdvert?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		relevantPartiesNotification?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		representationsFromOtherParties?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		responsesOrAdvice?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		screeningDirection?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		siteNotice?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		supplementaryPlanningtestDocuments?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
		treePreservationOrder?: {
			/** @example 1 */
			folderId?: number;
			/** @example "path/to/document/folder" */
			path?: string;
			documents?: {
				/** @example "fdadc281-f686-40ee-97cf-9bafdd02b1cb" */
				id?: string;
				/** @example "an appeal related document.pdf" */
				name?: string;
				/** @example 1 */
				folderId?: number;
				/** @example 2 */
				caseId?: number;
			}[];
		};
	};
	/** @example true */
	doesAffectAListedBuilding?: boolean;
	/** @example true */
	doesAffectAScheduledMonument?: boolean;
	/** @example true */
	doesSiteHaveHealthAndSafetyIssues?: boolean;
	/** @example true */
	doesSiteRequireInspectorAccess?: boolean;
	/** @example "Some extra conditions" */
	extraConditions?: string;
	/** @example true */
	hasCommunityInfrastructureLevy?: boolean;
	/** @example true */
	hasCompletedAnEnvironmentalStatement?: boolean;
	/** @example true */
	hasEmergingPlan?: boolean;
	/** @example true */
	hasExtraConditions?: boolean;
	/** @example true */
	hasProtectedSpecies?: boolean;
	/** @example true */
	hasRepresentationsFromOtherParties?: boolean;
	/** @example true */
	hasResponsesOrStandingAdviceToUpload?: boolean;
	/** @example true */
	hasStatementOfCase?: boolean;
	/** @example true */
	hasStatutoryConsultees?: boolean;
	/** @example true */
	hasSupplementaryPlanningDocuments?: boolean;
	/** @example true */
	hasTreePreservationOrder?: boolean;
	/** @example "There is no mobile signal at the property" */
	healthAndSafetyDetails?: string;
	/** @example true */
	inCAOrrelatesToCA?: boolean;
	/** @example true */
	includesScreeningOption?: boolean;
	/** @example 2 */
	inquiryDays?: number;
	/** @example "The entrance is at the back of the property" */
	inspectorAccessDetails?: string;
	/** @example true */
	isAffectingNeighbouringSites?: boolean;
	/** @example true */
	isCommunityInfrastructureLevyFormallyAdopted?: boolean;
	/** @example true */
	isConservationArea?: boolean;
	/** @example true */
	isCorrectAppealType?: boolean;
	/** @example true */
	isEnvironmentalStatementRequired?: boolean;
	/** @example true */
	isGypsyOrTravellerSite?: boolean;
	/** @example true */
	isListedBuilding?: boolean;
	/** @example true */
	isPublicRightOfWay?: boolean;
	/** @example true */
	isSensitiveArea?: boolean;
	/** @example true */
	isSiteVisible?: boolean;
	/** @example true */
	isTheSiteWithinAnAONB?: boolean;
	listedBuildingDetails?: {
		/** @example "123456" */
		listEntry?: string;
	}[];
	/** @example "Wiltshire Council" */
	localPlanningDepartment?: string;
	lpaNotificationMethods?: {
		/** @example "A site notice" */
		name?: string;
	}[];
	/** @example 1 */
	lpaQuestionnaireId?: number;
	/** @example true */
	meetsOrExceedsThresholdOrCriteriaInColumn2?: boolean;
	otherAppeals?: {
		/** @example 1 */
		appealId?: number;
		/** @example "APP/Q9999/D/21/725284" */
		appealReference?: string;
	}[];
	/** @example "Written" */
	procedureType?: string;
	/** @example "Schedule 1" */
	scheduleType?: string;
	/** @example "The area is prone to flooding" */
	sensitiveAreaDetails?: string;
	/** @example true */
	isGreenBelt?: boolean;
	/** @example "Some other people need to be consulted" */
	statutoryConsulteesDetails?: string;
	validation?: {
		/** @example "Incomplete" */
		outcome?: string;
		/** @example ["Documents or information are missing","Policies are missing","Other"] */
		incompleteReasons?: string[];
	};
}

export interface UpdateAppellantCaseRequest {
	/** @example "2024-12-13" */
	appealDueDate?: string;
	/** @example "Fiona" */
	applicantFirstName?: string;
	/** @example "Burgess" */
	applicantSurname?: string;
	/** @example true */
	areAllOwnersKnown?: boolean;
	/** @example true */
	hasAdvertisedAppeal?: boolean;
	/** @example true */
	hasAttemptedToIdentifyOwners?: boolean;
	/** @example true */
	hasHealthAndSafetyIssues?: boolean;
	/** @example "There is no mobile reception at the site" */
	healthAndSafetyIssues?: string;
	incompleteReasons?: {
		/** @example 1 */
		id?: number;
		/** @example ["Incomplete reason 1","Incomplete reason 2","Incomplete reason 3"] */
		text?: string[];
	}[];
	invalidReasons?: {
		/** @example 1 */
		id?: number;
		/** @example ["Invalid reason 1","Invalid reason 2","Invalid reason 3"] */
		text?: string[];
	}[];
	/** @example false */
	isSiteFullyOwned?: boolean;
	/** @example true */
	isSitePartiallyOwned?: boolean;
	/** @example false */
	isSiteVisibleFromPublicRoad?: boolean;
	/** @example "valid" */
	validationOutcome?: string;
	/** @example "The site is behind a tall hedge" */
	visibilityRestrictions?: string;
	/** @example true */
	isGreenBelt?: boolean;
}

export type UpdateAppellantCaseResponse = object;

export interface UpdateLPAQuestionnaireRequest {
	/** @example [1,2,3] */
	designatedSites?: number[];
	/** @example true */
	doesAffectAListedBuilding?: boolean;
	/** @example true */
	doesAffectAScheduledMonument?: boolean;
	/** @example true */
	hasCompletedAnEnvironmentalStatement?: boolean;
	/** @example true */
	hasProtectedSpecies?: boolean;
	/** @example true */
	hasTreePreservationOrder?: boolean;
	/** @example true */
	includesScreeningOption?: boolean;
	incompleteReasons?: {
		/** @example 1 */
		id?: number;
		/** @example ["Incomplete reason 1","Incomplete reason 2","Incomplete reason 3"] */
		text?: string[];
	}[];
	/** @example true */
	isConservationArea?: boolean;
	/** @example true */
	isEnvironmentalStatementRequired?: boolean;
	/** @example true */
	isGypsyOrTravellerSite?: boolean;
	/** @example true */
	isListedBuilding?: boolean;
	/** @example true */
	isPublicRightOfWay?: boolean;
	/** @example true */
	isSensitiveArea?: boolean;
	/** @example true */
	isTheSiteWithinAnAONB?: boolean;
	/** @example "2024-06-21" */
	lpaQuestionnaireDueDate?: string;
	/** @example true */
	meetsOrExceedsThresholdOrCriteriaInColumn2?: boolean;
	/** @example 1 */
	scheduleType?: number;
	/** @example "The area is liable to flooding" */
	sensitiveAreaDetails?: string;
	/** @example "incomplete" */
	validationOutcome?: string;
	/** @example true */
	isGreenBelt?: boolean;
}

export type UpdateLPAQuestionnaireResponse = object;

export interface CreateSiteVisitRequest {
	/** @example "2024-07-07" */
	visitDate?: string;
	/** @example "18:00" */
	visitEndTime?: string;
	/** @example "16:00" */
	visitStartTime?: string;
	/** @example "access required" */
	visitType?: string;
}

export interface CreateSiteVisitResponse {
	/** @example "2024-07-07T01:00:00.000Z" */
	visitDate?: string;
	/** @example "18:00" */
	visitEndTime?: string;
	/** @example "16:00" */
	visitStartTime?: string;
	/** @example "access required" */
	visitType?: string;
}

export interface UpdateSiteVisitRequest {
	/** @example "2024-07-09" */
	visitDate?: string;
	/** @example "12:00" */
	visitEndTime?: string;
	/** @example "10:00" */
	visitStartTime?: string;
	/** @example "Accompanied" */
	visitType?: string;
	/** @example "Unaccompanied" */
	previousVisitType?: string;
	/** @example "all" */
	siteVisitChangeType?: string;
}

export interface UpdateSiteVisitResponse {
	/** @example "2024-07-09T01:00:00.000Z" */
	visitDate?: string;
	/** @example "12:00" */
	visitEndTime?: string;
	/** @example "10:00" */
	visitStartTime?: string;
	/** @example "Accompanied" */
	visitType?: string;
	/** @example "Unaccompanied" */
	previousVisitType?: string;
	/** @example "all" */
	siteVisitChangeType?: string;
}

export interface SingleSiteVisitResponse {
	/** @example 2 */
	appealId?: number;
	/** @example 1 */
	siteVisitId?: number;
	/** @example "Access required" */
	visitType?: string;
	/** @example "2024-07-07" */
	visitDate?: string;
	/** @example "18:00" */
	visitEndTime?: string;
	/** @example "16:00" */
	visitStartTime?: string;
}

export type AllAppellantCaseIncompleteReasonsResponse = {
	/** @example 1 */
	id?: number;
	/** @example "Incomplete reason" */
	name?: string;
	/** @example true */
	hasText?: boolean;
}[];

export type AllAppellantCaseInvalidReasonsResponse = {
	/** @example 1 */
	id?: number;
	/** @example "Invalid reason" */
	name?: string;
	/** @example true */
	hasText?: boolean;
}[];

export type AllLPAQuestionnaireIncompleteReasonsResponse = {
	/** @example 1 */
	id?: number;
	/** @example "Incomplete reason" */
	name?: string;
	/** @example true */
	hasText?: boolean;
}[];

export type AllocationSpecialismsResponse = {
	/** @example 1 */
	id?: number;
	/** @example "Specialism" */
	name?: string;
}[];

export type AllocationLevelsResponse = {
	/** @example "B" */
	level?: string;
	/** @example 3 */
	band?: number;
}[];

export interface AppealAllocation {
	/** @example "A" */
	level?: string;
	/** @example [70,71,72] */
	specialisms?: number[];
}

export type AllDesignatedSitesResponse = {
	/** @example "cSAC" */
	name?: string;
	/** @example "candidate special area of conservation" */
	description?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllKnowledgeOfOtherLandownersResponse = {
	/** @example "Yes" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllLPANotificationMethodsResponse = {
	/** @example "A site notice" */
	name?: string;
	/** @example "notice" */
	key?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllLPAQuestionnaireValidationOutcomesResponse = {
	/** @example "Complete" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllPlanningObligationStatusesResponse = {
	/** @example "Finalised" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllProcedureTypesResponse = {
	/** @example "Hearing" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllScheduleTypesResponse = {
	/** @example "Schedule 1" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllSiteVisitTypesResponse = {
	/** @example "Access required" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export type AllAppellantCaseValidationOutcomesResponse = {
	/** @example "Valid" */
	name?: string;
	/** @example 1 */
	id?: number;
}[];

export interface SingleAppellantResponse {
	/** @example "Fiona Burgess" */
	agentName?: string;
	/** @example 1 */
	appellantId?: number;
	/** @example "Sophie Skinner Ltd" */
	company?: string;
	/** @example "sophie.skinner@example.com" */
	email?: string;
	/** @example "Sophie Skinner" */
	name?: string;
}

export interface UpdateAppellantRequest {
	/** @example "Eva Sharma" */
	name?: string;
}

export interface UpdateAppellantResponse {
	/** @example "Eva Sharma" */
	name?: string;
}

export interface SingleAddressResponse {
	/** @example 1 */
	addressId?: number;
	/** @example "1 Grove Cottage" */
	addressLine1?: string;
	/** @example "Shotesham Road" */
	addressLine2?: string;
	/** @example "United Kingdom" */
	country?: string;
	/** @example "Devon" */
	county?: string;
	/** @example "NR35 2ND" */
	postcode?: string;
	/** @example "Woodton" */
	town?: string;
}

export interface UpdateAddressRequest {
	/** @example "1 Grove Cottage" */
	addressLine1?: string;
	/** @example "Shotesham Road" */
	addressLine2?: string;
	/** @example "United Kingdom" */
	country?: string;
	/** @example "Devon" */
	county?: string;
	/** @example "NR35 2ND" */
	postcode?: string;
	/** @example "Woodton" */
	town?: string;
}

export interface UpdateAddressResponse {
	/** @example "1 Grove Cottage" */
	addressLine1?: string;
	/** @example "Shotesham Road" */
	addressLine2?: string;
	/** @example "United Kingdom" */
	country?: string;
	/** @example "Devon" */
	county?: string;
	/** @example "NR35 2ND" */
	postcode?: string;
	/** @example "Woodton" */
	town?: string;
}

export interface NeighbouringSiteCreateResponse {
	/** @example 1 */
	siteId?: number;
	address?: {
		/** @example "1 Grove Cottage" */
		addressLine1?: string;
		/** @example "Shotesham Road" */
		addressLine2?: string;
		/** @example "United Kingdom" */
		country?: string;
		/** @example "Devon" */
		county?: string;
		/** @example "NR35 2ND" */
		postcode?: string;
		/** @example "Woodton" */
		town?: string;
	};
}

export interface NeighbouringSiteUpdateRequest {
	/** @example 1 */
	siteId?: number;
	address?: {
		/** @example "1 Grove Cottage" */
		addressLine1?: string;
		/** @example "Shotesham Road" */
		addressLine2?: string;
		/** @example "United Kingdom" */
		country?: string;
		/** @example "Devon" */
		county?: string;
		/** @example "NR35 2ND" */
		postcode?: string;
		/** @example "Woodton" */
		town?: string;
	};
}

export interface NeighbouringSiteUpdateResponse {
	/** @example 1 */
	siteId?: number;
}

export interface NeighbouringSiteDeleteRequest {
	/** @example 1 */
	siteId?: number;
}

export interface UpdateAppealTimetableRequest {
	/** @example "2024-08-09" */
	finalCommentReviewDate?: string;
	/** @example "2024-08-10" */
	issueDeterminationDate?: string;
	/** @example "2024-08-11" */
	lpaQuestionnaireDueDate?: string;
	/** @example "2024-08-12" */
	statementReviewDate?: string;
}

export interface UpdateAppealTimetableResponse {
	/** @example "2024-08-09T01:00:00.000Z" */
	finalCommentReviewDate?: string;
	/** @example "2024-08-10T01:00:00.000Z" */
	issueDeterminationDate?: string;
	/** @example "2024-08-11T01:00:00.000Z" */
	lpaQuestionnaireDueDate?: string;
	/** @example "2024-08-12T01:00:00.000Z" */
	statementReviewDate?: string;
}

export interface AllDocumentRedactionStatusesResponse {
	/** @example 1 */
	id?: number;
	/** @example "Document redaction status" */
	name?: string;
}

export interface UpdateDocumentsRequest {
	documents?: {
		/** @example "987e66e0-1db4-404b-8213-8082919159e9" */
		id?: string;
		/** @example "2024-09-23" */
		receivedDate?: string;
		/** @example 1 */
		redactionStatus?: number;
	}[];
}

export interface UpdateDocumentsResponse {
	documents?: {
		/** @example "987e66e0-1db4-404b-8213-8082919159e9" */
		id?: string;
		/** @example "2024-09-23" */
		receivedDate?: string;
		/** @example 1 */
		redactionStatus?: number;
	}[];
}

export interface UpdateDocumentsAvCheckRequest {
	documents?: {
		/** @example "987e66e0-1db4-404b-8213-8082919159e9" */
		id?: string;
		/** @example 1 */
		version?: number;
		/** @example "scanned" */
		virusCheckStatus?: string;
	}[];
}

export interface UpdateDocumentsAvCheckResponse {
	documents?: {
		/** @example "987e66e0-1db4-404b-8213-8082919159e9" */
		id?: string;
		/** @example 1 */
		version?: number;
		/** @example "scanned" */
		virusCheckStatus?: string;
	}[];
}

export type GetAuditTrailsResponse = {
	/** @example "f7ea429b-65d8-4c44-8fc2-7f1a34069855" */
	azureAdUserId?: string;
	/** @example "The case officer 13de469c-8de6-4908-97cd-330ea73df618 was added to the team" */
	details?: string;
	/** @example "2024-09-26T16:22:20.688Z" */
	loggedDate?: string;
}[];

export interface SingleLinkableAppealSummaryResponse {
	/**
	 * ID in back-office or horizon
	 * @example "12345"
	 */
	appealId?: string;
	/**
	 * Horizon or Back Office appeal reference
	 * @example "3000359"
	 */
	appealReference?: string;
	/**
	 * Type of appeal
	 * @example "Planning Appeal (W)"
	 */
	appealType?: string;
	/**
	 * Status of appeal
	 * @example "Decision Issued"
	 */
	appealStatus?: string;
	siteAddress?: {
		/**
		 * First line of site address
		 * @example "123 Main Street"
		 */
		siteAddressLine1?: string;
		/**
		 * Second line of site address
		 * @example "Brentry"
		 */
		siteAddressLine2?: string;
		/**
		 * Site town
		 * @example "Bristol"
		 */
		siteAddressTown?: string;
		/**
		 * Site county
		 * @example "Bristol, city of"
		 */
		siteAddressCounty?: string;
		/**
		 * Site postcode
		 * @example "BS1 1AA"
		 */
		siteAddressPostcode?: string;
	};
	/**
	 * Name of Local Planning Department
	 * @example "Bristol City Council"
	 */
	localPlanningDepartment?: string;
	/**
	 * Full name of the appellant
	 * @example "Mr John Wick"
	 */
	appellantName?: string;
	/**
	 * Name of the agent
	 * @example "Mr John Smith (Smith Planning Agency)"
	 */
	agentName?: string;
	/**
	 * Date string of the submission: YYYY-MM-DDTHH:MM:SS+HH:MM
	 * @example "2014-11-14T00:00:00+00:00"
	 */
	submissionDate?: string;
	/**
	 * Information origin (back-office or horizon)
	 * @example "horizon"
	 */
	source?: string;
}

export interface ExistsOnHorizonResponse {
	/**
	 * Case found status in Horizon
	 * @example true
	 */
	caseFound?: boolean;
}

export interface UpdateServiceUserRequest {
	serviceUser?: {
		/**
		 * ID in back-office
		 * @example 12345
		 */
		serviceUserId: number;
		/**
		 * Type of user
		 * @example "agent"
		 */
		userType: string;
		/**
		 * User's organisation (optional)
		 * @example "Planning Support LTD"
		 */
		organisationName?: string;
		/**
		 * User's first name
		 * @example "Harry"
		 */
		firstName: string;
		/**
		 * User's middle name (optional)
		 * @example "James"
		 */
		middleName?: string;
		/**
		 * User's last name
		 * @example "Potter"
		 */
		lastName: string;
		/**
		 * User's email address (optional)
		 * @example "harry.potter@magic.com"
		 */
		email?: string;
		/**
		 * User's phone number (optional)
		 * @example "01179123456"
		 */
		phoneNumber?: string;
		/**
		 * User's addressId in back-office (optional)
		 * @example 13
		 */
		addressId?: number;
	};
}

export interface UpdateServiceUserResponse {
	/** @example 1 */
	serviceUserId?: number;
}

export interface WithdrawalRequestRequest {
	/** @example "2024-10-11" */
	withdrawalRequestDate?: string;
}
