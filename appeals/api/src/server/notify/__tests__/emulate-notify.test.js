// @ts-nocheck
import { jest } from '@jest/globals';
import mockFileSystem from 'mock-fs';
import path from 'path';
import { emulateSendEmail, generateNotifyPreview } from '#notify/emulate-notify.js';
import fs from 'fs';

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
});
