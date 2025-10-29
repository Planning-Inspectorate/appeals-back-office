import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';

export const VALIDATION_OUTCOME_COMPLETE = 'Complete';
export const VALIDATION_OUTCOME_INCOMPLETE = 'Incomplete';
export const VALIDATION_OUTCOME_INVALID = 'Invalid';
export const VALIDATION_OUTCOME_VALID = 'Valid';
export const VALIDATION_OUTCOME_CANCEL = 'Cancel';

export const CASE_OUTCOME_ALLOWED = 'allowed';
export const CASE_OUTCOME_DISMISSED = 'dismissed';
export const CASE_OUTCOME_SPLIT_DECISION = 'split decision';
export const CASE_OUTCOME_INVALID = 'invalid';

export const CHANGE_APPEAL_TYPE_INVALID_REASON = 'Wrong appeal type';

export const DECISION_TYPE_INSPECTOR = 'inspector-decision';
export const DECISION_TYPE_APPELLANT_COSTS = 'appellant-costs-decision';
export const DECISION_TYPE_LPA_COSTS = 'lpa-costs-decision';

export const AUDIT_TRAIL_REP_SHARED = '{replacement0} shared';

export const AUDIT_TRAIL_REP_APPELLANT_STATEMENT_STATUS_UPDATED =
	'Appellant statement status updated to {replacement0}';

//LPA statement rep logs
export const AUDIT_TRAIL_REP_LPA_STATEMENT_STATUS_VALID = 'LPA statement accepted';
export const AUDIT_TRAIL_REP_LPA_STATEMENT_STATUS_INCOMPLETE = 'LPA statement incomplete';
export const AUDIT_TRAIL_REP_LPA_STATEMENT_STATUS_REDACTED_AND_ACCEPTED =
	'LPA statement redacted and accepted';

//Interested party comment rep logs
export const AUDIT_TRAIL_REP_COMMENT_STATUS_VALID = 'Interested party comment accepted';
export const AUDIT_TRAIL_REP_COMMENT_STATUS_INVALID = 'Interested party comment rejected';
export const AUDIT_TRAIL_REP_COMMENT_STATUS_REDACTED_AND_ACCEPTED =
	'Interested party comment redacted and accepted';

//LPA final comment rep logs
export const AUDIT_TRAIL_REP_LPA_FINAL_COMMENT_STATUS_VALID = 'LPA final comments accepted';
export const AUDIT_TRAIL_REP_LPA_FINAL_COMMENT_STATUS_INVALID = 'LPA final comments rejected';
export const AUDIT_TRAIL_REP_LPA_FINAL_COMMENT_STATUS_REDACTED_AND_ACCEPTED =
	'LPA final comments redacted and accepted';

//Appellant final comment rep logs
export const AUDIT_TRAIL_REP_APPELLANT_FINAL_COMMENT_STATUS_VALID =
	'Appellant final comments accepted';
export const AUDIT_TRAIL_REP_APPELLANT_FINAL_COMMENT_STATUS_INVALID =
	'Appellant final comments rejected';
export const AUDIT_TRAIL_REP_APPELLANT_FINAL_COMMENT_STATUS_REDACTED_AND_ACCEPTED =
	'Appellant final comments redacted and accepted';

export const APPEAL_TYPE_SHORTHAND_FPA = 'W';
export const APPEAL_TYPE_SHORTHAND_HAS = 'D';
export const APPEAL_TYPE_SHORTHAND_HEARING = 'H';
export const APPEAL_TYPE_SHORTHAND_INQUIRY = 'I';

export const AUDIT_TRAIL_ALLOCATION_DETAILS_ADDED = 'The allocation details were added';
export const AUDIT_TRAIL_CASE_NOTE_ADDED = 'Case note added: "{replacement0}"';
export const AUDIT_TRAIL_APPELLANT_IMPORT_MSG = 'The appellant case was received';
export const AUDIT_TRAIL_ASSIGNED_CASE_OFFICER =
	'The case officer {replacement0} was added to the team';
