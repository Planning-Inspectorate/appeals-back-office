import {
	formatDocumentData,
	formatList,
	formatSentenceCase,
	formatYesNo,
	formatYesNoDetails
} from '../../../../lib/nunjucks-filters/index.js';

function mapBuildingData(building) {
	const { listEntry = 'N/A', name = 'N/A', grade = 'N/A' } = building;
	return `${listEntry} - ${name} - Grade (${grade})`;
}

export const rowBuilders = {
	isCorrectAppealType: (data) => ({
		key: `Is ${data.appealType.includes('CAS') ? data.appealType : data.appealType.toLowerCase()} the correct type of appeal?`,
		text: formatYesNo(data.isCorrectAppealType)
	}),

	changesListedBuilding: (data) => ({
		key: 'Does the development change a listed building?',
		html: formatList(
			data.listedBuildingDetails
				.filter(({ affectsListedBuilding = false }) => !affectsListedBuilding)
				.map(mapBuildingData),
			'No'
		)
	}),

	affectsListedBuilding: (data) => ({
		key: 'Does the development affect the setting of listed buildings?',
		html: formatList(
			data.listedBuildingDetails
				.filter(({ affectsListedBuilding = false }) => affectsListedBuilding)
				.map(mapBuildingData),
			'No'
		)
	}),

	preserveGrantLoan: (data) => ({
		key: 'Was a grant or loan made to preserve the listed building at the appeal site?',
		text: formatYesNo(data.preserveGrantLoan)
	}),

	affectsScheduledMonument: (data) => ({
		key: 'Would the development affect a scheduled monument?',
		text: formatYesNo(data.affectsScheduledMonument)
	}),

	conservationMap: (data) => ({
		key: 'Conservation area map and guidance',
		html: formatDocumentData(data.documents.conservationMap)
	}),

	hasProtectedSpecies: (data) => ({
		key: 'Would the development affect a protected species?',
		text: formatYesNo(data.hasProtectedSpecies)
	}),

	isSiteInAreaOfSpecialControlAdverts: (data) => ({
		key: 'Is the site in an area of special control of advertisements?',
		html: formatYesNo(data.isSiteInAreaOfSpecialControlAdverts)
	}),

	isGreenBelt: (data) => ({
		key: 'Green belt',
		text: formatYesNo(data.isGreenBelt)
	}),

	isAonbNationalLandscape: (data) => ({
		key: 'Is the site in a national landscape?',
		text: formatYesNo(data.isAonbNationalLandscape)
	}),

	designatedSiteNames: (data) => ({
		key: 'Is the development in, near or likely to affect any designated sites?',
		html: formatYesNoDetails(data.designatedSiteNames?.map((site) => site.name || 'Unnamed site'))
	}),

	treePreservationPlan: (data) => ({
		key: 'Tree preservation order',
		html: formatDocumentData(data.documents.treePreservationPlan)
	}),

	isGypsyOrTravellerSite: (data) => ({
		key: 'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
		text: formatYesNo(data.isGypsyOrTravellerSite)
	}),

	definitiveMapStatement: (data) => ({
		key: 'Definitive map and statement extract',
		html: formatDocumentData(data.documents.definitiveMapStatement)
	}),

	historicEnglandConsultation: (data) => ({
		key: 'Historic England consultation',
		html: formatDocumentData(data.documents.historicEnglandConsultation)
	}),

	appealUnderActSection: (data) => ({
		key: 'What type of lawful development certificate is the appeal about?',
		text: formatSentenceCase(data.appealUnderActSection)
	}),

	planningPermission: (data) => ({
		key: 'Planning permission',
		text: formatDocumentData(data.documents.planningPermission)
	}),

	lpaEnforcementNotice: (data) => ({
		key: 'Enforcement notice',
		text: formatDocumentData(data.documents.lpaEnforcementNotice)
	}),

	relatedApplications: (data) => ({
		key: 'Related applications',
		text: formatDocumentData(data.documents.relatedApplications)
	}),

	lpaConsiderAppealInvalid: (data) => ({
		key: 'Do you think the appeal is invalid?',
		text: formatYesNo(data.lpaConsiderAppealInvalid)
	})
};
