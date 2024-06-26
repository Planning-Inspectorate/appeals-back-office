import { RedactionStatus } from '#repositories/document-metadata.repository';
import * as schema from '#utils/db-client';
import { CaseOfficer, Inspector } from '@pins/appeals';

export interface Appeal extends schema.Appeal {
	parentAppeals: AppealRelationship[];
	childAppeals: AppealRelationship[];
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
	lpaQuestionnaire?: LPAQuestionnaire | null;
	caseOfficer?: User | null;
	inspector?: User | null;
	siteVisit?: SiteVisit | null;
	inspectorDecision?: InspectorDecision | null;
	neighbouringSites?: NeighbouringSite[] | null;
	folders?: Folder[] | null;
}
export interface AppealRelationship extends schema.AppealRelationship {}
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
	address: Address;
}
export interface User extends schema.User {}
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
export interface LPAQuestionnaire extends schema.LPAQuestionnaire {
	lpaQuestionnaireValidationOutcome?: LPAQuestionnaireValidationOutcome | null;
	lpaQuestionnaireIncompleteReasonsSelected?: LPAQuestionnaireIncompleteReasonsSelected[] | null;
	listedBuildingDetails: ListedBuildingSelected[];
	lpaNotificationMethods: LPANotificationMethodsSelected[];
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
export interface ListedBuildingSelected extends schema.ListedBuildingSelected {}
export interface LPANotificationMethods extends schema.LPANotificationMethods {}
export interface LPANotificationMethodsSelected extends schema.LPANotificationMethodsSelected {
	lpaNotificationMethod: LPANotificationMethods;
}
export interface SiteVisit extends schema.SiteVisit {
	siteVisitType: SiteVisitType;
	appeal: Appeal;
}
export interface SiteVisitType extends schema.SiteVisitType {}
export interface InspectorDecision extends schema.InspectorDecision {}
export interface Folder extends schema.Folder {
	documents: Document[];
}
export interface Document extends schema.Document {
	versions?: DocumentVersion[] | null;
	latestDocumentVersion?: DocumentVersion | null;
	versions?: DocumentVersion[] | null;
	case?: Appeal;
	versionAudit?: DocumentVersionAudit[] | null;
}
export interface DocumentVersion extends schema.DocumentVersion {
	redactionStatus?: DocumentRedactionStatus | null;
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
export interface AuditTrail extends schema.AuditTrail {
	user?: User | null;
}
