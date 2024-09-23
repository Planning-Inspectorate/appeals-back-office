// @ts-nocheck
const CLASSES = {
	pagination: 'pins-pagination',
	tabs: 'pins-tabs'
};

const SELECTORS = {
	paginationLink: `.${CLASSES.pagination} a`,
	tab: `.${CLASSES.tabs} [id^="tab_"]` // Select all elements with IDs starting with "tab_"
};

const DEFAULTS = {
	pageSize: 25,
	pageNumber: 1
};

const getPaginationState = (tabId) => {
	return JSON.parse(localStorage.getItem(`pagination_${tabId}`)) || { ...DEFAULTS };
};

const setPaginationState = (tabId, state) => {
	localStorage.setItem(`pagination_${tabId}`, JSON.stringify(state));
};

const updateQueryString = (tabId) => {
	const url = new URL(window.location);
	const { pageSize, pageNumber } = getPaginationState(tabId);

	url.searchParams.set('pageSize', pageSize);
	url.searchParams.set('pageNumber', pageNumber);
	url.searchParams.set('tab', tabId);

	window.history.pushState({}, '', url);
	window.location.reload();
};

const handleTabClick = (event) => {
	event.preventDefault();
	const tabId = event.target.getAttribute('href').substring(1);
	const currentTabId = new URLSearchParams(window.location.search).get('tab');

	if (currentTabId) {
		const currentPageSize = new URLSearchParams(window.location.search).get('pageSize');
		const currentPageNumber = new URLSearchParams(window.location.search).get('pageNumber');
		setPaginationState(currentTabId, { pageSize: currentPageSize, pageNumber: currentPageNumber });
	}

	updateQueryString(tabId);
};

const handlePaginationClick = (event) => {
	event.preventDefault();
	const currentTabId = new URLSearchParams(window.location.search).get('tab');
	const newPageNumber = new URL(event.target.href).searchParams.get('pageNumber');

	if (currentTabId) {
		const currentPageSize = new URLSearchParams(window.location.search).get('pageSize');
		setPaginationState(currentTabId, { pageSize: currentPageSize, pageNumber: newPageNumber });
		window.location.href = event.target.href;
	}
};

const bindEvents = (tabs, paginationLinks) => {
	tabs.forEach((tab) => tab.addEventListener('click', handleTabClick));
	paginationLinks.forEach((link) => link.addEventListener('click', handlePaginationClick));
};

const setActiveTab = (tabs) => {
	const urlParams = new URLSearchParams(window.location.search);
	const activeTab = urlParams.get('tab') || tabs[0].id.substring(4); // Default to the first tab if no tab is specified
	const activeTabElement = document.getElementById(`tab_${activeTab}`);

	// Retrieve and apply pagination state from localStorage only if the tab query parameter is not present
	if (!urlParams.has('tab')) {
		const { pageSize, pageNumber } = getPaginationState(activeTab);
		urlParams.set('pageSize', pageSize);
		urlParams.set('pageNumber', pageNumber);
		window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
	}

	if (activeTabElement && !urlParams.has('tab')) {
		activeTabElement.click();
	}
};

const initTabsWithPagination = () => {
	document.addEventListener('DOMContentLoaded', function () {
		const tabs = Array.from(document.querySelectorAll(SELECTORS.tab));
		const paginationLinks = document.querySelectorAll(SELECTORS.paginationLink);

		bindEvents(tabs, paginationLinks);
		setActiveTab(tabs);
	});
};

export default initTabsWithPagination;
