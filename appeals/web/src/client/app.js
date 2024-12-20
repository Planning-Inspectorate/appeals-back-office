// Import default components for all pages
//* This will be updated based on a router -> loader flow.

import './pages/default';
import { initAll as initGovUKScripts } from 'govuk-frontend';
import initExcerpt from './components/excerpts/excerpt.js';
import initFilesListModule from './components/files-list/files-list.module.js';
import initSelectAllCheckbox from './components/select-all-checkbox/select-all-checkbox.js';
import initFileUploaderModule from './components/file-uploader/file-uploader.module.js';
import initAddAnother from './components/add-another/add-another.js';
import initShowMore from './components/show-more/show-more.js';
import { initRedactButtons } from './components/redact-button/index.js';

const initAll = () => {
	initGovUKScripts();
	initExcerpt();
	initFilesListModule();
	initSelectAllCheckbox();
	initFileUploaderModule();
	initAddAnother();
	initShowMore();
	initRedactButtons();
};

initAll();
