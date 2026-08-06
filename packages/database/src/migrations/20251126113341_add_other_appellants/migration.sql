BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[OtherAppellant] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT,
    [appellantId] INT,
    CONSTRAINT [OtherAppellant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [OtherAppellant_appealId_appellantId_key] UNIQUE NONCLUSTERED ([appealId],[appellantId])
);

-- AddForeignKey
ALTER TABLE [dbo].[OtherAppellant] ADD CONSTRAINT [OtherAppellant_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OtherAppellant] ADD CONSTRAINT [OtherAppellant_appellantId_fkey] FOREIGN KEY ([appellantId]) REFERENCES [dbo].[ServiceUser]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