export const AUDIT_TRAIL_ASSIGNED_INSPECTOR =
	'The inspector {replacement0} was assigned to the case';
export const AUDIT_TRAIL_UNASSIGNED_INSPECTOR =
	'The inspector {replacement0} was unassigned from the case';
export const AUDIT_TRAIL_MODIFIED_APPEAL = 'The {replacement0} property was updated';
export const AUDIT_TRAIL_CASE_STARTED = 'Appeal started\nAppeal procedure: {replacement0}';
export const AUDIT_TRAIL_CASE_TIMELINE_CREATED = 'The case timeline was created';
export const AUDIT_TRAIL_CASE_TIMELINE_UPDATED = 'The case timeline was updated';
export const AUDIT_TRAIL_TIMETABLE_DUE_DATE_CHANGED =
	'{replacement0} due date changed to {replacement1}';
export const AUDIT_TRAIL_DOCUMENT_UPLOADED =
	'Document {replacement0} uploaded (version {replacement1}, {replacement2})';
export const AUDIT_TRAIL_DOCUMENT_IMPORTED = 'The document {replacement0} was received';
export const AUDIT_TRAIL_DOCUMENT_DELETED =
	'Version {replacement1} of document {replacement0} was removed';
export const AUDIT_TRAIL_DOCUMENT_REDACTED =
	'Document {replacement0} (version {replacement1}) marked as redacted';
export const AUDIT_TRAIL_DOCUMENT_UNREDACTED =
	'Document {replacement0} (version {replacement1}) marked as unredacted';
export const AUDIT_TRAIL_DOCUMENT_NO_REDACTION_REQUIRED =
	'Document {replacement0} (version {replacement1}) marked as requiring no redaction';
export const AUDIT_TRAIL_DOCUMENT_DATE_CHANGED =
	'Document {replacement0} (version {replacement1}) received date changed';
export const AUDIT_TRAIL_DOCUMENT_NAME_CHANGED =
	'Document {replacement0} has been updated to {replacement1}';
export const AUDIT_TRAIL_LPAQ_IMPORT_MSG = 'The LPA questionnaire was received';
export const AUDIT_TRAIL_REP_IMPORT_MSG = '{replacement0} was received';
export const AUDIT_TRAIL_PROGRESSED_TO_STATUS = 'Case progressed to {replacement0}';
export const AUDIT_TRAIL_LPAQ_INCOMPLETE = '{replacement0} marked as incomplete';
export const AUDIT_TRAIL_SUBMISSION_INCOMPLETE = '{replacement0} marked as incomplete:';
export const AUDIT_TRAIL_SUBMISSION_INVALID = 'Appeal reviewed as invalid:';
export const AUDIT_TRAIL_REMOVED_CASE_OFFICER =
	'The case officer {replacement0} was removed from the team';
export const AUDIT_TRAIL_REMOVED_INSPECTOR =
	'The inspector {replacement0} was removed from the case';
export const AUDIT_TRAIL_SITE_VISIT_ARRANGED = 'The site visit was arranged for {replacement0}';
export const AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED = 'The site visit type was selected';
export const AUDIT_TRAIL_APPEAL_LINK_ADDED = 'Linked appeal {replacement0} added';
export const AUDIT_TRAIL_APPEAL_LINK_REMOVED = 'Linked appeal {replacement0} removed';
export const AUDIT_TRAIL_APPEAL_RELATION_ADDED = 'A related appeal was added';
export const AUDIT_TRAIL_APPEAL_RELATION_REMOVED = 'A related appeal was removed';
export const AUDIT_TRAIL_APPLICATION_REFERENCE_UPDATED = 'Planning application reference updated';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_ADDED = 'A neighbouring address was added';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_UPDATED = 'A neighbouring address was updated';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_REMOVED = 'A neighbouring address was removed';
export const AUDIT_TRAIL_SYSTEM_UUID = '00000000-0000-0000-0000-000000000000';
export const AUDIT_TRIAL_APPELLANT_UUID = '00000000-0000-0000-0000-000000000001';
export const AUDIT_TRAIL_LPA_UUID = '00000000-0000-0000-0000-000000000002';
export const AUDIT_TRAIL_IP_UUID = '00000000-0000-0000-0000-000000000003';
export const AUDIT_TRIAL_AUTOMATIC_EVENT_UUID = '00000000-0000-0000-0000-000000000004';
export const AUDIT_TRAIL_SERVICE_USER_UPDATED =
	'{replacement0} contact details updated to\n{replacement1}';
