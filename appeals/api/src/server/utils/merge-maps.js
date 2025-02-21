/**
 * @template T
 * @param {Map<string, T>} existingMap
 * @param {Map<string, T>} newMap
 * @returns {Map<string, T>}
 * */
const mergeMaps = (existingMap, newMap) =>
	Array.from(newMap.entries()).reduce((accumulator, [key, value]) => {
		accumulator.set(key, {
			...(existingMap.get(key) ?? {}),
			...value
		});

		return accumulator;
	}, existingMap);

export default mergeMaps;
