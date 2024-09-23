import { paginationDefaultSettings } from '#appeals/appeal.constants.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */

/**
 * @param {number} currentPage
 * @param {number} pageCount
 * @param {number} itemsPerPage
 * @param {string} baseUrl
 * @param {object} query
 * @param {string} [classes] - Optional classes to add to the pagination object
 * @returns {Pagination}
 */
export function mapPagination(currentPage, pageCount, itemsPerPage, baseUrl, query, classes = '') {
	// Extract hash from baseUrl if present
	const [baseUrlWithoutHash, hash] = baseUrl.split('#');
	const hashFragment = hash ? `#${hash}` : '';

	// filter out pagination related query params
	const paginationlessQueryParams = Object.entries(query).filter(
		([prop]) => prop !== 'pageNumber' && prop !== 'pageSize'
	);

	// re-construct query params without pagination
	const additionalQueryString = paginationlessQueryParams.reduce(
		(prevValue, [prop, value]) =>
			`${prevValue}&${encodeURIComponent(prop)}=${encodeURIComponent(value)}`,
		''
	);

	/** @type {Pagination} */
	const pagination = {
		previous: {},
		next: {},
		items: [],
		classes // Add the classes property to the pagination object
	};

	if (pageCount > 1) {
		const previousPage = currentPage - 1;
		const nextPage = currentPage + 1;

		if (currentPage > 1) {
			pagination.previous = {
				href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${previousPage}${
					additionalQueryString || ''
				}${hashFragment}`
			};
		}

		if (currentPage < pageCount) {
			pagination.next = {
				href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${nextPage}${
					additionalQueryString || ''
				}${hashFragment}`
			};
		}

		// first index
		pagination.items.push({
			number: 1,
			href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${
				paginationDefaultSettings.firstPageNumber
			}${additionalQueryString || ''}${hashFragment}`,
			current: currentPage === 1
		});

		// if there are 10 or fewer total pages, display pagination links for all of them - otherwise truncate with ellipsis
		if (pageCount <= 10) {
			for (let pageIndex = 2; pageIndex <= pageCount; pageIndex += 1) {
				pagination.items.push({
					number: pageIndex,
					href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${pageIndex}${
						additionalQueryString || ''
					}${hashFragment}`,
					current: currentPage === pageIndex
				});
			}
		} else {
			// do not show ellipsis if you're in the beginning of the pagination
			pagination.items.push({
				ellipsis: currentPage > 3
			});

			// logic for neighbouring indexes (previous, current and next ones)
			if (previousPage > 1) {
				pagination.items.push({
					number: previousPage,
					href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${previousPage}${
						additionalQueryString || ''
					}${hashFragment}`,
					current: false
				});
			}

			if (currentPage > 1) {
				pagination.items.push({
					number: currentPage,
					href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${currentPage}${
						additionalQueryString || ''
					}${hashFragment}`,
					current: true
				});
			}

			if (nextPage > 1 && nextPage < pageCount) {
				pagination.items.push({
					number: nextPage,
					href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${nextPage}${
						additionalQueryString || ''
					}${hashFragment}`,
					current: false
				});
			}

			// do not show this ellipsis if you're in the end of the pagination
			pagination.items.push({
				ellipsis: currentPage < pageCount - 2
			});

			// last index
			if (currentPage < pageCount) {
				pagination.items.push({
					number: pageCount,
					href: `${baseUrlWithoutHash}?pageSize=${itemsPerPage}&pageNumber=${pageCount}${
						additionalQueryString || ''
					}${hashFragment}`,
					current: currentPage === pageCount
				});
			}
		}
	}

	return pagination;
}
