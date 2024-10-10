import { readFileSync } from 'fs';

/**
 * @typedef {'none' | 'in-import' | 'in-type' | 'in-codeblock' | 'end'} CursorState
 * @typedef {'empty' | 'filling' | 'contains-import' | 'contains-type' | 'contains-codeblock'} FragmentState
 */

const IMPORT_START_INDICATOR = Buffer.from('import');
const TYPE_START_INDICATOR = Buffer.from('/**');
const BLOCK_START_INDICATORS = ['const', 'export', 'async', 'function'].map((str) =>
	Buffer.from(str)
);

const IMPORT_END_INDICATOR = Buffer.from(';');
const TYPE_END_INDICATOR = Buffer.from('*/');

export class Cursor {
	/** @type {CursorState} */
	#state = 'none';

	/** @type {number} */
	#position = 0;

	/** @type {Buffer} */
	#fileBuffer;

	/** @type {Buffer} */
	#fragmentBuffer = Buffer.from('');

	/** @type {FragmentState} */
	#fragmentState = 'empty';

	/** @param {string} filePath */
	constructor(filePath) {
		this.#fileBuffer = readFileSync(filePath);
	}

	logInternals() {
		console.log('state: ', this.#state);
		console.log('fragment state: ', this.#fragmentState);
		console.log('position: ', this.#position);
		console.log('fragmentBuffer: ', this.#fragmentBuffer.toString());
	}

	/** @param {CursorState} next */
	#setState(next) {
		this.#state = next;
	}

	/** @returns {CursorState} */
	getState() {
		return this.#state;
	}

	/** @param {FragmentState} next */
	#setFragmentState(next) {
		this.#fragmentState = next;
	}

	/** @returns {FragmentState} */
	getFragmentState() {
		return this.#fragmentState;
	}

	/** @param {number} next */
	setPosition(next) {
		if (typeof next !== 'number' || next < 0)
			throw new Error('Attempted to set an invalid cursor position');
		this.#position = next;
	}

	/** @returns {number}  */
	getPosition() {
		return this.#position;
	}

	/** @returns {boolean} */
	fragmentBufferIsCompleteBlock() {
		const bufferStr = this.#fragmentBuffer.toString();
		/** @type {{ unpairedBrackets: number, unpairedBraces: number, bracedBlocks: number, bracketedBlocks: number, semis: number }} */
		const { unpairedBrackets, unpairedBraces, bracedBlocks, bracketedBlocks, semis } = [
			...bufferStr
		].reduce(
			(acc, cur) => {
				if (cur === '(') {
					return {
						...acc,
						unpairedBrackets: acc.unpairedBrackets + 1,
						bracketedBlocks: acc.bracketedBlocks + 1
					};
				} else if (cur === ')') {
					return { ...acc, unpairedBrackets: acc.unpairedBrackets - 1 };
				} else if (cur === '{') {
					return {
						...acc,
						unpairedBraces: acc.unpairedBraces + 1,
						bracedBlocks: acc.bracedBlocks + 1
					};
				} else if (cur === '}') {
					return { ...acc, unpairedBraces: acc.unpairedBraces - 1 };
				} else if (cur === ';') {
					return { ...acc, semis: acc.semis + 1 };
				}

				return acc;
			},
			{
				unpairedBrackets: 0,
				unpairedBraces: 0,
				bracedBlocks: 0,
				bracketedBlocks: 0,
				semis: 0
			}
		);

		const isArrowFunction = /^(export )?const[\sa-z=(),]+=>/gim.exec(bufferStr);

		// We have not yet scanned the whole block
		if (unpairedBrackets || unpairedBraces) {
			return false;
		}

		// We may have read arguments completely but not entered the function body
		if (!unpairedBrackets && !bracedBlocks && !semis) {
			return false;
		}

		// We may have only read destructured arguments but not entered the body yet
		if (bracketedBlocks === 1 && bracedBlocks === 1 && /\({/.exec(bufferStr) && !semis) {
			return false;
		}

		// Include the final semicolon of an arrow function
		if (
			!unpairedBrackets &&
			bracedBlocks &&
			isArrowFunction &&
			bufferStr[bufferStr.length - 1] !== ';'
		) {
			return false;
		}

		return true;
	}

	/** @returns {string}  */
	moveForward() {
		const currentPosition = this.getPosition();
		const nextPosition = currentPosition + 1;
		const nextChar = this.#fileBuffer.subarray(currentPosition, nextPosition);
		if (!nextChar.length) {
			this.#setState('end');
			return '';
		}
		this.setPosition(nextPosition);
		this.#moveFragmentBufferForward(nextChar);
		return nextChar.toString();
	}

	/**
	 * @param {Buffer} char
	 * @returns {Buffer}
	 */
	#moveFragmentBufferForward(char) {
		if (this.getState() === 'end') {
			return this.#fragmentBuffer;
		}

		const toConcat = (() => {
			if (this.getFragmentState() === 'empty') return Buffer.from(char.toString().trim());
			return char;
		})();
		if (toConcat.length) {
			this.#setFragmentState('filling');
		}
		// @ts-ignore these types overlap in ts5.6
		this.#fragmentBuffer = Buffer.concat([this.#fragmentBuffer, toConcat]);

		// Start of import
		// @ts-ignore these types overlap in ts5.6
		if (this.#fragmentBuffer.equals(IMPORT_START_INDICATOR)) {
			this.#setState('in-import');
		}

		// Start of type
		// @ts-ignore these types overlap in ts5.6
		if (this.#fragmentBuffer.equals(TYPE_START_INDICATOR)) {
			this.#setState('in-type');
		}

		// Start of block
		// @ts-ignore these types overlap in ts5.6
		if (BLOCK_START_INDICATORS.some((indicator) => this.#fragmentBuffer.equals(indicator))) {
			this.#setState('in-codeblock');
		}

		// End of import
		// @ts-ignore these types overlap in ts5.6
		if (this.getState() === 'in-import' && char.equals(IMPORT_END_INDICATOR)) {
			this.#setState('none');
			this.#setFragmentState('contains-import');
		}

		// End of type
		if (
			this.getState() === 'in-type' &&
			this.#fragmentBuffer
				.subarray(this.#fragmentBuffer.length - 2, this.#fragmentBuffer.length)
				// @ts-ignore these types overlap in ts5.6
				.equals(TYPE_END_INDICATOR)
		) {
			this.#setState('none');
			this.#setFragmentState('contains-type');
		}

		// End of block
		if (this.getState() === 'in-codeblock' && this.fragmentBufferIsCompleteBlock()) {
			this.#setState('none');
			this.#setFragmentState('contains-codeblock');
		}

		return this.#fragmentBuffer;
	}

	/**
	 * @returns {string}
	 */
	takeFragment() {
		const fragment = this.#fragmentBuffer.toString();
		this.#fragmentBuffer = Buffer.from('');
		this.#setFragmentState('empty');
		return fragment;
	}
}
