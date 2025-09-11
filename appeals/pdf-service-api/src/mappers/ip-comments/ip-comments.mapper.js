import { commentsSection } from './sections/comments.section.js';

export default function mapIpCommentsData(templateData) {
	const {
		awaitingReviewComments = [],
		acceptedComments = [],
		publishedComments = [] /*rejectedComments*/
	} = templateData || {};
	const sections = [];
	if (publishedComments.length) {
		sections.push(commentsSection(publishedComments, 'Published'));
	} else {
		sections.push(commentsSection(awaitingReviewComments, 'Awaiting review'));
		sections.push(commentsSection(acceptedComments, 'Accepted'));
		// sections.push(commentsSection(rejectedComments, 'Rejected'));
	}
	if (publishedComments)
		return {
			details: templateData,
			sections
		};
}
