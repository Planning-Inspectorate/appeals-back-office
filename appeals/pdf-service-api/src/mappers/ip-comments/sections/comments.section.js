import standardFilters from 'nunjucks/src/filters.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import {
	formatBulletedList,
	formatDocumentData,
	formatReason
} from '../../../lib/nunjucks-filters/index.js';
const { nl2br, safe } = standardFilters;

function mapComment(ipComment) {
	const { author, created, originalRepresentation, attachments, rejectionReasons } = ipComment;

	const documents = attachments?.map((attachment) => ({
		name: attachment.documentVersion.fileName
	}));

	let dateFormat = 'd MMMM yyyy, HH:mm';
	// Only display the time if it's not midnight
	if (new Date(created).getTime().toString().endsWith('00000')) {
		dateFormat = 'd MMMM yyyy';
	}

	return {
		items: [
			{
				key: 'Interested party',
				text: author
			},
			{
				key: 'Date received',
				text: formatDate(created, dateFormat)
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
