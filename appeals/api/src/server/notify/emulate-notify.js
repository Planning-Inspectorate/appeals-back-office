import path from 'path';
import fs from 'fs';
import { formatSortableDateTime } from '@pins/appeals/utils/date-formatter.js';

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
			return line ? `</div>\n${line}<br>` : '</div><br>';
		}
		return line ? `${line}<br>` : '<br>';
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

	// Allow for both Linux (Mac) and Windows file systems
	const fileName = `${formatSortableDateTime(new Date())} ${templateName}.html`.replaceAll(
		':',
		'_'
	);

	const fullName = path.join(process.cwd(), 'temp', fileName);
	fs.writeFileSync(fullName, emailHtml);
	return fullName;
}

/**
 * Deletes the local temporary folder and the emails within it
 *
 * @returns {void}
 */
export function initNotifyEmulator() {
	const outputDir = path.join(process.cwd(), 'temp');
	if (fs.existsSync(outputDir)) {
		fs.rmdirSync(outputDir, { recursive: true });
	}
}

/**
 * @param {string} content,
 * @param {boolean} [noBottomBorder]
 * @returns {string}
 */
export const generateNotifyPreview = (content, noBottomBorder) => {
	let blockEnd = 0;
	const contentLines = content.split('\n').map((line, index, lines) => {
		line = line.trim();
		// Handle headers
		if (line.startsWith('#')) {
			// @ts-ignore
			const headerLeveloriginal = line.match(/^#+/)[0].length;
			const newHeaderLevel = headerLeveloriginal + 2;
			return `<h${newHeaderLevel}>${line.slice(headerLeveloriginal)}</h${newHeaderLevel}>`;
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
			const blockStart = '<div class="govuk-inset-text">\n';
			blockEnd = index;
			while (blockEnd < lines.length && lines[blockEnd] !== '') blockEnd++;
			return `${blockStart}${line.slice(1)} <br>`;
		}
		if (blockEnd && blockEnd <= index) {
			blockEnd = 0;

			return line ? `</div>\n${line}` : '</div>';
		}
		return line && line !== ''
			? blockEnd == 0 && lines.length !== 1
				? `<p>${line}</p>`
				: `${line}<br>`
			: '';
	});
	// close blockquotes if require
	if (blockEnd) {
		contentLines.push('</div>');
	}

	const emailHtml = noBottomBorder
		? '<div class="pins-notify-preview-border-no-bottom"> ' + contentLines.join('\n') + ' </div>'
		: '<div class="pins-notify-preview-border"> ' + contentLines.join('\n') + ' </div>';
	const processedHtml = processLinks(emailHtml);

	return processedHtml;
};
const processLinks = (/** @type {string} */ line) => {
	const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
	return line.replace(linkPattern, (match, linkText, url) => {
		return `<a href="${url}" class="govuk-link">${linkText}</a>`;
	});
};
