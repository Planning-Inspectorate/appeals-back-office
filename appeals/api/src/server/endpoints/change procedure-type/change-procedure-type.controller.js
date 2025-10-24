// import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
// import { changeProcedureType } from './change-procedure-type.service.js';

// /**
//  * @param {Request} req
//  * @param {Response} res
//  * @returns {Promise<Response>}
//  */
// export const requestChangeOfProcedureType = async (req, res) => {
// 	// const appeal = req.appeal;
// 	const sessionValues = req.body;
//
// 	console.log('req!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ', sessionValues);
//
// 	//manage old data
// 	switch (sessionValues.existingAppealProcedure) {
// 		case 'writtenRepresentation':
// 			// logic for written representation
// 			break;
// 		case 'hearing':
// 			// logic for hearing
// 			break;
// 		case 'inquiry':
// 			// logic for inquiry
// 			break;
// 		default:
// 		// default logic
// 	}
//
// 	//set new data
// 	switch (sessionValues.appealProcedure) {
// 		case 'writtenRepresentation':
// 			// logic for written representation
// 			break;
// 		case 'hearing':
// 			// logic for hearing
// 			break;
// 		case 'inquiry':
// 			// logic for inquiry
// 			break;
// 		default:
// 		// default logic
// 	}
//
// 	// const notifyClient = req.notifyClient;
//
// 	// const siteAddress = appeal.address
// 	// 	? formatAddressSingleLine(appeal.address)
// 	// 	: 'Address not available';
//
// 	// await changeProcedureType(
// 	// 	appeal,
// 	// 	newAppealTypeId,
// 	// 	notifyClient,
// 	// 	siteAddress,
// 	// 	req.get('azureAdUserId') || ''
// 	// );
//
// 	// return res.send(true);
// };
