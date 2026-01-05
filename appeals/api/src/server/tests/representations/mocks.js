export const createRepRequest = {
	ipDetails: {
		firstName: 'Kevin',
		lastName: 'Fowler',
		email: 'kevin.fowler@email.com'
	},
	ipAddress: {
		addressLine1: 'Example line 1',
		town: 'London',
		postCode: 'AB1 2CD'
	},
	attachments: ['1a14cb3a-35ef-4f93-a597-61010e6b0ad8'],
	redactionStatus: 'unredacted',
	representedId: 1
};

export const repUpdateRequest = {
	status: 'valid',
	notes: 'Some notes',
	allowResubmit: true,
	redactedRepresentation: 'Some redacted text',
	siteVisitRequested: true
};

export const repResponse = {
	id: 261,
	origin: 'citizen',
	author: 'Kevin Fowler',
	status: 'awaiting_review',
	originalRepresentation: 'Some autogen text 9',
	redactedRepresentation: '',
	created: '2024-08-15T13:30:44.434Z',
	notes: '',
	attachments: [],
	representationType: 'comment',
	siteVisitRequested: false,
	source: 'citizen',
	represented: {
		id: 1,
		name: 'Joe Bloggs',
		email: 'joe.bloggs@email.com',
		address: {
			id: 1,
			addressLine1: '96 The Avenue',
			addressLine2: 'Leftfield',
			addressCountry: 'United Kingdom',
			addressCounty: 'Kent',
			postcode: 'MD21 5XY',
			addressTown: 'Maidstone'
		}
	},
	rejectionReasons: [
		{
			id: 1,
			name: 'Received after deadline',
			hasText: false,
			text: ['']
		},
		{
			id: 7,
			name: 'Other',
			hasText: true,
			text: ['Illegible or Incomplete Documentation', 'Previously Decided or Duplicate Appeal']
		}
	]
};
