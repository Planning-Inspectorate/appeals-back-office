import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';

/** @type {string[]} */
export const FOLDERS = [
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS}`,
	`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSERVATION_MAP}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EMERGING_PLAN}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES}`,
	`${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.APPEAL_NOTIFICATION}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER}`,
	`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER}`,
	`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE}`,
	`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`,
	`${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`,
	'representation/representationAttachments'
];

export const VALID_MIME_TYPES = Object.freeze({
	'application/pdf': { hexSignature: '255044462D', extensions: ['pdf'] },
	'application/msword': { hexSignature: 'D0CF11E0', extensions: ['doc'] },
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
		hexSignature: '504B03041400',
		extensions: ['docx']
	},
	'application/vnd.ms-powerpoint': { hexSignature: 'D0CF11E0', extensions: ['ppt'] },
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
		hexSignature: '504B03041400',
		extensions: ['pptx']
	},
	'application/vnd.ms-excel': { hexSignature: 'D0CF11E0', extensions: ['xls'] },
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
		hexSignature: '504B03041400',
		extensions: ['xlsx']
	},
	'application/vnd.ms-outlook': { hexSignature: 'D0CF11E0', extensions: ['msg'] },
	'image/jpeg': { hexSignature: 'FFD8FFE0', extensions: ['jpg', 'jpeg'] },
	'video/mpeg': { hexSignature: '000001B3, 000001BA', extensions: ['mpeg'] },
	'audio/mpeg': { hexSignature: 'FFFB, 494433', extensions: ['mp3'] },
	'video/mp4': { hexSignature: '66747970', offset: 8, extensions: ['mp4'] },
	'video/quicktime': { hexSignature: '0000001466747970', extensions: ['mov'] },
	'image/png': { hexSignature: '89504E47', extensions: ['png'] },
	'image/tiff': { hexSignature: '4D4D002A, 49492A00', extensions: ['tif', 'tiff'] }
});
