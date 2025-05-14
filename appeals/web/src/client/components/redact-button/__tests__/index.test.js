// @ts-nocheck
import {
	generateOnClick,
	setAreaText,
	isHTMLTextAreaElement,
	isHTMLButtonElement,
	isHTMLDivElement,
	initRedactButtons,
	SELECTORS
} from '../index.js';
import { JSDOM } from 'jsdom';
import { jest } from '@jest/globals';

const setupJSDOMGlobals = () => {
	const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {});
	const { window } = dom;

	const originalGlobals = {
		window: global.window,
		document: global.document,
		HTMLTextAreaElement: global.HTMLTextAreaElement,
		HTMLButtonElement: global.HTMLButtonElement,
		HTMLDivElement: global.HTMLDivElement,
		MouseEvent: global.MouseEvent,
		Node: global.Node,
		Element: global.Element
	};

	global.window = window;
	global.document = window.document;
	global.HTMLTextAreaElement = window.HTMLTextAreaElement;
	global.HTMLButtonElement = window.HTMLButtonElement;
	global.HTMLDivElement = window.HTMLDivElement;
	global.MouseEvent = window.MouseEvent;
	global.Node = window.Node;
	global.Element = window.Element;

	return () => {
		Object.keys(originalGlobals).forEach((key) => {
			if (originalGlobals[key] === undefined) {
				delete global[key];
			} else {
				global[key] = originalGlobals[key];
			}
		});
	};
};

describe('generateOnClick', () => {
	/**
	 * @type {{HTMLTextAreaElement}}
	 */
	let mockTextarea;
	/**
	 * @type { { preventDefault: () => void } | null }
	 */
	let mockEvent = null;

	//intialise elements for testing
	beforeEach(() => {
		mockTextarea = {
			value: '',
			selectionStart: 0,
			selectionEnd: 0
		};
		mockEvent = {
			preventDefault: jest.fn()
		};
	});
	it('should return a function', () => {
		const onClickHandler = generateOnClick(mockTextarea);
		expect(typeof onClickHandler).toBe('function');
	});
	it('should call event.preventDefault when handler is invoked', () => {
		const onClickHandler = setAreaText(mockTextarea, 'Any Text');
		onClickHandler(mockEvent);
		expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
	});

	it('should set the textarea value to the provided redactedText', () => {
		const newText = 'This is the new redacted text.';
		const onClickHandler = setAreaText(mockTextarea, newText);
		expect(mockTextarea.value).not.toBe(newText);
		onClickHandler(mockEvent);
		expect(mockTextarea.value).toBe(newText);
	});

	it('should overwrite existing textarea value', () => {
		mockTextarea.value = 'This will be overwritten.';
		const finalValue = 'Overwritten';
		const onClickHandler = setAreaText(mockTextarea, finalValue);

		onClickHandler(mockEvent);
		expect(mockTextarea.value).toBe(finalValue);
	});

	it('should be able to set the textarea value to an empty string', () => {
		mockTextarea.value = 'Some content';
		const finalValue = '';
		const onClickHandler = setAreaText(mockTextarea, finalValue);

		onClickHandler(mockEvent);
		expect(mockTextarea.value).toBe(finalValue);
	});

	it('should redact text from the textarea', () => {
		const originalCommentText = 'This is a tests comment to redact';
		const redactedCommentText = 'This █████tests comment to redact';
		mockTextarea.value = originalCommentText;
		mockTextarea.selectionStart = 5;
		mockTextarea.selectionEnd = 10;

		const onClickHandler = generateOnClick(mockTextarea);
		onClickHandler(mockEvent);
		expect(mockTextarea.value).not.toBe(originalCommentText);
		expect(mockTextarea.value).toBe(redactedCommentText);
	});

	it('should return early if no text is selected', () => {
		const originalCommentText = 'This is a tests comment to redact';
		mockTextarea.value = originalCommentText;
		mockTextarea.selectionStart = 5;
		mockTextarea.selectionEnd = 5;

		const onClickHandler = generateOnClick(mockTextarea);
		onClickHandler(mockEvent);
		expect(mockTextarea.value).toBe(originalCommentText);
	});
});

