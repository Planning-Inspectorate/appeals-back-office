import {
	formatBulletedList,
	formatDocumentData,
	formatReason
} from '../../../lib/nunjucks-filters/index.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import standardFilters from 'nunjucks/src/filters.js';
const { nl2br, safe } = standardFilters;

function mapComment(ipComment) {
	const { author, created, originalRepresentation, attachments, rejectionReasons } = ipComment;

	const documents = attachments?.map((attachment) => ({
		name: attachment.documentVersion.fileName
	}));

	return {
		items: [
			{
				key: 'Interested party',
				text: author
			},
			{
				key: 'Date received',
				text: formatDate(created, 'd MMMM yyyy, HH:mm')
			},
			{
				key: 'Comment',
				text: safe(nl2br(originalRepresentation || 'No comment provided'))
			},
			{
				key: 'Supporting documents',
				html: formatDocumentData({ documents })
			},
			...(rejectionReasons?.length > 0
				? [
						{
							key: 'Why was the comment rejected?',
							html: formatBulletedList(rejectionReasons.map(formatReason))
						}
				  ]
				: [])
		]
	};
}

export function commentsSection(comments, heading = 'Accepted') {
	return {
		heading,
		comments: comments.map(mapComment)
	};
}
