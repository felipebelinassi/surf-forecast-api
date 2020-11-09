import { Request, Response } from 'express';
import { User } from '@src/database/models';
import sendCreateUpdateError from '../util/send-controller-errors';
import { authService } from '@src/services';

export default {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (err) {
      sendCreateUpdateError(res, err);
    }
  },

  async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({
        code: 401,
        error: 'User not found',
      });
    }

    if (!(await authService.comparePasswords(password, user.password))) {
      return res.status(401).send({
        code: 401,
        error: 'Password does not match',
      });
    }

    const token = authService.generateToken(user.toJSON());
    return res.status(200).send({ ...user.toJSON(), token });
  },
};
