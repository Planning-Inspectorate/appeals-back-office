import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAdvertComponents } from '../adverts.mapper.js';
import { generateCASAdvertComponents } from '../cas-advert.mapper.js';
import { generateCASComponents } from '../cas.mapper.js';
import { generateEnforcementListedComponents } from '../enforcement-listed.mapper.js';
import { generateEnforcementNoticeComponents } from '../enforcement-notice.mapper.js';
import { generateHASComponents } from '../has.mapper.js';
import { generateLdcComponents } from '../ldc.mapper.js';
import { generateS20Components } from '../s20.mapper.js';
import { generateS78ExpeditedComponents } from '../s78-expedited.mapper.js';
import { generateS78Components } from '../s78.mapper.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 */

const mappers = {
	Adverts: generateAdvertComponents,
	'CAS Advert': generateCASAdvertComponents,
	'CAS Planning': generateCASComponents,
	'Enforcement Listed': generateEnforcementListedComponents,
	'Enforcement Notice': generateEnforcementNoticeComponents,
	'Householder (HAS)': generateHASComponents,
	LDC: generateLdcComponents,
	S20: generateS20Components,
	'S78 Expedited': generateS78ExpeditedComponents,
	'S78 Standard': generateS78Components
};

/**
 * @param {string} keyText
 */
const createMockRow = (keyText) => ({
	display: { summaryListItem: { key: { text: keyText }, value: { text: 'Mock Value' } } }
});

const mockMappedData = /** @type {any} */ ({
	localPlanningAuthority: createMockRow('Local planning authority'),
	applicationType: createMockRow('Application type'),
	applicationDecision: createMockRow('Application decision'),
	applicationDecisionDate: createMockRow('Application decision date'),
	applicationReference: createMockRow('LPA application reference number'),
	appellant: createMockRow('Appellant name'),
	agent: createMockRow('Agent name'),
	siteAddress: createMockRow('Site address'),
	siteArea: createMockRow('Site area'),
	inGreenBelt: createMockRow('Green belt'),
	inspectorAccess: createMockRow('Inspector access'),
	healthAndSafetyIssues: createMockRow('Safety risks'),
	developmentDescription: createMockRow('Development description'),
	procedurePreference: createMockRow('Procedure preference'),
	procedurePreferenceDetails: createMockRow('Procedure preference details'),
	procedurePreferenceDuration: createMockRow('Procedure preference duration'),
	inquiryNumberOfWitnesses: createMockRow('Inquiry number of witnesses'),
	applicationForm: createMockRow('Application form'),
	decisionLetter: createMockRow('Decision letter'),
	statusPlanningObligation: createMockRow('Status of planning obligation'),
	planningObligation: createMockRow('Planning obligation'),
	statementCommonGround: createMockRow('Draft statement of common ground'),
	ownershipCertificate: createMockRow('Ownership certificate'),
	costsDocument: createMockRow('Application for a award of costs'),
	designAccessStatement: createMockRow('Design and access statement'),
	appealStatement: createMockRow('Appeal statement'),
	supportingDocuments: createMockRow('Other new supporting documents'),
	plansDrawings: createMockRow('Plans, drawings and list of plans'),
	newPlansDrawings: createMockRow('New plans or drawings'),
	otherNewDocuments: createMockRow('Other new supporting documents'),
	applicationDate: createMockRow('Application date'),
	relatedAppeals: createMockRow('Related appeals'),
	siteOwnership: createMockRow('Site ownership'),
	ownersKnown: createMockRow('Owners known'),
	highwayLand: createMockRow('Highway land'),
	advertisementInPosition: createMockRow('Advertisement in position'),
	landownerPermission: createMockRow('Landowner permission'),
	advertisementDescription: createMockRow('Advertisement description'),
	developmentType: createMockRow('Development type'),
	otherAppellants: createMockRow('Other appellants'),
	contactAddress: createMockRow('Contact address'),
	interestInLand: createMockRow('Interest in land'),
	writtenOrVerbalPermission: createMockRow('Written or verbal permission'),
	enforcementNotice: createMockRow('Enforcement notice'),
	enforcementIssueDate: createMockRow('Enforcement notice date'),
	enforcementEffectiveDate: createMockRow('Effective date of enforcement notice'),
	contactPlanningInspectorateDate: createMockRow('Date planning inspectorate contacted'),
	enforcementReference: createMockRow('Enforcement reference'),
	factsForGrounds: createMockRow('Facts for grounds'),
	supportingDocumentsForGrounds: createMockRow('Supporting documents for grounds'),
	additionalDocuments: {
		display: {
			summaryListItems: [createMockRow('Additional documents').display.summaryListItem]
		}
	}
});

