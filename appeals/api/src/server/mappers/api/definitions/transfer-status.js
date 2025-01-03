const transferStatus = {
	type: 'object',
	required: ['transferredAppealType', 'transferredAppealReference'],
	properties: {
		transferredAppealType: {
			type: 'string'
		},
		transferredAppealReference: {
			type: 'string'
		}
	}
};

export const TransferStatus = transferStatus;