export const AUDIT_TRAIL_SERVICE_USER_ADDRESS_UPDATED =
	"The {replacement0}'s address details were updated";
export const AUDIT_TRAIL_SERVICE_USER_REMOVED = 'The {replacement0} was removed';
export const AUDIT_TRAIL_ADDRESS_UPDATED = 'Site address updated to\n{replacement0}';
export const AUDIT_TRAIL_APPELLANT_CASE_UPDATED = 'Case updated';
export const AUDIT_TRAIL_DEVELOPMENT_TYPE_UPDATED = 'Development type updated to {replacement0}';
export const AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED = 'Site area updated to {replacement0} m²';
export const AUDIT_TRAIL_HIGHWAY_LAND_UPDATED =
	"'Is the appeal site on highway land?' updated to {replacement0}";
export const AUDIT_TRAIL_IS_GREEN_BELT_UPDATED =
	"'Is the site in a green belt?' updated to {replacement0}";
export const AUDIT_TRAIL_LANDOWNER_PERMISSION_UPDATED =
	"'Do you have the landowner's permission?' updated to {replacement0}";
export const AUDIT_TRAIL_ADVERT_IN_POSITION_UPDATED =
	"'Is the advertisement in position?' updated to {replacement0}'";
export const AUDIT_TRAIL_SITE_OWNERSHIP_UPDATED =
	"'Does the appellant own all of the land involved in the appeal?' updated to {replacement0}";
export const AUDIT_TRAIL_KNOWS_OTHER_OWNERS_UPDATED =
	"'Does the appellant know who owns the land involved in the appeal?' updated to {replacement0}";
export const AUDIT_TRAIL_SITE_ACCESS_DETAILS_UPDATED =
	"'Will an inspector need to access your land or property?' updated to\n{replacement0}";
export const AUDIT_TRAIL_SITE_SAFETY_DETAILS_UPDATED =
	"'Are there any health and safety issues on the appeal site?' updated to {replacement0}";
export const AUDIT_TRAIL_APPLICATION_DATE_UPDATED =
	'Application submitted date updated to {replacement0}';
export const AUDIT_TRAIL_DEVELOPMENT_DESCRIPTION_UPDATED =
	'Description of development updated to\n{replacement0}';
export const AUDIT_TRAIL_APPLICATION_DECISION_DATE_UPDATED =
	'Application decision date updated to {replacement0}';
export const AUDIT_TRAIL_AGRICULTURAL_HOLDING_UPDATED =
	"'Is the appeal site part of an agricultural holding?' updated to {replacement0}";
export const AUDIT_TRAIL_TENANT_AGRICULTURAL_HOLDING_UPDATED =
	"'Are you a tenant of the agricultural holding?' updated to {replacement0}";
export const AUDIT_TRAIL_OTHER_TENANTS_AGRICULTURAL_HOLDING_UPDATED =
	"'Are there any other tenants?' updated to {replacement0}";
export const AUDIT_TRAIL_APPLICATION_DECISION_UPDATED =
	"'Was your application granted or refused?' updated to {replacement0}";
export const AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_UPDATED =
	"'How would you prefer us to decide your appeal?' updated to {replacement0}";
export const AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_DETAILS_UPDATED =
	"'Why would you prefer this appeal procedure?' updated to {replacement0}";
export const AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_DURATION_UPDATED =
	"'How many days would you expect the inquiry to last?' updated to {replacement0}";
export const AUDIT_TRAIL_APPELLANT_PROCEDURE_PREFERENCE_WITNESS_COUNT_UPDATED =
	"'How many witnesses would you expect to give evidence at the inquiry?' updated to {replacement0}";
