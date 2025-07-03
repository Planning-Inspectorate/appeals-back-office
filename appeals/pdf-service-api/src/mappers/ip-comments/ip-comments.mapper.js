import { commentsSection } from './sections/comments.section.js';

export default function mapIpCommentsData(templateData) {
	const { awaitingReviewComments, acceptedComments /*rejectedComments*/ } = templateData;
	return {
		details: templateData,
		sections: [
			commentsSection(awaitingReviewComments, 'Awaiting review'),
			commentsSection(acceptedComments, 'Accepted')
			// commentsSection(rejectedComments, 'Rejected')
		]
	};
}
