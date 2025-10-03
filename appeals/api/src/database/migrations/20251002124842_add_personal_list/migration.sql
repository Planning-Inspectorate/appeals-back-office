BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PersonalList] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [linkType] NVARCHAR(1000),
    [leadAppealId] INT,
    [dueDate] DATETIME2,
    CONSTRAINT [PersonalList_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PersonalList_appealId_key] UNIQUE NONCLUSTERED ([appealId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PersonalList_dueDate_leadAppealId_linkType_appealId_idx] ON [dbo].[PersonalList]([dueDate], [leadAppealId], [linkType] DESC, [appealId]);

-- AddForeignKey
ALTER TABLE [dbo].[PersonalList] ADD CONSTRAINT [PersonalList_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
