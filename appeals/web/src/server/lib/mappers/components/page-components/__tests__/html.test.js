import { simpleHtmlComponent } from '../html.js';

describe('simpleHtmlComponent function', () => {
	it('should create a self-closing tag given only the first argument', () => {
		const output = simpleHtmlComponent('br');

		expect(output).toEqual({
			type: 'html',
			parameters: {
				html: '<br>'
			}
		});
	});

	it('should create a self-closing tag with arguments given no content argument', () => {
		const output = simpleHtmlComponent('input', { type: 'text' });

		expect(output).toEqual({
			type: 'html',
			parameters: {
				html: '<input type="text">'
			}
		});
	});

	it('should create a valid tag given the tag and content parameters', () => {
		const output = simpleHtmlComponent('p', {}, 'Hello world');

		expect(output).toEqual({
			type: 'html',
			parameters: {
				html: '<p>Hello world</p>'
			}
		});
	});

	it('should create a tag with arguments given all arguments', () => {
		const output = simpleHtmlComponent('a', { href: '#' }, 'Hello world');

		expect(output).toEqual({
			type: 'html',
			parameters: {
				html: '<a href="#">Hello world</a>'
			}
		});
	});
});
