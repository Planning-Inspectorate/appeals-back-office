/** @type {import('../mapper.js').SubMapper} */
export const appellant = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appellant',
		text: 'Appellant',
		value: {
			html: appealDetails.appellant
				? formatServiceUserAsHtmlList(appealDetails.appellant)
				: 'No appellant'
		},
		link: `${currentRoute}/service-user/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appeal-appellant',
		cypressDataName: 'appellant'
	});

/** @type {import('../mapper.js').SubMapper} */
export const agent = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'agent',
		text: 'Agent',
		value: {
			html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
		},
		link: `${currentRoute}/service-user/change/agent`,
		editable: userHasUpdateCase,
		classes: 'appeal-agent'
	});

/** @type {import('../mapper.js').SubMapper} */
export const applicationReference = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-reference',
		text: 'LPA application reference',
		value: appellantCaseData.planningApplicationReference,
		link: `${currentRoute}/lpa-reference/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const siteAddress = ({
	appellantCaseData,
	appealDetails,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'site-address',
		text: 'Site address',
		value: appealSiteToAddressString(appellantCaseData.appealSite),
		link: `${currentRoute}/site-address/change/${appealDetails.appealSite.addressId}`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const siteArea = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'site-area',
		text: 'Site area (m²)',
		value: appellantCaseData.siteAreaSquareMetres
			? `${appellantCaseData.siteAreaSquareMetres} m²`
			: '',
		link: `${currentRoute}/site-area/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const inGreenBelt = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'green-belt',
		text: 'In green belt',
		value: appellantCaseData.isGreenBelt,
		defaultText: '',
		link: `${currentRoute}/green-belt/change/appellant`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const applicationDecisionDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-decision-date',
		text: 'Decision date',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDecisionDate),
		link: `${currentRoute}/application-decision-date/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const applicationDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-date',
		text: 'Application submitted',
		value: dateISOStringToDisplayDate(appellantCaseData.applicationDate),
		link: `${currentRoute}/application-date/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const developmentDescription = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'development-description',
		text: 'Original Development description',
		value: appellantCaseData.developmentDescription?.details || 'Not provided',
		link: `${currentRoute}/development-description/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Original Development description details'
	});

/** @type {import('../mapper.js').SubMapper} */
export const changedDevelopmentDescription = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'changed-development-description',
		text: 'LPA changed the development description',
		value: appellantCaseData.developmentDescription?.isChanged,
		link: `${currentRoute}/lpa-changed-description/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const applicationDecision = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-decision',
		text: 'Outcome',
		value: (() => {
			switch (appellantCaseData.applicationDecision) {
				case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
					return 'Not received';
				case APPEAL_APPLICATION_DECISION.GRANTED:
					return 'Granted with conditions';
				case APPEAL_APPLICATION_DECISION.REFUSED:
					return 'Refused';
				default:
					return '';
			}
		})(),
		link: `${currentRoute}/application-outcome/change`,
		editable: userHasUpdateCase
	});

//TODO: update with new document type
/** @type {import('../mapper.js').SubMapper} */
export const changedDevelopmentDescriptionDocument = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.changedDescription?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'changed-development-description.document',
		text: 'Agreement to change description evidence',
		folderInfo: appellantCaseData.documents.changedDescription,
		cypressDataName: 'agreement-to-change-description-evidence'
	});

/** @type {import('../mapper.js').SubMapper} */
export const localPlanningAuthority = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'Local planning authority (LPA)',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const appealType = ({ appealDetails, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appeal-type',
		text: 'Appeal type',
		value: appealDetails.appealType,
		link: `${currentRoute}/#`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const advertisedAppeal = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'advertised-appeal',
		text: 'Advertised appeal',
		value: appellantCaseData.hasAdvertisedAppeal,
		defaultText: '',
		link: `${currentRoute}/change-appeal-details/advertised-appeal`,
		addCyAttribute: true,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const inspectorAccess = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'inspector-access',
		text: 'Inspector access required',
		value: appellantCaseData.siteAccessRequired?.hasIssues,
		valueDetails: appellantCaseData.siteAccessRequired?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/appellant`,
		editable: userHasUpdateCase,
		classes: 'appellantcase-inspector-access',
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Inspector access details'
	});

/** @type {import('../mapper.js').SubMapper} */
export const healthAndSafetyIssues = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'appellant-case-health-and-safety',
		text: 'Potential safety risks',
		value: appellantCaseData.healthAndSafety?.hasIssues,
		valueDetails: appellantCaseData.healthAndSafety?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/appellant`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details'
	});

/** @type {import('../mapper.js').SubMapper} */
export const applicationForm = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.originalApplicationForm?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'application-form',
		text: 'Application form',
		folderInfo: appellantCaseData.documents.originalApplicationForm
	});