export const AUDIT_TRAIL_STATUS_PLANNING_OBLIGATION_UPDATED =
	"'What is the status of your planning obligation?' updated to {replacement0}";
export const AUDIT_TRAIL_LPAQ_UPDATED = 'LPA questionnaire updated';
export const AUDIT_TRAIL_LPAQ_IS_CORRECT_APPEAL_TYPE_UPDATED =
	'Correct appeal type (LPA response) has been updated';
export const AUDIT_TRAIL_LPAQ_IS_GREEN_BELT_UPDATED = 'Green belt status updated';
export const AUDIT_TRAIL_LPAQ_SITE_ACCESS_DETAILS_UPDATED = 'Inspector access (lpa) updated';
export const AUDIT_TRAIL_LPAQ_SITE_SAFETY_DETAILS_UPDATED =
	'Site health and safety risks (LPA answer) updated';
export const AUDIT_TRAIL_LPAQ_HAS_PROTECTED_SPECIES_UPDATED = 'Protected species status updated';
export const AUDIT_TRAIL_LPAQ_AFFECTS_SCHEDULED_MONUMENT_UPDATED =
	'Scheduled monument status updated';
export const AUDIT_TRAIL_LPAQ_IS_AONB_NATIONAL_LANDSCAPE_UPDATED =
	'Outstanding natural beauty area status updated';
export const AUDIT_TRAIL_LPAQ_IS_GYPSY_OR_TRAVELLER_SITE_UPDATED =
	'Gypsy or Traveller communities status updated';
export const AUDIT_TRAIL_LPAQ_HAS_INFRASTRUCTURE_LEVY_UPDATED =
	'Community infrastructure levy status updated';
export const AUDIT_TRAIL_LPAQ_IS_INFRASTRUCTURE_LEVY_FORMALLY_ADOPTED_UPDATED =
	'Levy formally adopted status updated';
export const AUDIT_TRAIL_LPAQ_INFRASTRUCTURE_LEVY_ADOPTED_DATE_UPDATED =
	'Levy adoption date changed';
export const AUDIT_TRAIL_LPAQ_INFRASTRUCTURE_LEVY_EXPECTED_DATE_UPDATED =
	'Expected levy adoption date changed';
export const AUDIT_TRAIL_LPAQ_LPA_PROCEDURE_PREFERENCE_UPDATED = 'Procedure preference updated';
export const AUDIT_TRAIL_LPAQ_LPA_PROCEDURE_PREFERENCE_DETAILS_UPDATED =
	'Reason for preference updated';
export const AUDIT_TRAIL_LPAQ_LPA_PROCEDURE_PREFERENCE_DURATION_UPDATED =
	'Expected length of procedure updated';
export const AUDIT_TRAIL_LPAQ_EIA_SENSITIVE_AREA_DETAILS_UPDATED =
	'In, partly in, or likely to affect a sensitive area changed';
export const AUDIT_TRAIL_LPAQ_EIA_CONSULTED_BODIES_DETAILS_UPDATED =
	'Consulted relevant statutory consultees changed';
export const AUDIT_TRAIL_LPAQ_REASON_FOR_NEIGHBOUR_VISITS_UPDATED =
	'Inspector needs neighbouring site access changed';
export const AUDIT_TRAIL_LPAQ_DESIGNATED_SITE_NAMES_UPDATED =
	'In, near or likely to effect designated sites changed';
export const AUDIT_TRAIL_LPAQ_IS_SITE_IN_AREA_OF_SPECIAL_CONTROL_ADVERTS_UPDATED =
	'‘Is the site in an area of special control of advertisements?’ updated to {replacement0}';
export const AUDIT_TRAIL_LPAQ_WAS_APPLICATION_REFUSED_DUE_TO_HIGHWAY_OR_TRAFFIC_UPDATED =
	'‘Did you refuse the application because of highway or traffic public safety?’ updated to {replacement0}';
export const AUDIT_TRAIL_LPAQ_DID_APPELLANT_SUBMIT_COMPLETE_PHOTOS_AND_PLANS_UPDATED =
	'‘Did the appellant submit complete and accurate photographs and plans?’ updated to {replacement0}';
