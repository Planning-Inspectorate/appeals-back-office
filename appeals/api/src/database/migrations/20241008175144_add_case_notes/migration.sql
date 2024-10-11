BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[CaseNote] (
    [id] INT NOT NULL IDENTITY(1,1),
    [caseId] INT NOT NULL,
    [comment] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CaseNote_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] INT NOT NULL,
    [archived] BIT NOT NULL CONSTRAINT [CaseNote_archived_df] DEFAULT 0,
    CONSTRAINT [CaseNote_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[CaseNote] ADD CONSTRAINT [CaseNote_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CaseNote] ADD CONSTRAINT [CaseNote_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
