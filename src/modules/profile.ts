import getProfile from '../middleware/getProfile';
import { requestWrapper } from '../utils';

import express from 'express';

const router = express.Router();

router.use(getProfile);

/** I created this to show the current user data in the frontend */
router.get(
  '/',
  requestWrapper((req) => Promise.resolve(req.profile))
);

export default router;
