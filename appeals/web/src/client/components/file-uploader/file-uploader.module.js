import clientActions from './_client-actions.js';

/** @type {NodeListOf<HTMLElement>} */
const allUploadForms = document.querySelectorAll('.pins-file-upload');

const initFileUploaderModule = () => {
	if (allUploadForms.length === 0) return;

	const { bindEvents } = clientActions(allUploadForms[0]);

	bindEvents();
};

export default initFileUploaderModule;