export const AUDIT_TRAIL_TEAM_ASSIGNED = 'Case team {replacement0} assigned';
export const AUDIT_TRAIL_RECORD_MISSED_SITE_VISIT = '{replacement0} missed the site visit';

export const AUDIT_TRAIL_LISTED_BUILDING_ADDED = 'A listed building was added';
export const AUDIT_TRAIL_LISTED_BUILDING_UPDATED = 'A listed building was updated';
export const AUDIT_TRAIL_LISTED_BUILDING_REMOVED = 'A listed building was removed';

export const AUDIT_TRAIL_LPA_UPDATED = 'LPA updated to {replacement0}';

export const AUDIT_TRAIL_HEARING_SET_UP = 'Hearing set up on {replacement0}';
export const AUDIT_TRAIL_HEARING_DATE_UPDATED = 'Hearing date updated to {replacement0}';
export const AUDIT_TRAIL_HEARING_ADDRESS_ADDED = 'The hearing address has been added';
export const AUDIT_TRAIL_HEARING_ADDRESS_UPDATED = 'Hearing address updated to {replacement0}';
export const AUDIT_TRAIL_HEARING_CANCELLED = 'Hearing cancelled';
export const AUDIT_TRAIL_HEARING_ESTIMATES_ADDED = 'Hearing estimates added';
export const AUDIT_TRAIL_HEARING_ESTIMATES_UPDATED = 'Hearing estimates updated';
export const AUDIT_TRAIL_HEARING_ESTIMATES_REMOVED = 'Hearing estimates removed';

export const AUDIT_TRAIL_INQUIRY_SET_UP = 'Inquiry set up on {replacement0}';
export const AUDIT_TRAIL_INQUIRY_DATE_UPDATED = 'Inquiry date updated to {replacement0}';
export const AUDIT_TRAIL_INQUIRY_ADDRESS_ADDED = 'The inquiry address has been added';
export const AUDIT_TRAIL_INQUIRY_ADDRESS_UPDATED = 'Inquiry address updated to {replacement0}';
export const AUDIT_TRAIL_INQUIRY_CANCELLED = 'Inquiry cancelled';
export const AUDIT_TRAIL_INQUIRY_ESTIMATES_ADDED = 'Inquiry estimates added';
export const AUDIT_TRAIL_INQUIRY_ESTIMATES_UPDATED = 'Inquiry estimates updated';
export const AUDIT_TRAIL_INQUIRY_ESTIMATES_REMOVED = 'Inquiry estimates removed';

export const AUDIT_TRAIL_CHANGE_PROCEDURE_TYPE =
	'Appeal procedure type changed from {replacement0} to {replacement1}';

export const AUDIT_TRAIL_DECISION_ISSUED = 'Decision issued: {replacement0}';
export const AUDIT_TRAIL_DECISION_LETTER_UPLOADED = 'Decision letter {replacement0} uploaded';
export const AUDIT_TRAIL_DECISION_LETTER_UPDATED = 'Decision letter {replacement0} updated';
export const AUDIT_TRAIL_CORRECTION_NOTICE_ADDED = 'Correction notice added: {replacement0} ';
export const AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED = 'Appellant costs decision issued';
export const AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED = 'LPA costs decision issued';
export const AUDIT_TRAIL_SITE_VISIT_CANCELLED = 'Site visit cancelled';

export const AUDIT_TRAIL_APPEAL_TYPE_TRANSFERRED = 'Appeal marked as {replacement0}';
export const AUDIT_TRAIL_APPEAL_TYPE_UPDATED = 'Appeal type updated to {replacement0}';

export const AUDIT_TRAIL_HORIZON_REFERENCE_UPDATED = 'Horizon reference updated';

export const AUDIT_TRAIL_ASSIGNED_TEAM_UPDATED = 'Case team {replacement0} assigned';
export const BANK_HOLIDAY_FEED_DIVISION_ENGLAND = 'england-and-wales';

