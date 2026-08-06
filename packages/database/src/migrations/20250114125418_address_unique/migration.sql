/*
  Warnings:

  - A unique constraint covering the columns `[appealId,addressId]` on the table `NeighbouringSite` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[NeighbouringSite] ADD CONSTRAINT [NeighbouringSite_appealId_addressId_key] UNIQUE NONCLUSTERED ([appealId], [addressId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
