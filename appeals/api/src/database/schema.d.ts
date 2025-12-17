import * as schema from '#utils/db-client/client.ts';
import { AssignedTeam } from '@pins/appeals.api';

export interface Appeal extends schema.Appeal {
	parentAppeals?: AppealRelationship[];
	childAppeals?: AppealRelationship[];
	appealStatus: AppealStatus[];
	appealType?: AppealType | null;
	lpa?: LPA | null;
	appellant?: ServiceUser | null;
	agent?: ServiceUser | null;
	procedureType?: ProcedureType | null;
	allocation?: AppealAllocation | null;
	specialisms?: AppealSpecialism[] | null;
	address?: Address | null;
	linkedAppeals?: AppealRelationship[] | null;
	relatedAppeals?: AppealRelationship[] | null;
	lpaQuestionnaire?: LPAQuestionnaire | null;
	appealTimetable?: AppealTimetable | null;
	appellantCase?: AppellantCase | null;
	assignedTeamId?: number | null;
	assignedTeam?: AssignedTeam | null;
	caseOfficer?: User | null;
	inspector?: User | null;
	padsInspector?: PADSUser | null;
	siteVisit?: SiteVisit | null;
	inspectorDecision?: InspectorDecision | null;
	neighbouringSites?: NeighbouringSite[] | null;
	folders?: Folder[] | null;
	hearing?: Hearing | null;
	appellantProcedurePreference?: string | null;
	appellantProcedurePreferenceDetails?: string | null;
	appellantProcedurePreferenceDuration?: number | null;
	representations?: Representation[] | null;
	hearingEstimate?: HearingEstimate | null;
	inquiry?: Inquiry | null;
	inquiryEstimate?: InquiryEstimate | null;
	otherAppellants?: ServiceUser[] | null;
	appealRule6Parties?: AppealRule6Party[] | null;
	appealGrounds?: AppealGround[] | null;
}
export interface CaseNote extends schema.CaseNote {
	user: User;
}
export interface AppealRelationship extends schema.AppealRelationship {
	parent?: Appeal | null;
	child?: Appeal | null;
}

export interface Hearing extends schema.Hearing {
	address: Address;
}
export interface Inquiry extends schema.Inquiry {
	address: Address;
}

export interface AppealType extends schema.AppealType {}
export interface AppealTimetable extends schema.AppealTimetable {}
export interface AppealStatus extends schema.AppealStatus {}
export interface AppealAllocation extends schema.AppealAllocation {}
export interface AppealSpecialism extends schema.AppealSpecialism {
	specialism: Specialism;
}
export interface Specialism extends schema.Specialism {}
export interface ProcedureType extends schema.ProcedureType {}
export interface LPA extends schema.LPA {}
export interface ServiceUser extends schema.ServiceUser {
	address?: Address;
}
export interface User extends schema.User {}
export interface PADSUser extends schema.PADSUser {}
export interface Address extends schema.Address {}
export interface NeighbouringSite extends schema.NeighbouringSite {
	address: Address;
}
export interface AppellantCase extends schema.AppellantCase {
	appellantCaseValidationOutcome?: AppellantCaseValidationOutcome | null;
	appellantCaseIncompleteReasonsSelected: AppellantCaseIncompleteReasonsSelected[];
	appellantCaseInvalidReasonsSelected: AppellantCaseInvalidReasons[];
	knowsAllOwners?: KnowledgeOfOtherLandowners | null;
	knowsOtherOwners?: KnowledgeOfOtherLandowners | null;
	appellantCaseAdvertDetails?: AppellantCaseAdvertDetails[];
	contactAddress?: Address | null;
}
export interface AppellantCaseValidationOutcome extends schema.AppellantCaseValidationOutcome {}
export interface AppellantCaseIncompleteReason extends schema.AppellantCaseIncompleteReason {}
export interface AppellantCaseInvalidReason extends schema.AppellantCaseInvalidReason {}
export interface AppellantCaseIncompleteReasonsSelected
	extends schema.AppellantCaseIncompleteReasonsSelected {
	appellantCaseIncompleteReason: AppellantCaseIncompleteReasons;
	appellantCaseIncompleteReasonText: AppellantCaseIncompleteReasonText[];
}
export interface AppellantCaseInvalidReasonsSelected
	extends schema.AppellantCaseInvalidReasonsSelected {
	appellantCaseInvalidReason: AppellantCaseInvalidReasons;
	appellantCaseInvalidReasonText: AppellantCaseInvalidReasonText[];
}
export interface AppellantCaseIncompleteReasonText
	extends schema.AppellantCaseIncompleteReasonText {}
