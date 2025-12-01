BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AppealRule6Party] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [serviceUserId] INT NOT NULL,
    CONSTRAINT [AppealRule6Party_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealRule6Party_appealId_idx] ON [dbo].[AppealRule6Party]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealRule6Party_serviceUserId_idx] ON [dbo].[AppealRule6Party]([serviceUserId]);

-- AddForeignKey
ALTER TABLE [dbo].[AppealRule6Party] ADD CONSTRAINT [AppealRule6Party_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AppealRule6Party] ADD CONSTRAINT [AppealRule6Party_serviceUserId_fkey] FOREIGN KEY ([serviceUserId]) REFERENCES [dbo].[ServiceUser]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
