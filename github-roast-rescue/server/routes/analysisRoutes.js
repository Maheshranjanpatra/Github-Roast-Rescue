import express from 'express';
import { analyzeProfile } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/analyze', analyzeProfile);

export default router;
