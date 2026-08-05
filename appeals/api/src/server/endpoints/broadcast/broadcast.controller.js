import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';

/**
 * @type {import('express').RequestHandler}
 * */
export const broadcastAppeal = async (req, res) => {
	const { appealId } = req.params;
	const success = await broadcasters.broadcastAppeal(Number.parseInt(appealId, 10));
	if (!success) {
		return res.status(404).send(`appeal ${appealId} not found`);
	}
	return res.send(`appeal ${appealId} broadcasted`);
};

/**
 * @type {import('express').RequestHandler}
 * */
export const broadcastDocument = async (req, res) => {
	const { documentGuid } = req.params;
	const { version, updateType } = req.body;
	const success = await broadcasters.broadcastDocument(documentGuid, version, updateType);
	if (!success) {
		return res.status(404).send(`document ${documentGuid} not found`);
	}
	return res.send(`document ${documentGuid} broadcasted`);
};

/**
 * @type {import('express').RequestHandler}
 * */
export const broadcastRepresentation = async (req, res) => {
	const { representationId } = req.params;
	const { updateType } = req.body;
	const success = await broadcasters.broadcastRepresentation(
		Number.parseInt(representationId, 10),
		updateType
	);
	if (!success) {
		return res.status(404).send(`representation ${representationId} not found`);
	}
	return res.send(`representation ${representationId} broadcasted`);
};

/**
 * @type {import('express').RequestHandler}
 * */
export const broadcastServiceUser = async (req, res) => {
	const { serviceUserId } = req.params;
	const { updateType, roleName, caseReference } = req.body;
	const success = await broadcasters.broadcastServiceUser(
		Number.parseInt(serviceUserId, 10),
		updateType,
		roleName,
		caseReference
	);
	if (!success) {
		return res.status(404).send(`service user ${serviceUserId} not found`);
	}
	return res.send(`service user ${serviceUserId} broadcasted`);
};
