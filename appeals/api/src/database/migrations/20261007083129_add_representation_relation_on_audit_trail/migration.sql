BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AuditTrail] ADD [representationId] INT;

-- AddForeignKey
ALTER TABLE [dbo].[AuditTrail] ADD CONSTRAINT [AuditTrail_representationId_fkey] FOREIGN KEY ([representationId]) REFERENCES [dbo].[Representation]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;


COMMIT TRAN;
