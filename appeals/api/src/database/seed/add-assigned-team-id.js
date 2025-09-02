/**
 * @param {import('#db-client').PrismaClient} databaseConnector
 */
export const addAssignedTeamIdToAppeal = async (databaseConnector) => {
	// Using the older, unsafe method for a static query.
	// This should only be used if you cannot update Prisma.
	return databaseConnector.$executeRawUnsafe(
		`
		UPDATE "Appeal"
		SET "assignedTeamId" = "LPA"."teamId"
		FROM "LPA"
		WHERE "Appeal"."lpaId" = "LPA"."id";
		`
	);
};