export const DATABASE_ORDER_BY_ASC = 'asc';
export const DATABASE_ORDER_BY_DESC = 'desc';

export const DEFAULT_DATE_FORMAT_AUDIT_TRAIL = 'EEEE d MMMM';
export const DEFAULT_DATE_FORMAT_DATABASE = 'yyyy-MM-dd';
export const DEFAULT_DATE_FORMAT_DISPLAY = 'dd LLL yyyy';
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 30;
export const DEFAULT_TIME_FORMAT = 'HH:mm';
export const DEFAULT_TIMESTAMP_TIME = '01:00:00.000';

export const DOCUMENT_STATUS_NOT_RECEIVED = 'not_received';
export const DOCUMENT_STATUS_RECEIVED = 'received';

export const ERROR_APPEAL_ALLOCATION_LEVELS = 'invalid allocation level';
export const ERROR_APPEAL_ALLOCATION_SPECIALISMS = 'invalid allocation specialism';
export const ERROR_CANNOT_BE_EMPTY_STRING = 'cannot be an empty string';
export const ERROR_DOCUMENT_REDACTION_STATUSES_MUST_BE_ONE_OF =
	'document redaction statuses must be one of {replacement0}';
export const ERROR_DOCUMENT_AV_RESULT_STATUSES_MUST_BE_ONE_OF =
	'document AV check statuses must be one of {replacement0}';
export const ERROR_FAILED_TO_ADD_DOCUMENTS = 'failed to add documents';
export const ERROR_DOCUMENT_NAME_ALREADY_EXISTS = 'a document with the same name already exists';
export const ERROR_FAILED_TO_GET_DATA = 'failed to get data';
export const ERROR_FAILED_TO_SAVE_DATA = 'failed to save data';
export const ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL = 'failed to send notification email';
export const ERROR_FAILED_TO_POPULATE_NOTIFICATION_EMAIL =
	'failed to populate notification email due to {replacement0}';
export const ERROR_GOV_NOTIFY_CONNECTIVITY =
	'Gov notify connectivity. Error Code: {replacement0}, template ID: {replacement1}';
export const ERROR_NO_RECIPIENT_EMAIL = 'recipient email not found';
export const ERROR_GOV_NOTIFY_API_KEY_NOT_SET = 'gov notify api key is not set';
export const ERROR_NOTIFICATION_PERSONALISATION = 'email personalisation is incorrect';
export const ERROR_INVALID_APPEAL_TYPE = `must be one of ${APPEAL_TYPE_SHORTHAND_FPA}, ${APPEAL_TYPE_SHORTHAND_HAS}`;
export const ERROR_INVALID_APPEAL_TYPE_REP = `Representations not accepted on this appeal type`;
export const ERROR_INVALID_APPELLANT_CASE_VALIDATION_OUTCOME = `must be one of ${VALIDATION_OUTCOME_INCOMPLETE}, ${VALIDATION_OUTCOME_INVALID}, ${VALIDATION_OUTCOME_VALID}`;
export const ERROR_INVALID_LPA_QUESTIONNAIRE_VALIDATION_OUTCOME = `must be one of ${VALIDATION_OUTCOME_COMPLETE}, ${VALIDATION_OUTCOME_INCOMPLETE}`;
export const ERROR_INVALID_SITE_VISIT_TYPE =
	'must be one of access required, accompanied, unaccompanied';
