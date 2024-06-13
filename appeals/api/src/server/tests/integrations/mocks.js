export const validAppellantCase = {
	casedata: {
		caseType: 'D',
		caseProcedure: 'written',
		lpaCode: 'Q9999',
		caseSubmittedDate: '1909-06-19T16:26:31.0Z',
		enforcementNotice: false,
		applicationReference: 'ABC/123/QWER',
		applicationDate: '1922-01-01T09:44:51.0Z',
		applicationDecision: 'refused',
		applicationDecisionDate: '1892-04-13T01:13:33.0Z',
		caseSubmissionDueDate: '1891-09-22T22:28:18.0Z',
		siteAddressLine1: 'irure laborum anim do eu',
		siteAddressLine2: 'Excepteur cillum Duis culpa dolor',
		siteAddressTown: 'sit pariatur incididunt',
		siteAddressCounty: null,
		siteAddressPostcode: 'ut voluptate labore ullamco ex',
		siteAccessDetails: [
			'fugiat veniam qui pariatur',
			'in consectetur id',
			'voluptate mollit culpa',
			'magna'
		],
		siteSafetyDetails: ['sint do'],
		siteAreaSquareMetres: 100,
		floorSpaceSquareMetres: null,
		ownsAllLand: true,
		ownsSomeLand: false,
		knowsOtherOwners: 'Some',
		knowsAllOwners: 'No',
		advertisedAppeal: false,
		ownersInformed: null,
		originalDevelopmentDescription: 'adipisicing aliqua',
		changedDevelopmentDescription: true,
		nearbyCaseReferences: ['7000111', '7000112', '7000113', '7000114', '7000115'],
		neighbouringSiteAddresses: [
			{
				neighbouringSiteAddressLine1: 'Ut dolor aliquip eiusmod',
				neighbouringSiteAddressLine2: 'occaecat nostrud ea adipisicing deserunt',
				neighbouringSiteAddressTown: 'ea',
				neighbouringSiteAddressCounty: 'in',
				neighbouringSiteAddressPostcode: 'dolor dolor',
				neighbouringSiteAccessDetails: null,
				neighbouringSiteSafetyDetails: null
			},
			{
				neighbouringSiteAddressLine1: 'Excepteur',
				neighbouringSiteAddressLine2: null,
				neighbouringSiteAddressTown: 'ad labore ipsum',
				neighbouringSiteAddressCounty: null,
				neighbouringSiteAddressPostcode: 'non cillum elit dolor officia',
				neighbouringSiteAccessDetails: 'pariatur in labore officia',
				neighbouringSiteSafetyDetails: null
			},
			{
				neighbouringSiteAddressLine1: 'veniam est ut ea amet',
				neighbouringSiteAddressLine2: null,
				neighbouringSiteAddressTown: 'tempor exercitation mollit eiusmod in',
				neighbouringSiteAddressCounty: null,
				neighbouringSiteAddressPostcode: 'deserunt amet aute',
				neighbouringSiteAccessDetails: 'voluptate veniam consequat',
				neighbouringSiteSafetyDetails: null
			},
			{
				neighbouringSiteAddressLine1: 'in',
				neighbouringSiteAddressLine2: 'dolore minim',
				neighbouringSiteAddressTown: 'sunt ut',
				neighbouringSiteAddressCounty: 'reprehenderit Ut dolore',
				neighbouringSiteAddressPostcode: 'dolor',
				neighbouringSiteAccessDetails: 'nulla adipisicing',
				neighbouringSiteSafetyDetails: null
			}
		],
		appellantCostsAppliedFor: false
	},
	documents: [
		{
			documentId: '4547fec8-16b2-47bb-836d-4d0baac04079',
			filename: 'exercitation reprehenderit laborum eu enim',
			originalFilename: 'cupidatat',
			size: 23810727,
			mime: 'non cupidatat ea',
			documentURI: 'elit est Excepteur cupidatat',
			dateCreated: '1890-01-01T22:21:50.0Z',
			documentType: 'originalApplicationForm'
		}
	],
	users: [
		{
			salutation: null,
			firstName: 'Paul',
			lastName: 'Pogba',
			emailAddress: null,
			serviceUserType: 'Appellant'
		},
		{
			salutation: null,
			firstName: 'Ray',
			lastName: 'Liotta',
			emailAddress: 'test@example.com',
			serviceUserType: 'Agent'
		}
	]
};

export const validLpaQuestionnaire = {
	questionnaire: {
		caseReference: '6000526',
		LPACode: 'Q9999',
		isAppealTypeAppropriate: true,
		doesTheDevelopmentAffectTheSettingOfAListedBuilding: true,
		affectedListedBuildings: [
			{
				listEntry: '1021477'
			}
		],
		inCAOrRelatesToCA: true,
		siteWithinGreenBelt: true,
		howYouNotifiedPeople: [
			'A public notice at the site',
			'Letters to neighbours',
			'Advert in the local press'
		],
		hasRepresentationsFromOtherParties: true,
		doesSiteRequireInspectorAccess: true,
		doPlansAffectNeighbouringSite: true,
		doesSiteHaveHealthAndSafetyIssues: true,
		healthAndSafetyIssuesDetails: 'There are bears. Lots of bears.',
		nearbyCaseReferences: ['abc/123456', 'lpa/945357'],
		hasExtraConditions: true,
		extraConditions: 'Here are some extra conditions.'
	},
	documents: []
};
