const appealsApiRequests = {
	caseSubmission: {
		casedata: {
			advertisedAppeal: true,
			appellantCostsAppliedFor: false,
			applicationDate: '2024-01-01T00:00:00.000Z',
			applicationDecision: 'refused',
			applicationDecisionDate: '2024-01-01T00:00:00.000Z',
			applicationReference: '123',
			caseProcedure: 'written',
			caseSubmissionDueDate: '2024-03-25T23:59:59.999Z',
			caseSubmittedDate: '2024-03-25T23:59:59.999Z',
			caseType: 'D',
			changedDevelopmentDescription: false,
			enforcementNotice: false,
			floorSpaceSquareMetres: 22,
			knowsAllOwners: 'Some',
			knowsOtherOwners: 'Some',
			lpaCode: 'Q9999',
			nearbyCaseReferences: ['1000000'],
			neighbouringSiteAddresses: [],
			originalDevelopmentDescription: 'A test description',
			ownersInformed: true,
			ownsAllLand: true,
			ownsSomeLand: true,
			siteAccessDetails: ['Come and see'],
			siteAddressCounty: 'Somewhere',
			siteAddressLine1: 'Somewhere',
			siteAddressLine2: 'Somewhere St',
			siteAddressPostcode: 'BS21 6LE',
			siteAddressTown: 'Somewhereville',
			siteAreaSquareMetres: 22,
			siteSafetyDetails: ["It's dangerous"],
			isGreenBelt: false
		},
		documents: [
			{
				dateCreated: '2024-03-01T13:48:35.847Z',
				documentId: '001',
				documentType: 'appellantCostsApplication',
				documentURI:
					'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
				filename: 'img1.jpg',
				mime: 'image/jpeg',
				originalFilename: 'oimg.jpg',
				size: 10293
			}
		],
		users: [
			{
				emailAddress: 'test@test.com',
				firstName: 'Testy',
				lastName: 'McTest',
				salutation: 'string',
				serviceUserType: 'Appellant',
				telephoneNumber: '01234 818181',
				organisation: 'K+C'
			}
		]
	},
	lpaqSubmission: {
		casedata: {
			caseReference: '6000000',
			lpaQuestionnaireSubmittedDate: '2024-05-31T23:00:00.000Z',
			lpaStatement: 'cupidatat ipsum eu culpa',
			siteAccessDetails: ['Here it is'],
			siteSafetyDetails: ['Fine'],
			isCorrectAppealType: true,
			isGreenBelt: false,
			inConservationArea: true,
			newConditionDetails: 'cupidatat',
			notificationMethod: ['notice', 'letter'],
			nearbyCaseReferences: ['1000000'],
			neighbouringSiteAddresses: [
				{
					neighbouringSiteAddressLine1: 'deserunt in irure do',
					neighbouringSiteAddressLine2: 'string',
					neighbouringSiteAddressTown: 'laboris ut enim et laborum',
					neighbouringSiteAddressCounty: 'reprehenderit eu mollit Excepteur sit',
					neighbouringSiteAddressPostcode: 'aliqua in qui ipsum',
					neighbouringSiteAccessDetails: 'string',
					neighbouringSiteSafetyDetails: 'magna proident incididunt in non'
				}
			],
			affectedListedBuildingNumbers: ['10001', '10002'],
			lpaCostsAppliedFor: false
		},
		documents: [
			{
				dateCreated: '2024-03-01T13:48:35.847Z',
				documentId: '001',
				documentType: 'lpaCostsApplication',
				documentURI:
					'https://pinsstdocsdevukw001.blob.core.windows.net/uploads/055c2c5a-a540-4cd6-a51a-5cfd2ddc16bf/788b8a15-d392-4986-ac23-57be2f824f9c/--12345678---chrishprofilepic.jpeg',
				filename: 'img3.jpg',
				mime: 'image/jpeg',
				originalFilename: 'oimg.jpg',
				size: 10293
			}
		]
	}
};

export { appealsApiRequests };