export const ERROR_INVALID_REPRESENTATION_TYPE = `must be one of ${Object.values(
	APPEAL_REPRESENTATION_TYPE
).join(', ')}`;
export const ERROR_LENGTH_BETWEEN_2_AND_8_CHARACTERS = 'must be between 2 and 8 characters';
export const ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS = (
	/** @type {string} */ min,
	/** @type {string} */ max
) => `must be between ${min} and ${max} characters`;
export const ERROR_MAX_LENGTH_CHARACTERS = 'must be {replacement0} characters or less';
export const ERROR_MUST_BE_ARRAY_OF_NUMBERS = 'must be an array of numbers';
export const ERROR_MUST_BE_ARRAY_OF_STRINGS = 'must be an array of strings';
export const ERROR_MUST_BE_BOOLEAN = 'must be a boolean';
export const ERROR_MUST_BE_BUSINESS_DAY = 'must be a business day';
export const ERROR_MUST_BE_CORRECT_DATE_FORMAT = `must be a real date and in the format ${DEFAULT_DATE_FORMAT_DATABASE}`;
export const ERROR_MUST_BE_CORRECT_TIME_FORMAT = 'must be a valid time and in the format hh:mm';
export const ERROR_MUST_BE_CORRECT_UTC_DATE_FORMAT = 'must be a valid utc date time format';
export const ERROR_MUST_BE_GREATER_THAN_ZERO = 'must be greater than 0';
export const ERROR_MUST_BE_IN_FUTURE = 'must be in the future';
export const ERROR_MUST_BE_IN_PAST = 'must be in the past';
export const ERROR_MUST_NOT_BE_IN_FUTURE = 'must not be in the future';
export const ERROR_MUST_BE_INCOMPLETE_INVALID_REASON =
	'must be an array of objects containing a required id number parameter and an optional text string array parameter containing 10 or less items';
export const ERROR_MUST_BE_NUMBER = 'must be a number';
export const ERROR_NUMBER_RANGE = 'must be a number between {replacement0} and {replacement1}';
export const ERROR_NUMBER_INCREMENTS = 'must be in increments of {replacement0}';
export const ERROR_MUST_BE_SET_AS_HEADER = 'must be set as a header';
export const ERROR_MUST_BE_STRING = 'must be a string';
export const ERROR_MUST_BE_UUID = 'must be a uuid';
export const ERROR_MUST_BE_VALID_FILEINFO = 'must be a valid file';
export const ERROR_MUST_BE_VALID_APPEAL_STATE = 'must be a valid appeal state';
export const ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE = 'must contain at least one value';
export const ERROR_MUST_HAVE_DETAILS =
	'must have {replacement0} when {replacement1} is {replacement2}';
export const ERROR_MUST_NOT_HAVE_DETAILS =
	'must not have {replacement0} when {replacement1} is {replacement2}';
export const ERROR_MUST_NOT_HAVE_TIMETABLE_DATE =
	'must not be included for a {replacement0} appeal type';
export const ERROR_NOT_FOUND = 'Not found';
export const ERROR_ONLY_FOR_INCOMPLETE_VALIDATION_OUTCOME = `should only be given if the validation outcome is ${VALIDATION_OUTCOME_INCOMPLETE}`;
export const ERROR_ONLY_FOR_INVALID_VALIDATION_OUTCOME = `should only be given if the validation outcome is ${VALIDATION_OUTCOME_INVALID}`;
export const ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED =
	'both pageNumber and pageSize are required for pagination';
export const ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCOMPANIED =
	'if visit type is accompanied, if visitDate or visitStartTime are given, both these fields are required';
export const ERROR_SITE_VISIT_REQUIRED_FIELDS_ACCESS_REQUIRED =
	'is visit type is access required, if visitDate, visitStartTime or visitEndTime are given, all these fields are required';
export const ERROR_START_TIME_MUST_BE_EARLIER_THAN_END_TIME =
	'start time must be earlier than end time';
export const ERROR_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED =
	'validation outcome reasons are required when validationOutcome is Incomplete or Invalid';
export const ERROR_LPA_QUESTIONNAIRE_VALID_VALIDATION_OUTCOME_REASONS_REQUIRED =
	'validation outcome reasons are required when validationOutcome is Incomplete';

export const ERROR_INVALID_APPELLANT_CASE_DATA =
	'The integration payload APPELLANT_CASE is invalid.';
export const ERROR_INVALID_LPAQ_DATA = 'The integration payload LPA_QUESTIONNAIRE is invalid.';
export const ERROR_INVALID_REP_DATA = 'The integration payload APPEAL_REPRESENTATION is invalid.';
export const ERROR_INVALID_DOCUMENT_DATA = 'The integration payload DOCUMENT is invalid.';
export const ERROR_INVALID_LISTED_BUILDING_DATA =
	'The integration payload LISTED_BUILDING is invalid.';