describe('Type Guards', () => {
	let cleanupJSDOM;

	// Setup JSDOM globals
	beforeAll(() => {
		cleanupJSDOM = setupJSDOMGlobals();
	});

	// Restore original globals
	afterAll(() => {
		cleanupJSDOM();
	});
	describe('isHTMLTextAreaElement', () => {
		it('should return true when passed an actual HTMLTextAreaElement', () => {
			const element = document.createElement('textarea');
			expect(isHTMLTextAreaElement(element)).toBe(true);
		});

		it('should return false when passed an HTMLButtonElement', () => {
			const element = document.createElement('button');
			expect(isHTMLTextAreaElement(element)).toBe(false);
		});

		it('should return false when passed a generic HTMLDivElement', () => {
			const element = document.createElement('div');
			expect(isHTMLTextAreaElement(element)).toBe(false);
		});

		it('should return false when passed null', () => {
			expect(isHTMLTextAreaElement(null)).toBe(false);
		});

		it('should return false when passed undefined', () => {
			expect(isHTMLTextAreaElement(undefined)).toBe(false);
		});

		it('should return false when passed a plain object', () => {
			const plainObject = {};
			expect(isHTMLTextAreaElement(plainObject)).toBe(false);
		});

		it('should return false when passed a string', () => {
			const str = '<textarea></textarea>';
			expect(isHTMLTextAreaElement(str)).toBe(false);
		});

		it('should return false when passed a number', () => {
			const num = 123;
			expect(isHTMLTextAreaElement(num)).toBe(false);
		});
	});

	describe('isHTMLButtonElement', () => {
		it('should return true when passed an actual HTMLButtonElement', () => {
			const element = document.createElement('button');
			expect(isHTMLButtonElement(element)).toBe(true);
		});

		it('should return false when passed an HTMLTextAreaElement', () => {
			const element = document.createElement('textarea');
			expect(isHTMLButtonElement(element)).toBe(false);
		});

		it('should return false when passed a generic HTMLParagraphElement', () => {
			const element = document.createElement('p');
			expect(isHTMLButtonElement(element)).toBe(false);
		});
		it('should return false when passed null', () => {
			expect(isHTMLButtonElement(null)).toBe(false);
		});

		it('should return false when passed undefined', () => {
			expect(isHTMLButtonElement(undefined)).toBe(false);
		});

		it('should return false when passed a plain object', () => {
			const plainObject = { nodeName: 'BUTTON' };
			expect(isHTMLButtonElement(plainObject)).toBe(false);
		});

		it('should return false when passed a string', () => {
			const str = 'button';
			expect(isHTMLButtonElement(str)).toBe(false);
		});

		it('should return false when passed a number', () => {
			const num = 0;
			expect(isHTMLButtonElement(num)).toBe(false);
		});
	});
	describe('isHTMLDivElement', () => {
		it('should return true when passed an actual HTMLDivElement', () => {
			const element = document.createElement('div');
			expect(isHTMLDivElement(element)).toBe(true);
		});

		it('should return false when passed an HTMLTextAreaElement', () => {
			const element = document.createElement('textarea');
			expect(isHTMLDivElement(element)).toBe(false);
		});

		it('should return false when passed an HTMLButtonElement', () => {
			const element = document.createElement('button');
			expect(isHTMLDivElement(element)).toBe(false);
		});

		it('should return false when passed a generic HTMLSpanElement', () => {
			const element = document.createElement('span');
			expect(isHTMLDivElement(element)).toBe(false);
		});
		it('should return false when passed null', () => {
			expect(isHTMLDivElement(null)).toBe(false);
		});
		it('should return false when passed undefined', () => {
			expect(isHTMLDivElement(undefined)).toBe(false);
		});

		it('should return false when passed a plain object', () => {
			const plainObject = {};
			expect(isHTMLDivElement(plainObject)).toBe(false);
		});

		it('should return false when passed a string', () => {
			const str = '<div></div>';
			expect(isHTMLDivElement(str)).toBe(false);
		});

		it('should return false when passed a number', () => {
			const num = 100;
			expect(isHTMLDivElement(num)).toBe(false);
		});
	});
});

