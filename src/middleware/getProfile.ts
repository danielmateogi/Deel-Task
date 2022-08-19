import { Request, Response, NextFunction } from 'express';
import { Profile } from '../model';

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const profile = await Profile.findOne({ where: { id: req.get('profile_id') || 0 } });
  if (!profile) return res.status(401).json({ error: 'Profile not found' });
  req.profile = profile;
  return next();
};

export default getProfile;