export interface AppellantCaseInvalidReasonText extends schema.AppellantCaseInvalidReasonText {}
export interface KnowledgeOfOtherLandowners extends schema.KnowledgeOfOtherLandowners {}
export interface DesignatedSiteSelected extends schema.DesignatedSiteSelected {
	designatedSite: DesignatedSite;
}
export interface DesignatedSite extends schema.DesignatedSite {}
export interface LPAQuestionnaire extends schema.LPAQuestionnaire {
	lpaQuestionnaireValidationOutcome?: LPAQuestionnaireValidationOutcome | null;
	lpaQuestionnaireIncompleteReasonsSelected?: LPAQuestionnaireIncompleteReasonsSelected[] | null;
	listedBuildingDetails: ListedBuildingSelected[];
	lpaNotificationMethods: LPANotificationMethodsSelected[];
	designatedSiteNames: DesignatedSiteSelected[];
}
export interface LPAQuestionnaireValidationOutcome
	extends schema.LPAQuestionnaireValidationOutcome {}
export interface LPAQuestionnaireIncompleteReason extends schema.LPAQuestionnaireIncompleteReason {}
export interface LPAQuestionnaireIncompleteReasonsSelected
	extends schema.LPAQuestionnaireIncompleteReasonsSelected {
	lpaQuestionnaireIncompleteReason: LPAQuestionnaireIncompleteReason;
	lpaQuestionnaireIncompleteReasonText: LPAQuestionnaireIncompleteReasonText[];
}
export interface LPAQuestionnaireIncompleteReasonText
	extends schema.LPAQuestionnaireIncompleteReasonText {}
export interface ListedBuilding extends schema.ListedBuilding {}
export interface ListedBuildingSelected extends schema.ListedBuildingSelected {
	listedBuilding: ListedBuilding;
}
export interface LPANotificationMethods extends schema.LPANotificationMethods {}
export interface LPANotificationMethodsSelected extends schema.LPANotificationMethodsSelected {
	lpaNotificationMethod: LPANotificationMethods;
}
export interface SiteVisit extends schema.SiteVisit {
	siteVisitType: SiteVisitType;
	appeal?: Appeal;
}
export interface SiteVisitType extends schema.SiteVisitType {}
export interface InspectorDecision extends schema.InspectorDecision {}
export interface Folder extends schema.Folder {
	documents: Document[];
}
export interface Document extends schema.Document {
	versions?: DocumentVersion[] | null;
	latestDocumentVersion?: DocumentVersion | null;
	case?: Appeal;
	versionAudit?: DocumentVersionAudit[] | null;
}
export interface DocumentVersion extends schema.DocumentVersion {
	redactionStatus?: DocumentRedactionStatus | null;
	representation?: RepresentationAttachment | null;
	document?: Document | null;
}
export interface DocumentVersionAvScan extends schema.DocumentVersionAvScan {}

export interface DocumentVersionAudit extends schema.DocumentVersionAudit {
	auditTrail: AuditTrail;
}
export interface DocumentRedactionStatus extends schema.DocumentRedactionStatus {
	id: number;
	key: string;
	name: string;
}

export interface AuditTrailDoc {
	document: Document | null;
}

export interface AuditTrail extends schema.AuditTrail {
	user?: User | null;
	doc?: AuditTrailDoc | null;
}

export interface Representation extends schema.Representation {
	attachments?: RepresentationAttachment[];
	represented?: ServiceUser | null;
	representative?: ServiceUser | null;
	lpa?: LPA | null;
	representationRejectionReasonsSelected?: RepresentationRejectionReasonsSelected[];
}

export interface RepresentationAttachment extends schema.RepresentationAttachment {
	documentVersion: DocumentVersion;
	representation: Representation;
}

export interface RepresentationRejectionReason extends schema.RepresentationRejectionReason {
	representationRejectionReasonsSelected: RepresentationRejectionReasonsSelected[];
}

export interface RepresentationRejectionReasonsSelected
	extends schema.RepresentationRejectionReasonsSelected {
	representationRejectionReason: RepresentationRejectionReason;
	representation: Representation;
	representationRejectionReasonText: RepresentationRejectionReasonText[];
}

export interface RepresentationRejectionReasonText
	extends schema.RepresentationRejectionReasonText {
	representationRejectionReasonsSelected: RepresentationRejectionReasonsSelected;
}

export interface AppealNotification extends schema.AppealNotification {}
export interface HearingEstimate extends schema.HearingEstimate {}
export interface InquiryEstimate extends schema.InquiryEstimate {}

export interface AppealRelationship extends schema.AppealRelationship {}

export interface PersonalList extends schema.PersonalList {}

export interface Ground extends schema.Ground {
	groundRef: string;
	groundDescription: string;
}
export interface AppealGround extends AppealGround {
	factsForGround: string | null;
	ground: Ground | null;
	appealId: number | null;
	groundId: number | null;
}
