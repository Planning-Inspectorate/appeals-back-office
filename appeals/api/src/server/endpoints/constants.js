import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';

export const VALIDATION_OUTCOME_COMPLETE = 'Complete';
export const VALIDATION_OUTCOME_INCOMPLETE = 'Incomplete';
export const VALIDATION_OUTCOME_INVALID = 'Invalid';
export const VALIDATION_OUTCOME_VALID = 'Valid';

export const CASE_OUTCOME_ALLOWED = 'allowed';
export const CASE_OUTCOME_DISMISSED = 'dismissed';
export const CASE_OUTCOME_SPLIT_DECISION = 'split decision';
export const CASE_OUTCOME_INVALID = 'invalid';

export const AUDIT_TRAIL_REP_LPA_STATEMENT_STATUS_UPDATED =
	'LPA statement status updated to {replacement0}';
export const AUDIT_TRAIL_REP_APPELLANT_STATEMENT_STATUS_UPDATED =
	'Appellant statement status updated to {replacement0}';
export const AUDIT_TRAIL_REP_COMMENT_STATUS_UPDATED = 'Comment status updated to {replacement0}';
export const AUDIT_TRAIL_REP_LPA_FINAL_COMMENT_STATUS_UPDATED =
	'LPA final comment status updated to {replacement0}';
export const AUDIT_TRAIL_REP_APPELLANT_FINAL_COMMENT_STATUS_UPDATED =
	'Appellant final comment status updated to {replacement0}';
export const AUDIT_TRAIL_REP_LPA_FINAL_COMMENT_REDACTED_AND_ACCEPTED =
	'LPA final comment redacted and accepted';
export const AUDIT_TRAIL_REP_APPELLANT_FINAL_COMMENT_REDACTED_AND_ACCEPTED =
	'Appellant final comment redacted and accepted';
export const APPEAL_TYPE_SHORTHAND_FPA = 'W';
export const APPEAL_TYPE_SHORTHAND_HAS = 'D';

export const AUDIT_TRAIL_ALLOCATION_DETAILS_ADDED = 'The allocation details were added';
export const AUDIT_TRAIL_CASE_NOTE_ADDED = 'Case note added: "{replacement0}"';
export const AUDIT_TRAIL_APPELLANT_IMPORT_MSG = 'The appellant case was received';
export const AUDIT_TRAIL_ASSIGNED_CASE_OFFICER =
	'The case officer {replacement0} was added to the team';
export const AUDIT_TRAIL_ASSIGNED_INSPECTOR =
	'The inspector {replacement0} was assigned to the case';
export const AUDIT_TRAIL_MODIFIED_APPEAL = 'The {replacement0} property was updated';
export const AUDIT_TRAIL_CASE_TIMELINE_CREATED = 'The case timeline was created';
export const AUDIT_TRAIL_CASE_TIMELINE_UPDATED = 'The case timeline was updated';
export const AUDIT_TRAIL_DOCUMENT_UPLOADED =
	'Document {replacement0} uploaded (version {replacement1})';
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
	'Document {replacement0} has been renamed as {replacement1}';
export const AUDIT_TRAIL_LPAQ_IMPORT_MSG = 'The LPA questionnaire was received';
export const AUDIT_TRAIL_REP_IMPORT_MSG = 'A representation was received';
export const AUDIT_TRAIL_PROGRESSED_TO_STATUS = 'The case has progressed to {replacement0}';
export const AUDIT_TRAIL_SUBMISSION_INCOMPLETE = 'The {replacement0} was marked as incomplete';
export const AUDIT_TRAIL_REMOVED_CASE_OFFICER =
	'The case officer {replacement0} was removed from the team';
export const AUDIT_TRAIL_REMOVED_INSPECTOR =
	'The inspector {replacement0} was removed from the case';
