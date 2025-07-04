BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Inquiry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [inquiryStartTime] DATETIME2 NOT NULL,
    [inquiryEndTime] DATETIME2,
    [addressId] INT,
    CONSTRAINT [Inquiry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Inquiry_appealId_key] UNIQUE NONCLUSTERED ([appealId])
);

-- CreateTable
CREATE TABLE [dbo].[InquiryEstimate] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [estimatedTime] DECIMAL(32,16),
    CONSTRAINT [InquiryEstimate_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [InquiryEstimate_appealId_key] UNIQUE NONCLUSTERED ([appealId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Inquiry] ADD CONSTRAINT [Inquiry_addressId_fkey] FOREIGN KEY ([addressId]) REFERENCES [dbo].[Address]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Inquiry] ADD CONSTRAINT [Inquiry_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InquiryEstimate] ADD CONSTRAINT [InquiryEstimate_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
