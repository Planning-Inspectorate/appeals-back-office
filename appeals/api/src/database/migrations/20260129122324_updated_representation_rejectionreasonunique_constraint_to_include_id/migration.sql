/*
  Warnings:

  - A unique constraint covering the columns `[id,name,representationType]` on the table `RepresentationRejectionReason` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[RepresentationRejectionReason] DROP CONSTRAINT [RepresentationRejectionReason_name_representationType_key];

-- CreateIndex
ALTER TABLE [dbo].[RepresentationRejectionReason] ADD CONSTRAINT [RepresentationRejectionReason_id_name_representationType_key] UNIQUE NONCLUSTERED ([id], [name], [representationType]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
