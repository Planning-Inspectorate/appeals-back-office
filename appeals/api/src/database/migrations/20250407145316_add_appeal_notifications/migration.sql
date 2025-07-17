BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AppealNotification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [caseReference] NVARCHAR(1000) NOT NULL,
    [template] NVARCHAR(1000) NOT NULL,
    [subject] NVARCHAR(1000) NOT NULL,
    [recipient] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [success] BIT NOT NULL CONSTRAINT [AppealNotification_success_df] DEFAULT 1,
    [dateCreated] DATETIME2 NOT NULL CONSTRAINT [AppealNotification_dateCreated_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AppealNotification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealNotification_caseReference_idx] ON [dbo].[AppealNotification]([caseReference]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealNotification_template_idx] ON [dbo].[AppealNotification]([template]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealNotification_dateCreated_idx] ON [dbo].[AppealNotification]([dateCreated] DESC);

-- AddForeignKey
ALTER TABLE [dbo].[AppealNotification] ADD CONSTRAINT [AppealNotification_caseReference_fkey] FOREIGN KEY ([caseReference]) REFERENCES [dbo].[Appeal]([reference]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
