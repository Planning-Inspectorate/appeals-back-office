/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 */
export const addAssignedTeamIdToAppeal = async (databaseConnector) => {
	return databaseConnector.$executeRawUnsafe(
		`
		UPDATE "Appeal"
		SET "assignedTeamId" = "LPA"."teamId"
		FROM "LPA"
		WHERE "Appeal"."lpaId" = "LPA"."id";
		`
	);
};
