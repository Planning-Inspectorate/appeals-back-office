import { Router } from 'express';
import addDocumentRouter from '../document-attachments/add-document.router.js';
import { getRepresentationAttachmentsFolder } from '../document-attachments/attachments-middleware.js';

const router = Router({ mergeParams: true });

router.use('/add-document', getRepresentationAttachmentsFolder, addDocumentRouter);

export default router;
