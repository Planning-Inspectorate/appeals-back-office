BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [contactAddressId] INT,
[interestInLand] NVARCHAR(1000),
[writtenOrVerbalPermission] NVARCHAR(1000);

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCase] ADD CONSTRAINT [AppellantCase_contactAddressId_fkey] FOREIGN KEY ([contactAddressId]) REFERENCES [dbo].[Address]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
