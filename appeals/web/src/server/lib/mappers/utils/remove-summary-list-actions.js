/**
 * Clone the object (shallow) and remove any 'actions' properties that are present, unless they have a 'needsPermissions' property set to false.
 * @param {Object|null|undefined} value
 * @returns {any|undefined}
 */
export function removeSummaryListActions(value) {
	if (value === undefined || value === null) {
		return;
	}

	// @ts-expect-error
	const actions = value.actions;
	if (!actions || !Array.isArray(actions.items)) {
		return { ...value };
	}

	return {
		...value,
		actions: {
			...actions,
			items: actions.items.filter(
				/**@param {{needsPermissions?: boolean}} action */ (action) =>
					action?.needsPermissions === false
			)
		}
	};
}