export const ERROR_INVALID_APPEAL_STATE = 'The action is invalid on the current appeal state.';
export const ERROR_CASE_OUTCOME_MUST_BE_ONE_OF = `The case outcome must be one of ${CASE_OUTCOME_ALLOWED}, ${CASE_OUTCOME_DISMISSED}, ${CASE_OUTCOME_SPLIT_DECISION}`;
export const ERROR_REP_OUTCOME_MUST_BE_ONE_OF = `The representation status must be one of ${APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW}, ${APPEAL_REPRESENTATION_STATUS.INVALID}, ${APPEAL_REPRESENTATION_STATUS.VALID}`;
export const ERROR_REP_ONLY_STATEMENT_INCOMPLETE = 'Only LPA statements can be set to incomplete';
export const ERROR_REP_PUBLISH_USING_ENDPOINT =
	'LPA statements and final comments can only be published using the dedicated endpoint';
export const ERROR_REP_PUBLISH_BLOCKED = 'Publishing of LPA statements and ip comments is blocked';
export const ERROR_LINKING_APPEALS =
	'The appeals cannot be linked as the lead or child are already linked to other appeals.';
export const ERROR_INVALID_EMAIL = 'must be a valid email';
export const ERROR_INVALID_FILENAME = 'must be a valid filename';
export const ERROR_INVALID_PROOF_OF_EVIDENCE_TYPE = 'must be either appellant or lpa';
export const ERROR_ATTACHMENTS_REQUIRED = 'Attachments field is required';
export const ERROR_ATTACHMENTS_EMPTY = 'Attachments must be a non-empty array';
export const ERROR_INVALID_PROCEDURE_TYPE = 'Invalid appeal procedure type';

export const ERROR_INVALID_POSTCODE = 'needs to be a valid and include spaces';
export const UK_POSTCODE_REGEX = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/gm;

export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const NUMERIC_INPUT_REGEX = /^[,0-9 ]+$/;
export const LENGTH_1 = 1;
export const LENGTH_8 = 8;
export const LENGTH_10 = 10;
export const LENGTH_250 = 250;
export const LENGTH_300 = 300;
export const LENGTH_1000 = 1000;
export const LENGTH_8000 = 8000;

export const NODE_ENV_PRODUCTION = 'production';

export const SITE_VISIT_TYPE_UNACCOMPANIED = 'Unaccompanied';
export const SITE_VISIT_TYPE_ACCOMPANIED = 'Accompanied';
export const SITE_VISIT_TYPE_ACCESS_REQUIRED = 'Access required';

export const STATE_TYPE_FINAL = 'final';

export const USER_TYPE_CASE_OFFICER = 'caseOfficer';
export const USER_TYPE_INSPECTOR = 'inspector';

export const CASE_RELATIONSHIP_LINKED = 'linked';
export const CASE_RELATIONSHIP_RELATED = 'related';

// Static config
export const CONFIG_BANKHOLIDAYS_FEED_URL = 'https://www.gov.uk/bank-holidays.json';

const s78timetable = {
	lpaQuestionnaireDueDate: {
		daysFromStartDate: 5
	},
	ipCommentsDueDate: {
		daysFromStartDate: 25
	},
	appellantStatementDueDate: {
		daysFromStartDate: 25
	},
	lpaStatementDueDate: {
		daysFromStartDate: 25
	},
	finalCommentsDueDate: {
		daysFromStartDate: 35
	},
	s106ObligationDueDate: {
		daysFromStartDate: 35
	}
};

export const CONFIG_APPEAL_TIMETABLE = {
	W: {
		...s78timetable
	},
	H: {
		...s78timetable,
		statementOfCommonGroundDueDate: {
			daysFromStartDate: 25
		}
	},
	I: {
		...s78timetable,
		statementOfCommonGroundDueDate: {
			daysFromStartDate: 25
		}
	},
	D: {
		lpaQuestionnaireDueDate: {
			daysFromStartDate: 5
		}
	}
};
