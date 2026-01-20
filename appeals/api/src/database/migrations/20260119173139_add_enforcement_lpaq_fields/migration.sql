BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [affectedTrunkRoadName] NVARCHAR(1000),
[article4AffectedDevelopmentRights] NVARCHAR(1000),
[changeOfUseMineralExtraction] BIT,
[changeOfUseMineralStorage] BIT,
[changeOfUseRefuseOrWaste] BIT,
[doesAllegedBreachCreateFloorSpace] BIT,
[hasAllegedBreachArea] BIT,
[isSiteOnCrownLand] BIT,
[noticeRelatesToBuildingEngineeringMiningOther] BIT,
[relatesToBuildingSingleDwellingHouse] BIT,
[relatesToBuildingWithAgriculturalPurpose] BIT,
[relatesToErectionOfBuildingOrBuildings] BIT,
[siteAreaSquareMetres] DECIMAL(32,16);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