export const AUDIT_TRAIL_SITE_VISIT_ARRANGED = 'The site visit was arranged for {replacement0}';
export const AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED = 'The site visit type was selected';
export const AUDIT_TRAIL_APPEAL_LINK_ADDED = 'A linked appeal was added';
export const AUDIT_TRAIL_APPEAL_LINK_REMOVED = 'A linked appeal was removed';
export const AUDIT_TRAIL_APPEAL_RELATION_ADDED = 'A related appeal was added';
export const AUDIT_TRAIL_APPEAL_RELATION_REMOVED = 'A related appeal was removed';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_ADDED = 'A neighbouring address was added';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_UPDATED = 'A neighbouring address was updated';
export const AUDIT_TRAIL_NEIGHBOURING_ADDRESS_REMOVED = 'A neighbouring address was removed';
export const AUDIT_TRAIL_SYSTEM_UUID = '00000000-0000-0000-0000-000000000000';
export const AUDIT_TRAIL_SERVICE_USER_UPDATED = 'The {replacement0}’s details were updated';
export const AUDIT_TRAIL_SERVICE_USER_REMOVED = 'The {replacement0} was removed';
export const AUDIT_TRAIL_ADDRESS_UPDATED = 'Site address updated';
export const AUDIT_TRAIL_APPELLANT_CASE_UPDATED = 'Appellant case updated';
export const AUDIT_TRAIL_SITE_AREA_SQUARE_METRES_UPDATED = 'Site area updated';
export const AUDIT_TRAIL_IS_GREEN_BELT_UPDATED = 'Green belt status updated';
export const AUDIT_TRAIL_SITE_OWNERSHIP_UPDATED = 'Site ownership updated';
export const AUDIT_TRAIL_KNOWS_OTHER_OWNERS_UPDATED = 'Owners known updated';
export const AUDIT_TRAIL_SITE_ACCESS_DETAILS_UPDATED = 'Inspector access (appellant) updated';
export const AUDIT_TRAIL_SITE_SAFETY_DETAILS_UPDATED =
	'Site health and safety risks (appellant answer) updated';
export const AUDIT_TRAIL_APPLICATION_DATE_UPDATED = 'Date application submitted updated';
export const AUDIT_TRAIL_DEVELOPMENT_DESCRIPTION_UPDATED =
	'Original development description has been updated';
export const AUDIT_TRAIL_APPLICATION_DECISION_DATE_UPDATED = 'Application decision date updated';
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

export const AUDIT_TRAIL_LISTED_BUILDING_ADDED = 'A listed building was added';
export const AUDIT_TRAIL_LISTED_BUILDING_UPDATED = 'A listed building was updated';
export const AUDIT_TRAIL_LISTED_BUILDING_REMOVED = 'A listed building was removed';

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
export const ERROR_GOV_NOTIFY_CONNECTIVITY =
	'Gov notify connectivity. Error Code: {replacement0}, template ID: {replacement1}';
export const ERROR_NO_RECIPIENT_EMAIL = 'recipient email not found';
export const ERROR_GOV_NOTIFY_API_KEY_NOT_SET = 'gov notify api key is not set';
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
export const ERROR_MAX_LENGTH_CHARACTERS = 'must be {replacement0} characters or less';
export const ERROR_MUST_BE_ARRAY_OF_NUMBERS = 'must be an array of numbers';
export const ERROR_MUST_BE_ARRAY_OF_STRINGS = 'must be an array of strings';
export const ERROR_MUST_BE_BOOLEAN = 'must be a boolean';
export const ERROR_MUST_BE_BUSINESS_DAY = 'must be a business day';
export const ERROR_MUST_BE_CORRECT_DATE_FORMAT = `must be a valid date and in the format ${DEFAULT_DATE_FORMAT_DATABASE}`;
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
export const ERROR_INVALID_APPEAL_STATE = 'The action is invalid on the current appeal state.';
export const ERROR_CASE_OUTCOME_MUST_BE_ONE_OF = `The case outcome must be one of ${CASE_OUTCOME_ALLOWED}, ${CASE_OUTCOME_DISMISSED}, ${CASE_OUTCOME_SPLIT_DECISION}`;
export const ERROR_REP_OUTCOME_MUST_BE_ONE_OF = `The representation status must be one of ${APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW}, ${APPEAL_REPRESENTATION_STATUS.INVALID}, ${APPEAL_REPRESENTATION_STATUS.VALID}`;
export const ERROR_REP_ONLY_STATEMENT_INCOMPLETE = 'Only LPA statements can be set to incomplete';
export const ERROR_REP_PUBLISH_USING_ENDPOINT =
	'LPA statements and final comments can only be published using the dedicated endpoint';
export const ERROR_LINKING_APPEALS =
	'The appeals cannot be linked as the lead or child are already linked to other appeals.';
export const ERROR_INVALID_EMAIL = 'must be a valid email';
export const ERROR_INVALID_FILENAME = 'must be a valid filename';

export const ERROR_INVALID_POSTCODE = 'needs to be a valid and include spaces';
export const UK_POSTCODE_REGEX = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/gm;

export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const LENGTH_1 = 1;
export const LENGTH_8 = 8;
export const LENGTH_10 = 10;
export const LENGTH_250 = 250;
export const LENGTH_300 = 300;
export const LENGTH_1000 = 1000;

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
export const FRONT_OFFICE_URL = 'https://www.gov.uk/appeal-planning-inspectorate';

export const CONFIG_APPEAL_TIMETABLE = {
	W: {
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
	},
	D: {
		lpaQuestionnaireDueDate: {
			daysFromStartDate: 5
		}
	}
};
