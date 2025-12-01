// @ts-nocheck
import {
	emulateSendEmail,
	generateNotifyPreview,
	initNotifyEmulator,
	processLinks
} from '#notify/emulate-notify.js';
import { jest } from '@jest/globals';
import fs from 'fs';
import mockFileSystem from 'mock-fs';
import path from 'path';

const tempPath = path.join(process.cwd(), 'temp');

describe('emulate-notify.test', () => {
	beforeEach(() => {
		mockFileSystem({
			[tempPath]: {}
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockFileSystem.restore();
	});

	test('should emulate a notification email sent to notify', () => {
		const subject = 'We have rejected your comment: 6000437';
		const content = [
			'We have rejected your comment.',
			'',
			'#Appeal details',
			'^Appeal reference number: 6000437',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL',
			'Planning application reference: 35606/APP/1/549765',
			'',
			'##Why we rejected your comment',
			'We rejected your comment because:',
			'',
			'- Includes inflammatory content',
			'- Duplicated or repeated comment',
			'- Not relevant to this appeal',
			'',
			'The Planning Inspectorate'
		].join('\n');

		const expectedEmailText = [
			'<b>Recipient email:</b> <span>test@136s7.com</span><br>',
			'<b>Subject:</b> We have rejected your comment: 6000437<br>',
			'<hr><br>',
			'We have rejected your comment.<br>',
			'<br>',
			'<h1>Appeal details</h1>',
			'<div style="margin-left: 0.25rem; border-left: 3px solid #999; padding: 0 0.75rem;">',
			'Appeal reference number: 6000437<br>',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL<br>',
			'Planning application reference: 35606/APP/1/549765<br>',
			'</div><br>',
			'<h2>Why we rejected your comment</h2>',
			'We rejected your comment because:<br>',
			'<br>',
			'<ul style="margin-left: 1.2rem; padding-left: 0;"><li> Includes inflammatory content</li>',
			'<li> Duplicated or repeated comment</li>',
			'<li> Not relevant to this appeal</li></ul>',
			'<br>',
			'The Planning Inspectorate<br>'
		].join('\n');

		const fileName = emulateSendEmail(
			'1234567',
			'test-template',
			'test@136s7.com',
			subject,
			content
		);
		const emailText = fs.readFileSync(fileName, { encoding: 'utf8' }).trim();

		expect(emailText).toBe(expectedEmailText);
	});

	test('should generate the preview used in cya pages and for storage', () => {
		const subject = 'We have rejected your comment: 6000437';
		const content = [
			'We have rejected your comment.',
			'',
			'#Appeal details',
			'^Appeal reference number: 6000437',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL',
			'Planning application reference: 35606/APP/1/549765',
			'',
			'##Why we rejected your comment',
			'We rejected your comment because:',
			'',
			'- Includes inflammatory content',
			'- Duplicated or repeated comment',
			'- Not relevant to this appeal',
			'',
			'The Planning Inspectorate'
		].join('\n');

		const expectedEmailText = [
			'<div class="pins-notify-preview-border"> <p>We have rejected your comment.</p>',
			'',
			'<h3>Appeal details</h3>',
			'<div class="govuk-inset-text">',
			'Appeal reference number: 6000437 <br>',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL<br>',
			'Planning application reference: 35606/APP/1/549765<br>',
			'</div>',
			'<h4>Why we rejected your comment</h4>',
			'<p>We rejected your comment because:</p>',
			'',
			'<ul style="margin-left: 1.2rem; padding-left: 0;"><li> Includes inflammatory content</li>',
			'<li> Duplicated or repeated comment</li>',
			'<li> Not relevant to this appeal</li></ul>',
			'',
			'<p>The Planning Inspectorate</p> </div>'
		].join('\n');

		const expectedSubjectText =
			'<div class="pins-notify-preview-border"> We have rejected your comment: 6000437<br> </div>';

		const contentText = generateNotifyPreview(content);
		const subjectText = generateNotifyPreview(subject);
		expect(contentText).toBe(expectedEmailText);
		expect(subjectText).toBe(expectedSubjectText);
	});

	test('should generate the preview with link included', () => {
		const subject = 'We have rejected your comment: 6000437';
		const content = [
			'We have rejected your comment.',
			'',
			'#Appeal details',
			'^Appeal reference number: 6000437',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL',
			'Planning application reference: 35606/APP/1/549765',
			'',
			'##Why we rejected your comment',
			'We rejected your comment because:',
			'',
			'- Includes inflammatory content',
			'- Duplicated or repeated comment',
			'- Not relevant to this appeal',
			'',
			'[The Planning Inspectorate](https://www.gov.uk/government/organisations/planning-inspectorate)'
		].join('\n');

		const expectedEmailText = [
			'<div class="pins-notify-preview-border"> <p>We have rejected your comment.</p>',
			'',
			'<h3>Appeal details</h3>',
			'<div class="govuk-inset-text">',
			'Appeal reference number: 6000437 <br>',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL<br>',
			'Planning application reference: 35606/APP/1/549765<br>',
			'</div>',
			'<h4>Why we rejected your comment</h4>',
			'<p>We rejected your comment because:</p>',
			'',
			'<ul style="margin-left: 1.2rem; padding-left: 0;"><li> Includes inflammatory content</li>',
			'<li> Duplicated or repeated comment</li>',
			'<li> Not relevant to this appeal</li></ul>',
			'',
			'<p><a href="https://www.gov.uk/government/organisations/planning-inspectorate" class="govuk-link">The Planning Inspectorate</a></p> </div>'
		].join('\n');

		const expectedSubjectText =
			'<div class="pins-notify-preview-border"> We have rejected your comment: 6000437<br> </div>';

		const contentText = generateNotifyPreview(content);
		const subjectText = generateNotifyPreview(subject);
		expect(contentText).toBe(expectedEmailText);
		expect(subjectText).toBe(expectedSubjectText);
	});

	test('should generate the preview with link and additional [', () => {
		const subject = 'We have rejected your comment: 6000437';
		const content = [
			'We have rejected your comment.',
			'',
			'#Appeal details',
			'^Appeal reference number: 6000437',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL',
			'Planning application reference: 35606/APP/1/549765',
			'',
			'##Why we rejected your comment',
			'We rejected your comment because:',
			'some reasons - including [ to mark a link and check for damage',
			'- Includes inflammatory content',
			'- Duplicated or repeated comment',
			'- Not relevant to this appeal',
			'',
			'[The Planning Inspectorate](https://www.gov.uk/government/organisations/planning-inspectorate)',
			'',
			'^Additional note with [ character',
			'This blockquote ends at the end of content'
		].join('\n');

		const expectedEmailText = [
			'<div class="pins-notify-preview-border"> <p>We have rejected your comment.</p>',
			'',
			'<h3>Appeal details</h3>',
			'<div class="govuk-inset-text">',
			'Appeal reference number: 6000437 <br>',
			'Address: 72 Clapham High St, Wandsworth, SW4 7UL<br>',
			'Planning application reference: 35606/APP/1/549765<br>',
			'</div>',
			'<h4>Why we rejected your comment</h4>',
			'<p>We rejected your comment because:</p>',
			'<p>some reasons - including [ to mark a link and check for damage</p>',
			'<ul style="margin-left: 1.2rem; padding-left: 0;"><li> Includes inflammatory content</li>',
			'<li> Duplicated or repeated comment</li>',
			'<li> Not relevant to this appeal</li></ul>',
			'',
			'<p><a href="https://www.gov.uk/government/organisations/planning-inspectorate" class="govuk-link">The Planning Inspectorate</a></p>',
			'',
			'<div class="govuk-inset-text">',
			'Additional note with [ character <br>',
			'This blockquote ends at the end of content<br>',
			'</div> </div>'
		].join('\n');

		const expectedSubjectText =
			'<div class="pins-notify-preview-border"> We have rejected your comment: 6000437<br> </div>';

		const contentText = generateNotifyPreview(content);
		const subjectText = generateNotifyPreview(subject);
		expect(contentText).toBe(expectedEmailText);
		expect(subjectText).toBe(expectedSubjectText);
	});

	describe('processLinks', () => {
		test('should correctly process a single markdown link into an HTML anchor tag', () => {
			const input = 'This is a test with a [link text](https://example.com/path).';
			const expected =
				'This is a test with a <a href="https://example.com/path" class="govuk-link">link text</a>.';
			expect(processLinks(input)).toBe(expected);
		});

		test('should correctly process multiple markdown links in a single string', () => {
			const input =
				'Here is [first link](https://first.com) and also [second link](https://second.org).';
			const expected =
				'Here is <a href="https://first.com" class="govuk-link">first link</a> and also <a href="https://second.org" class="govuk-link">second link</a>.';
			expect(processLinks(input)).toBe(expected);
		});

		test('should return the original string if no markdown links are present', () => {
			const input = 'This string has no links at all.';
			const expected = 'This string has no links at all.';
			expect(processLinks(input)).toBe(expected);
		});

		test('should handle links with special characters in the text and URL', () => {
			const input = 'Check out [My Awesome Link!](https://example.com/search?q=test&id=123).';
			const expected =
				'Check out <a href="https://example.com/search?q=test&id=123" class="govuk-link">My Awesome Link!</a>.';
			expect(processLinks(input)).toBe(expected);
		});

		test('should handle links at the beginning and end of the string', () => {
			const input =
				'[Start Link](https://start.com) and a link at the [End Link](https://end.net).';
			const expected =
				'<a href="https://start.com" class="govuk-link">Start Link</a> and a link at the <a href="https://end.net" class="govuk-link">End Link</a>.';
			expect(processLinks(input)).toBe(expected);
		});

		test('should not process malformed markdown links', () => {
			const input = 'This is [not a link (https://bad.com).';
			const expected = 'This is [not a link (https://bad.com).';
			expect(processLinks(input)).toBe(expected);
		});

		test('should handle empty link text or URL gracefully', () => {
			const input =
				'Link with empty text: [](https://empty.com) and link with empty URL: [text]().';
			const expected =
				'Link with empty text: <a href="https://empty.com" class="govuk-link"></a> and link with empty URL: [text]().';
			expect(processLinks(input)).toBe(expected);
		});
	});

	describe('test delete temp directory', () => {
		test('should delete the temp directory when it exists', () => {
			const testFilePath = path.join(tempPath, 'test-file.md');
			fs.writeFileSync(testFilePath, 'test content');
			expect(fs.existsSync(tempPath)).toBe(true);
			expect(fs.existsSync(testFilePath)).toBe(true);
			initNotifyEmulator();
			expect(fs.existsSync(tempPath)).toBe(false);
		});

		test('should handle when temp directory does not exist', () => {
			mockFileSystem.restore();
			mockFileSystem({});
			expect(fs.existsSync(tempPath)).toBe(false);
			expect(() => initNotifyEmulator()).not.toThrow();
			expect(fs.existsSync(tempPath)).toBe(false);
		});
	});
});
