/*
  Warnings:

  - You are about to drop the `NeighbouringSiteContact` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[NeighbouringSiteContact] DROP CONSTRAINT [NeighbouringSiteContact_addressId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[NeighbouringSiteContact] DROP CONSTRAINT [NeighbouringSiteContact_lpaQuestionnaireId_fkey];

-- DropTable
DROP TABLE [dbo].[NeighbouringSiteContact];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
