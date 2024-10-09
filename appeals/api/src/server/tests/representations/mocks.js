export const repRedactionRequest = {
	redactedRepresentation: 'Some redacted text'
};

export const repStatusUpdateRequest = {
	status: 'valid',
	notes: 'Some notes'
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
	}
};
