BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Hearing] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [hearingStartTime] DATETIME2 NOT NULL,
    [hearingEndTime] DATETIME2,
    [addressId] INT,
    CONSTRAINT [Hearing_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Hearing_appealId_key] UNIQUE NONCLUSTERED ([appealId]),
    CONSTRAINT [Hearing_addressId_key] UNIQUE NONCLUSTERED ([addressId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Hearing] ADD CONSTRAINT [Hearing_addressId_fkey] FOREIGN KEY ([addressId]) REFERENCES [dbo].[Address]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Hearing] ADD CONSTRAINT [Hearing_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