describe('initRedactButtons (Integration Tests)', () => {
	let mockEvent;
	let cleanupJSDOM;

	// Setup JSDOM globals
	beforeAll(() => {
		cleanupJSDOM = setupJSDOMGlobals();
	});

	// Restore original globals
	afterAll(() => {
		cleanupJSDOM();
	});
	const setupTestDOM = ({
		addOriginal = true,
		addRedact = true,
		addUndo = true,
		addRevert = true,
		addTextarea = true,
		addSavedTextarea = true,
		originalType = 'div',
		redactType = 'button',
		undoType = 'button',
		revertType = 'button',
		textareaType = 'textarea',
		originalText = 'Original Sample Text',
		textareaText = 'Initial Textarea Content',
		savedTextAreaText = 'Saved Textarea Content'
	} = {}) => {
		const originalId = SELECTORS.ORIGINAL_COMMENT_IDENTIFIER.substring(1);
		const redactId = SELECTORS.REDACT_BUTTON_IDENTIFIER.substring(1);
		const undoId = SELECTORS.UNDO_BUTTON_IDENTIFIER.substring(1);
		const revertId = SELECTORS.REVERT_BUTTON.substring(1);
		const textareaId = SELECTORS.TEXTAREA_IDENTIFIER.substring(1);
		const savedTextareaId = SELECTORS.SAVED_TEXTAREA.substring(1);
		// Uses global document now available from beforeAll
		document.body.innerHTML = `
			${addOriginal ? `<${originalType} id="${originalId}">${originalText}</${originalType}>` : ''}
			${addRedact ? `<${redactType} id="${redactId}">Redact</${redactType}>` : ''}
			${addUndo ? `<${undoType} id="${undoId}">Undo</${undoType}>` : ''}
			${addRevert ? `<${revertType} id="${revertId}">Revert</${revertType}>` : ''}
			${addTextarea ? `<${textareaType} id="${textareaId}">${textareaText}</${textareaType}>` : ''}
			${addSavedTextarea ? `<div id="${savedTextareaId}">${savedTextAreaText}</div>` : ''}
			}
		`;
	};
	beforeEach(() => {
		// Reset ONLY the DOM body content and mockEvent for each test
		document.body.innerHTML = ''; // Uses global document
		mockEvent = { preventDefault: jest.fn() };
	});

	it('should initialise handlers and redact selected text on redact button click', () => {
		setupTestDOM({ textareaText: 'Redact the middle word.' });
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);
		textarea.selectionStart = 7;
		textarea.selectionEnd = 10;
		//intitialse page
		initRedactButtons();

		expect(redactButton.onclick).toBeInstanceOf(Function);
		//redact text
		redactButton.onclick(mockEvent);

		// Check that the text is correct
		expect(textarea.value).toBe('Redact ███ middle word.');
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should initialise handlers and revert text to initial state on undo button click', () => {
		const initialText = 'Redact the middle word.';
		const originalText = 'Redact the middle word.';
		setupTestDOM({ textareaText: initialText, savedTextAreaText: originalText });
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);
		const undoButton = document.querySelector(SELECTORS.UNDO_BUTTON_IDENTIFIER);
		textarea.selectionStart = 7;
		textarea.selectionEnd = 10;

		initRedactButtons();
		expect(redactButton.onclick).toBeInstanceOf(Function);

		redactButton.onclick(mockEvent);

		expect(textarea.value).toBe('Redact ███ middle word.');

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(undoButton.onclick).toBeInstanceOf(Function);

		undoButton.onclick(mockEvent);
		expect(textarea.value).toBe(initialText);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should initialise handlers and revert text to original comment on revert button click', () => {
		const originalText = 'This is the original comment text.';
		const textareaText = 'This ███the original comment text.';
		setupTestDOM({ originalText: originalText, textareaText: textareaText });
		const revertButton = document.querySelector(SELECTORS.REVERT_BUTTON);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		textarea.selectionStart = 15;
		textarea.selectionEnd = 20;

		initRedactButtons();
		expect(revertButton.onclick).toBeInstanceOf(Function);
		expect(redactButton.onclick).toBeInstanceOf(Function);

		redactButton.onclick(mockEvent);
		expect(textarea.value).toBe('This ███the ori█████ comment text.');
		expect(mockEvent.preventDefault).toHaveBeenCalled();

		revertButton.onclick(mockEvent);
		expect(textarea.value).toBe(originalText);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should initialise handlers and undo text to textarea comment on undo button click', () => {
		const originalText = 'This is the original comment text.';
		const textareaText = 'This ███the original comment text.';
		setupTestDOM({
			originalText: originalText,
			textareaText: textareaText,
			savedTextAreaText: textareaText
		});
		const undoButton = document.querySelector(SELECTORS.UNDO_BUTTON_IDENTIFIER);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		textarea.selectionStart = 15;
		textarea.selectionEnd = 20;

		initRedactButtons();
		expect(undoButton.onclick).toBeInstanceOf(Function);
		expect(undoButton.onclick).toBeInstanceOf(Function);

		redactButton.onclick(mockEvent);
		expect(textarea.value).toBe('This ███the ori█████ comment text.');
		expect(mockEvent.preventDefault).toHaveBeenCalled();

		undoButton.onclick(mockEvent);
		expect(textarea.value).toBe(textareaText);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should initialise handlers and revert text to text area original text if undo button is clicked', () => {
		const originalText = 'This is the original comment text.';
		setupTestDOM({
			originalText: originalText,
			textareaText: 'This ███the original comment text.'
		});
		const revertButton = document.querySelector(SELECTORS.REVERT_BUTTON);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);

		initRedactButtons();
		expect(revertButton.onclick).toBeInstanceOf(Function);

		revertButton.onclick(mockEvent);
		expect(textarea.value).toBe(originalText);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should do nothing on redact click if no text is selected', () => {
		const initialText = 'No selection here.';
		setupTestDOM({ textareaText: initialText });
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		const textarea = document.querySelector(SELECTORS.TEXTAREA_IDENTIFIER);

		textarea.selectionStart = 5;
		textarea.selectionEnd = 5;

		initRedactButtons();
		expect(redactButton.onclick).toBeInstanceOf(Function);
		redactButton.onclick(mockEvent);

		expect(textarea.value).toBe(initialText);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should not attach handlers if an element is missing', () => {
		setupTestDOM({ addTextarea: false });
		initRedactButtons();
		const redactButton = document.querySelector(SELECTORS.REDACT_BUTTON_IDENTIFIER);
		expect(redactButton.onclick).toBeNull();
	});

	it('should not attach handlers if an element is the wrong type', () => {
		setupTestDOM({ revertType: 'p' });
		initRedactButtons();
		const revertButton = document.querySelector(SELECTORS.REVERT_BUTTON);
		expect(revertButton).not.toBeNull();

		expect(revertButton.onclick).toBeNull();
		const undoButton = document.querySelector(SELECTORS.UNDO_BUTTON_IDENTIFIER);
		expect(undoButton.onclick).toBeNull();
	});
});