/** @type {import('../mapper.js').SubMapper} */
export const designAccessStatement = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.designAccessStatement?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'design-access-statement',
		text: 'Design and access statement',
		folderInfo: appellantCaseData.documents.designAccessStatement
	});

/** @type {import('../mapper.js').SubMapper} */
export const newPlansDrawings = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.newPlansDrawings?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'new-plans-drawings',
		text: 'New plans or drawings',
		folderInfo: appellantCaseData.documents.newPlansDrawings
	});

/** @type {import('../mapper.js').SubMapper} */
export const supportingDocuments = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.plansDrawings?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'supporting-documents',
		text: 'Supporting documents submitted with statement',
		folderInfo: appellantCaseData.documents.plansDrawings
	});

/** @type {import('../mapper.js').SubMapper} */
export const planningObligation = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.planningObligation?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'planning-obligation',
		text: 'Planning obligation',
		folderInfo: appellantCaseData.documents.planningObligation
	});

/** @type {import('../mapper.js').SubMapper} */
export const ownershipCertificateSubmitted = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'ownership-certificate-submitted',
		text: 'Ownership certificate or land declaration submitted',
		value: appellantCaseData.ownershipCertificateSubmitted,
		defaultText: '',
		link: `${currentRoute}/ownership-certificate/change`,
		addCyAttribute: true,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const ownershipCertificate = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.ownershipCertificate?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'ownership-certificate',
		text: 'Ownership certificate or land declaration',
		folderInfo: appellantCaseData.documents.ownershipCertificate
	});

/** @type {import('../mapper.js').SubMapper} */
export const decisionLetter = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.applicationDecisionLetter?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'decision-letter',
		text: 'Decision letter',
		folderInfo: appellantCaseData.documents.applicationDecisionLetter
	});

/** @type {import('../mapper.js').SubMapper} */
export const appealStatement = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.appellantStatement?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'appeal-statement',
		text: 'Appeal statement',
		folderInfo: appellantCaseData.documents.appellantStatement
	});

/** @type {import('../mapper.js').SubMapper} */
export const otherNewDocuments = ({ appellantCaseData, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appellantCaseData.documents.otherNewDocuments?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'new-supporting-documents',
		text: 'New supporting documents',
		folderInfo: appellantCaseData.documents.otherNewDocuments
	});

/** @type {import('../mapper.js').SubMapper} */
export const planningObligationInSupport = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'planning-obligation-in-support',
		text: 'Planning obligation in support',
		value: appellantCaseData.planningObligation?.hasObligation,
		defaultText: '',
		link: `${currentRoute}/planning-obligation/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const statusPlanningObligation = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'planning-obligation-status',
		text: 'Planning obligation status',
		value: formatPlanningObligationStatus(appellantCaseData.planningObligation?.status),
		link: `${currentRoute}/planning-obligation/status/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const partOfAgriculturalHolding = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'part-of-agricultural-holding',
		text: 'Part of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const tenantOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'tenant-of-agricultural-holding',
		text: 'Tenant of agricultural holding',
		value: appellantCaseData.agriculturalHolding.isTenant,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/tenant/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const otherTenantsOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'other-tenants-of-agricultural-holding',
		text: 'Other tenants',
		value: appellantCaseData.agriculturalHolding.hasOtherTenants,
		defaultText: '',
		link: `${currentRoute}/agricultural-holding/other-tenants/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const appellantCostsApplication = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'appellant-costs-application',
		text: 'Applied for award of appeal costs',
		value: appellantCaseData.appellantCostsAppliedFor,
		link: `${currentRoute}/appeal-costs-application/change`,
		editable: userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const costsDocument = ({ appellantCaseData, appealDetails, userHasUpdateCase }) =>
	documentSummaryListItem({
		manageUrl: mapDocumentManageUrl(
			appellantCaseData.appealId,
			appealDetails.costs.appellantApplicationFolder?.folderId
		),
		appealId: appellantCaseData.appealId,
		editable: userHasUpdateCase,
		uploadUrlTemplate: documentUploadUrlTemplate,
		id: 'costs-appellant',
		text: 'Costs document',
		folderInfo: appealDetails.costs.appellantApplicationFolder,
		cypressDataName: 'costs-document'
	});

/** @type {import('../mapper.js').SubMapper} */
export const procedurePreferenceDetails = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'procedure-preference-details',
		text: 'Reason for preference',
		value: appellantCaseData.appellantProcedurePreferenceDetails || 'Not applicable',
		link: `${currentRoute}/procedure-preference/details/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Reason for preference details'
	});
