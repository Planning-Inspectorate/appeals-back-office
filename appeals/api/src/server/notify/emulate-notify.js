import path from 'path';
import fs from 'fs';
import formatDate, { formatTime } from '#utils/date-formatter.js';

/**
 * Emulate Notify for local dev testing
 * This generates an approximate view of what a completed email will look like sent via notify.
 * The location of the generated email can be found in \api\temp
 *
 * @param {string} templateName
 * @param {string} recipientEmail
 * @param {string} subject
 * @param {string} content
 * @returns {string}
 */
export function emulateSendEmail(templateName, recipientEmail, subject, content) {
	let blockEnd = 0;
	const contentLines = content.split('\n').map((line, index, lines) => {
		line = line.trim();
		// Handle headers
		if (line.startsWith('#')) {
			// @ts-ignore
			const headerLevel = line.match(/^#+/)[0].length;
			return `<h${headerLevel}>${line.slice(headerLevel)}</h${headerLevel}>`;
		}
		// Handle bullet lists
		if (line.startsWith('-')) {
			const isListStart = index === 0 || !lines[index - 1].startsWith('-');
			const isListEnd = index === lines.length - 1 || !lines[index + 1].startsWith('-');
			const listItem = `<li>${line.slice(1)}</li>`;
			return `${
				isListStart ? '<ul style="margin-left: 1.2rem; padding-left: 0;">' : ''
			}${listItem}${isListEnd ? '</ul>' : ''}`;
		}
		// Handle blockquotes
		if (line.startsWith('^')) {
			const blockStart =
				'<div style="margin-left: 0.25rem; border-left: 3px solid #999; padding: 0 0.75rem;">\n';
			blockEnd = index;
			while (blockEnd < lines.length && lines[blockEnd] !== '') blockEnd++;
			return `${blockStart}${line.slice(1)}<br>`;
		}
		if (blockEnd && blockEnd <= index) {
			blockEnd = 0;
			return line ? `</div>\n${line}<br>` : '</div>';
		}
		return line ? `${line}<br>` : '';
	});
	// close blockquotes if required
	if (blockEnd) {
		contentLines.push('</div>');
	}

	const emailHtml = [
		`<b>Recipient email:</b> <span>${recipientEmail}</span>`,
		`<b>Subject:</b> ${subject}`,
		'<hr>',
		contentLines.join('\n')
	].join('<br>\n');

	const outputDir = path.join(process.cwd(), 'temp');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const fileName = `${templateName} ${formatDate(new Date())} ${formatTime(new Date())}.html`;
	const fullName = path.join(outputDir, fileName);
	fs.writeFileSync(fullName, emailHtml);
	return fullName;
}
