import express from 'express';
import Token from '../models/tokenModel.js';
import Email from '../models/emailModel.js';
import Password from '../models/passwordModel.js';
import crypto from 'crypto';
import sendEmail from '../middleware/sendEmail.js';
import bcrypt from 'bcryptjs';

import User from '../models/userModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
   try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ msg: 'Please enter email!' });

      const emailObj = new Email({
         email,
      });

      let user = await User.findOne({ email });
      if (!user)
         return res
            .status(409)
            .json({ msg: 'User with given email does not exist!' });

      let token = await Token.findOne({ userId: user._id });
      if (!token) {
         token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex'),
         }).save();
      }

      const url = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}/`;
      await sendEmail(
         user.email,
         'Resetting your Ade Farm Snails Password',
         url,
         user
      );

      res.status(200).json({
         msg: 'Password reset link sent to your email account! Check your span if not in your inbox',
      });
   } catch (error) {
      res.status(400).json({ msg: 'An error occured!' });
   }
});

router.get('/:id/:token', async (req, res) => {
   try {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) return res.status(400).json({ msg: 'Invalid link' });

      const token = await Token.findOne({
         userId: user._id,
         token: req.params.token,
      });
      if (!token) return res.status(400).json({ msg: 'Invalid link' });

      res.status(200).json({ msg: 'Valid Link' });
   } catch (error) {
      res.status(400).json({ msg: 'An error occured!' });
   }
});

router.post('/:id/:token', async (req, res) => {
   try {
      const { password } = req.body;

      if (!password)
         return res.status(400).json({ msg: 'Please enter password!' });

      if (password.length < 6)
         return res.status(400).json({
            msg: 'Password character should be at least 6 character long!',
         });

      const passwordObj = new Password({
         password,
      });

      const user = await User.findOne({ _id: req.params.id });
      if (!user) return res.status(400).json({ msg: 'Invalid link' });

      const token = await Token.findOne({
         userId: user._id,
         token: req.params.token,
      });
      if (!token) return res.status(400).json({ msg: 'Invalid link' });

      if (!user.verified) user.verified = true;

      const salt = await bcrypt.genSalt(Number(14));
      const hashPassword = await bcrypt.hash(password, salt);

      user.password = hashPassword;

      await user.save();
      await token.remove();

      res.status(200).json({ msg: 'Password reset successfully' });
   } catch (error) {
      res.status(400).json({ msg: 'An error occured!' });
   }
});

export default router;
