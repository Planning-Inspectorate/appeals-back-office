// import { appealShortReference } from '#lib/appeals-formatter.js';
// import { dateToDisplayDate, dateToDisplayTime } from '#lib/dates.js';
// import { convert24hTo12hTimeStringFormat } from '#lib/times.js';
// import { getOriginPathname } from '#lib/url-utilities.js';
// import { mapUser } from '../audit/audit.service.js';
// import { getAppealCasenotes, postAppealCasenote } from './casenotes.service.js';

// /**
//  *
//  * @param {import('@pins/express/types/express.js').Request} request
//  * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
//  */
// export const renderCasenotes = async (request, response) => {
// 	const { appealId } = request.params;
// 	const appeal = request.currentAppeal;
// 	const appealCasenotes = await getAppealCasenotes(request.apiClient, appealId);

// 	if (appealCasenotes) {
// 		const casenotes = await Promise.all(
// 			appealCasenotes.map(async (casenote) => {
// 				const createdAt = new Date(casenote.createdAt);
// 				return {
// 					date: dateToDisplayDate(createdAt),
// 					day: new Intl.DateTimeFormat("en-GB", {weekday: "long"}).format(createdAt),
// 					time: convert24hTo12hTimeStringFormat(dateToDisplayTime(createdAt)),
// 					comment: casenote.comment,
// 					user: (await mapUser(casenote.azureAdUserId, request.session)).split('@')[0]
// 				};
// 			})
// 		);
// 		const shortAppealReference = appealShortReference(appeal.appealReference);
// 		console.log(casenotes);
// 		return response.status(200).render('appeals/appeal/comment.njk', {
// 			pageContent: {
// 				casenotes,
// 				caseReference: shortAppealReference,
// 				backLinkUrl: `/appeals-service/appeal-details/${appeal.appealId}`,
// 				title: `Case notes - ${shortAppealReference}`,
// 				preHeading: `Appeal ${shortAppealReference}`,
// 				heading: 'Case notes'
// 			}
// 		})
// 	}
// };

// /**
//  *
//  * @param {import('@pins/express/types/express.js').Request} request
//  * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
//  */
// export const postCasenote = async (request, response) => {
// 	const { appealId } = request.params;
// 	const comment = request.body['comment'];
// 	const currentUrl = getOriginPathname(request);

// 	const commentResponse = await postAppealCasenote(request.apiClient, appealId, comment);
// 	console.log(currentUrl)
// 	if(commentResponse){
// 		return response.redirect(`${currentUrl}`);
// 	}

// 	return response.status(500).render('app/500.njk')

// }
