function initializeAsyncDownloads() {
	console.log('[DownloadHandler] Script loaded and executing initializeAsyncDownloads().');

	// Selecting stable parent element that will  exist on page load
	const mainContentContainer = document.querySelector('.govuk-main-wrapper');

	if (!mainContentContainer) {
		console.error(
			'[DownloadHandler] Could not find the main content container (.govuk-main-wrapper) to attach listener.'
		);
		return;
	}

	console.log(
		'[DownloadHandler] Attaching a single delegated click listener to the main content container.'
	);

	// @ts-ignore
	function showNotificationBanner(title, message) {
		const existingBanner = document.getElementById('async-download-notification');
		if (existingBanner) existingBanner.remove();
		const bannerHtml = `
            <div class="govuk-notification-banner govuk-notification-banner--warning" role="region" aria-labelledby="async-download-notification-title" data-module="govuk-notification-banner" id="async-download-notification" tabindex="-1">
                <div class="govuk-notification-banner__header"><h2 class="govuk-notification-banner__title" id="async-download-notification-title">${
									title || 'Important'
								}</h2></div>
                <div class="govuk-notification-banner__content"><p class="govuk-notification-banner__heading">${
									message || 'An unknown error occurred.'
								}</p></div>
            </div>
        `;
		const mainContent = document.querySelector('.govuk-main-wrapper') || document.body;
		mainContent.insertAdjacentHTML('afterbegin', bannerHtml);
		const newBanner = document.getElementById('async-download-notification');
		if (newBanner) newBanner.focus();
	}
	// @ts-ignore
	async function handleFileDownload(response) {
		const disposition = response.headers.get('content-disposition');
		let filename = 'download.zip';
		if (disposition && disposition.includes('attachment')) {
			const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
			if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
		}
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	}

	mainContentContainer.addEventListener('click', async (event) => {
		// Find the button that was actually clicked by checking if the event target (or its parent) has our class.
		// @ts-ignore
		const button = event.target.closest('.js-async-download-button');

		// If the click was not on our button (or inside it), do nothing.
		if (!button) {
			return;
		}

		console.log(
			`[DownloadHandler] Delegated click event intercepted for button with URL: ${button.getAttribute(
				'data-download-url'
			)}`
		);

		event.preventDefault();

		const downloadUrl = button.getAttribute('data-download-url');
		if (!downloadUrl) {
			console.error(
				'[DownloadHandler] Button is missing required data-download-url attribute.',
				button
			);
			return;
		}

		const originalButtonText = button.innerHTML;

		button.disabled = true;
		button.setAttribute('aria-disabled', 'true');
		button.innerHTML = 'Generating... Please wait';

		const existingBanner = document.getElementById('async-download-notification');
		if (existingBanner) existingBanner.remove();

		try {
			console.log('[DownloadHandler] Making fetch request...');
			const response = await fetch(downloadUrl);
			console.log(`[DownloadHandler] Fetch response received with status: ${response.status}`);

			if (response.ok) {
				await handleFileDownload(response);
			} else {
				const errorData = await response.json();
				const errorMessage =
					errorData.message || `The server returned an error (status ${response.status}).`;
				console.error('[DownloadHandler] Download failed:', errorData);
				showNotificationBanner('There was a problem', errorMessage);
			}
		} catch (error) {
			console.error('[DownloadHandler] A network or fetch error occurred:', error);
			showNotificationBanner(
				'Network Error',
				'Could not connect to the server to generate documents.'
			);
		} finally {
			console.log('[DownloadAll] Restoring button state.');
			button.disabled = false;
			button.removeAttribute('aria-disabled');
			button.innerHTML = originalButtonText;
		}
	});
}

// Ensure the script runs after DOM is ready.
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeAsyncDownloads);
} else {
	// DOM is already ready
	initializeAsyncDownloads();
}