const emptyAppellantCaseData = /** @type {SingleAppellantCaseResponse} */ ({});

export function generateDocContent() {
	let doc = '## Auto-Generated Rendered Rows by Appeal Type\n\n';
	doc +=
		'> Note: Auto-generated from component mapper contracts. Re-run `npm run generate-docs` or `node scripts/generate-appellant-case-docs.js` to update.\n';
	doc +=
		'> Note: This list displays all rows rendered when full mapped data is present. Dynamic conditional logic (such as application date cutoffs or optional data checks) is handled within individual mapper functions and is not annotated here.\n\n';

	const appealTypeMap = /** @type {Record<string, string>} */ ({
		Adverts: APPEAL_TYPE.ADVERTISEMENT,
		'CAS Advert': APPEAL_TYPE.CAS_ADVERTISEMENT,
		'CAS Planning': APPEAL_TYPE.CAS_PLANNING,
		'Enforcement Listed': APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
		'Enforcement Notice': APPEAL_TYPE.ENFORCEMENT_NOTICE,
		'Householder (HAS)': APPEAL_TYPE.HOUSEHOLDER,
		LDC: APPEAL_TYPE.LDC,
		S20: APPEAL_TYPE.S20,
		'S78 Expedited': APPEAL_TYPE.S78,
		'S78 Standard': APPEAL_TYPE.S78
	});

	for (const [typeName, fn] of Object.entries(mappers)) {
		doc += `### ${typeName}\n`;
		const appealType = appealTypeMap[typeName] || APPEAL_TYPE.HOUSEHOLDER;
		const testAppeal = /** @type {WebAppeal} */ (
			/** @type {unknown} */ ({ appealId: 1, appealType })
		);

		try {
			const fullComps = fn(testAppeal, emptyAppellantCaseData, mockMappedData, true).filter(
				Boolean
			);

			fullComps.forEach((c) => {
				if (!c) return;
				const cardTitle = c.parameters?.card?.title?.text || c.parameters?.attributes?.id;
				const rows = (c.parameters?.rows || [])
					.map((/** @type {any} */ r) => r?.key?.text)
					.filter(Boolean);
				doc += `- **${cardTitle}**\n`;
				rows.forEach((/** @type {string} */ r) => {
					doc += `  - ${r}\n`;
				});
			});
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			doc += `  *(Error generating components: ${errorMessage})*\n`;
		}
		doc += '\n';
	}
	return doc;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[1] === __filename) {
	const readmePath = path.resolve(__dirname, '../README.md');
	let currentContent = fs.readFileSync(readmePath, 'utf8');

	const marker = '## Auto-Generated Rendered Rows by Appeal Type';
	if (currentContent.includes(marker)) {
		currentContent = currentContent.split(marker)[0];
	}

	const newContent = currentContent.trimEnd() + '\n\n' + generateDocContent();

	if (process.argv.includes('--check')) {
		const existingContent = fs.readFileSync(readmePath, 'utf8');
		if (existingContent !== newContent) {
			console.error(
				'README.md is out of date with appellant case page-component contracts. Run `npm run generate-docs:appellant-case` to update.'
			);
			process.exit(1);
		}
		console.log('README.md rendered rows breakdown is up to date.');
	} else {
		fs.writeFileSync(readmePath, newContent);
		console.log('Successfully updated README.md with auto-generated rendered rows breakdown.');
	}
}
