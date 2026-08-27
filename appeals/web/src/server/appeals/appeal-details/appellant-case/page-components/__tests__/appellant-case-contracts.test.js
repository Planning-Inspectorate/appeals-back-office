// @ts-nocheck
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
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

describe('Appellant Case Page Component Mapper Contracts', () => {
	const mockAppeal = {
		appealId: 1,
		appealType: APPEAL_TYPE.S78,
		agent: { name: 'Test Agent' }
	};

	const mockAppellantCaseData = {
		applicationDate: '2025-01-01T00:00:00.000Z',
		reasonForAppealAppellant: 'My reason for appeal',
		documents: {}
	};

	const createMockRow = (keyText) => ({
		display: {
			summaryListItem: {
				key: { text: keyText },
				value: { text: 'Mock Value' }
			}
		}
	});

	const mockMappedData = {
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
		developmentDescriptionOriginal: createMockRow('Original development description'),
		developmentDescriptionChanged: createMockRow('Changed development description'),
		developmentDescriptionChangedEvidence: createMockRow(
			'Evidence of agreement to change description'
		),
		procedurePreference: createMockRow('Procedure preference'),
		procedurePreferenceDetails: createMockRow('Procedure preference details'),
		procedurePreferenceDuration: createMockRow('Procedure preference duration'),
		inquiryNumberOfWitnesses: createMockRow('Inquiry number of witnesses'),
		applicationForm: createMockRow('Application form'),
		changedDevelopmentDescriptionDocument: createMockRow(
			'Evidence of agreement to change development description'
		),
		decisionLetter: createMockRow('Decision letter'),
		statusPlanningObligation: createMockRow('Status of planning obligation'),
		planningObligation: createMockRow('Planning obligation'),
		statementCommonGround: createMockRow('Draft statement of common ground'),
		ownershipCertificate: createMockRow('Ownership certificate'),
		ownershipCertificateExpedited: createMockRow(
			'Ownership certificate and agricultural land declaration'
		),
		costsDocument: createMockRow('Application for a award of costs'),
		designAccessStatement: createMockRow('Design and access statement'),
		appealStatement: createMockRow('Appeal statement'),
		supportingDocuments: createMockRow('Other new supporting documents'),
		plansDrawings: createMockRow('Plans, drawings and list of plans'),
		newPlansDrawings: createMockRow('New plans or drawings'),
		otherNewDocuments: createMockRow('Other new supporting documents'),
		environmentalStatement: createMockRow('Environmental statement'),
		applicationDate: createMockRow('Application date'),
		relatedAppeals: createMockRow('Related appeals'),
		siteOwnership: createMockRow('Site ownership'),
		ownersKnown: createMockRow('Owners known'),
		siteUseAtTimeOfApplication: createMockRow('Site use at time of application'),
		applicationMadeUnderActSection: createMockRow('Application made under act section'),
		reasonForAppealAppellant: createMockRow('Why are you appealing?'),
		anySignificantChanges: createMockRow('Significant changes'),
		factsForGrounds: createMockRow('Facts for grounds'),
		supportingDocumentsForGrounds: createMockRow('Supporting documents for grounds'),
		highwayLand: createMockRow('Highway land'),
		advertisementInPosition: createMockRow('Advertisement in position'),
		landownerPermission: createMockRow('Landowner permission'),
		advertisementDescription: createMockRow('Advertisement description'),
		changedAdvertisementDescriptionDocument: createMockRow(
			'Evidence of agreement to change advertisement description'
		),
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
		additionalDocuments: {
			display: {
				summaryListItems: [createMockRow('Additional documents').display.summaryListItem]
			}
		}
	};

	const extractCardTitles = (components) =>
		components.filter(Boolean).map((c) => c.parameters?.card?.title?.text);

	const extractRowKeysForCard = (components, cardId) => {
		const card = components.filter(Boolean).find((c) => c.parameters?.attributes?.id === cardId);
		if (!card) return [];
		return card.parameters.rows.map((r) => r.key?.text);
	};

	it('Full Advert mapper produces exact section cards and field/document row contracts', () => {
		const components = generateAdvertComponents(mockAppeal, mockAppellantCaseData, mockMappedData);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Highway land',
			'Advertisement in position',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks',
			'Landowner permission'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Advertisement description',
			'Evidence of agreement to change advertisement description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Appeal statement',
			'Application for a award of costs',
			'Other new supporting documents'
		]);
	});

	it('CAS Advert mapper produces exact section cards and field/document row contracts (pre-cut-off)', () => {
		const components = generateCASAdvertComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.CAS_ADVERTISEMENT },
			mockAppellantCaseData,
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Highway land',
			'Advertisement in position',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks',
			'Landowner permission'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Advertisement description',
			'Evidence of agreement to change advertisement description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Appeal statement',
			'Application for a award of costs',
			'Other new supporting documents'
		]);
	});

	it('CAS Advert mapper produces exact section cards and field/document row contracts (post-cut-off)', () => {
		const components = generateCASAdvertComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.CAS_ADVERTISEMENT },
			{ applicationDate: '2026-04-02T00:00:00.000Z', reasonForAppealAppellant: 'My reason' },
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Highway land',
			'Advertisement in position',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks',
			'Landowner permission',
			'Significant changes'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Advertisement description',
			'Evidence of agreement to change advertisement description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual(['Why are you appealing?']);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Application for a award of costs'
		]);
	});

	it('Householder mapper produces exact section cards and field/document row contracts (pre-cut-off)', () => {
		const components = generateHASComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.HOUSEHOLDER },
			mockAppellantCaseData,
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Appeal statement',
			'Application for a award of costs'
		]);
	});

	it('Householder mapper produces exact section cards and field/document row contracts (post-cut-off)', () => {
		const components = generateHASComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.HOUSEHOLDER },
			{ applicationDate: '2026-04-02T00:00:00.000Z', reasonForAppealAppellant: 'My reason' },
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks',
			'Significant changes'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual(['Why are you appealing?']);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Application for a award of costs'
		]);
	});

	it('S78 mapper produces exact section cards and field/document row contracts', () => {
		const components = generateS78Components(mockAppeal, mockAppellantCaseData, mockMappedData);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Development type'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Decision letter',
			'Appeal statement',
			'Status of planning obligation',
			'Planning obligation',
			'Draft statement of common ground',
			'Ownership certificate',
			'Application for a award of costs',
			'Design and access statement',
			'Other new supporting documents',
			'New plans or drawings',
			'Other new supporting documents'
		]);
	});

	it('S78 Expedited mapper produces exact section cards and field/document row contracts (post-cut-off)', () => {
		const components = generateS78ExpeditedComponents(
			mockAppeal,
			{ applicationDate: '2026-04-02T00:00:00.000Z', reasonForAppealAppellant: 'My reason' }, // post-cut-off date
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Development type'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses',
			'Why are you appealing?'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Decision letter',
			'Status of planning obligation',
			'Planning obligation',
			'Draft statement of common ground',
			'Ownership certificate',
			'Application for a award of costs',
			'Design and access statement',
			'Other new supporting documents',
			'New plans or drawings',
			'Other new supporting documents'
		]);
	});

	it('CAS planning mapper produces exact section cards and field/document row contracts (pre-cut-off)', () => {
		const components = generateCASComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.CAS_PLANNING },
			mockAppellantCaseData,
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Appeal statement',
			'Application for a award of costs',
			'Other new supporting documents'
		]);
	});

	it('CAS planning mapper produces exact section cards and field/document row contracts (post-cut-off)', () => {
		const components = generateCASComponents(
			{ ...mockAppeal, appealType: APPEAL_TYPE.CAS_PLANNING },
			{ applicationDate: '2026-04-02T00:00:00.000Z', reasonForAppealAppellant: 'My reason' },
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks',
			'Significant changes'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Decision letter'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual(['Why are you appealing?']);
		expect(extractRowKeysForCard(components, 'uploaded-documents')).toEqual([
			'Application form',
			'Evidence of agreement to change development description',
			'Application for a award of costs'
		]);
	});

	it('LDC mapper produces exact section cards and field/document row contracts', () => {
		const components = generateLdcComponents(mockAppeal, mockAppellantCaseData, mockMappedData);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Site use at time of application',
			'Application made under act section',
			'Development description',
			'Evidence of agreement to change development description',
			'Related appeals'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
	});

	it('S20 mapper produces exact section cards and field/document row contracts', () => {
		const components = generateS20Components(mockAppeal, mockAppellantCaseData, mockMappedData);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Site details',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Application decision',
			'Application decision date',
			'LPA application reference number'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Site area',
			'Green belt',
			'Site ownership',
			'Owners known',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual([
			'Application date',
			'Development description',
			'Related appeals',
			'Development type'
		]);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
	});

	it('Enforcement Notice mapper produces exact section cards and field/document row contracts', () => {
		const components = generateEnforcementNoticeComponents(
			mockAppeal,
			mockAppellantCaseData,
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Land',
			'Grounds and facts',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Enforcement notice date',
			'Effective date of enforcement notice',
			'Date planning inspectorate contacted',
			'Enforcement reference'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name',
			'Other appellants'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Contact address',
			'Interest in land',
			'Written or verbal permission',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'grounds-and-facts')).toEqual([
			'Facts for grounds',
			'Supporting documents for grounds',
			'LPA application reference number',
			'Application date',
			'Development description',
			'Application decision',
			'Application decision date'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual(['Related appeals']);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
	});

	it('Enforcement Listed mapper produces exact section cards and field/document row contracts', () => {
		const components = generateEnforcementListedComponents(
			mockAppeal,
			mockAppellantCaseData,
			mockMappedData
		);
		expect(extractCardTitles(components)).toEqual([
			'Before you start',
			'Appellant details',
			'Land',
			'Grounds and facts',
			'Application details',
			'Appeal details',
			'Upload documents',
			'Additional documents'
		]);
		expect(extractRowKeysForCard(components, 'before-you-start')).toEqual([
			'Local planning authority',
			'Application type',
			'Enforcement notice date',
			'Effective date of enforcement notice',
			'Date planning inspectorate contacted',
			'Enforcement reference'
		]);
		expect(extractRowKeysForCard(components, 'appellant-details')).toEqual([
			'Appellant name',
			'Agent name',
			'Other appellants'
		]);
		expect(extractRowKeysForCard(components, 'site-details')).toEqual([
			'Site address',
			'Contact address',
			'Interest in land',
			'Written or verbal permission',
			'Inspector access',
			'Safety risks'
		]);
		expect(extractRowKeysForCard(components, 'grounds-and-facts')).toEqual([
			'Facts for grounds',
			'Supporting documents for grounds'
		]);
		expect(extractRowKeysForCard(components, 'application-summary')).toEqual(['Related appeals']);
		expect(extractRowKeysForCard(components, 'appeal-summary')).toEqual([
			'Procedure preference',
			'Procedure preference details',
			'Procedure preference duration',
			'Inquiry number of witnesses'
		]);
	});
});
