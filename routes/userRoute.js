import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { auth } from '../middleware/auth.js';

const router = express.Router();

import User from '../models/userModel.js';

import Order from '../models/orderModel.js';

// Get all Users
// GET @/api/users
// Private
router.get('/', auth, (req, res) => {
   const keyword = req.query.keyword
      ? {
           $or: [
              {
                 firstName: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
              {
                 lastName: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
              {
                 email: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
           ],
        }
      : {};

   User.find({ ...keyword })
      .sort({ updatedAt: -1 })
      .then((user) => res.status(200).json(user))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get recent Users
// GET @/api/users/recent/users
// Private
router.get('/recent/users', auth, (req, res) => {
   User.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .then((user) => res.status(200).json(user))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get a single User
// GET @/api/users/:id
// Private
router.get('/:id', auth, (req, res) => {
   User.findById(req.params.id)
      .then((user) => {
         if (user) {

            Order.find({ user: req.params.id })
               .sort({ createdAt: -1 })
               .limit(3)
               .then((order) => {
                  res.status(200).json({orders: order, user: user})
                 
               })
               .catch(() => res.status(400).json({ msg: 'An error occured!' }));

         } else {
            res.status(404).json({ msg: 'User does not exist!!!' });
         }
      })
      .catch((err) => res.status(400).json({ msg: 'An error occured!!!' }));
});

// Create a new User
// POST @/api/users
// Public
router.post('/', (req, res) => {
   const { firstName, lastName, email, password, isAdmin, phoneNumber } =
      req.body;

   User.findOne({ email }).then((user) => {
      if (user) {
         return res
            .status(400)
            .json({ msg: 'User already exist! Please Login!' });
      }

      // Validation
      if (!firstName || !lastName || !email || !phoneNumber || !password) {
         res.status(400).json({ msg: 'Please enter all fields!' });
      } else if (phoneNumber.length !== 11) {
         res.status(400).json({
            msg: 'Please enter a valid phone number!',
         });
      } else if (password.length < 6) {
         res.status(400).json({
            msg: 'Password character should be at least 6 character long!',
         });
      } else {
         // Create new User Object
         const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            isAdmin,
            phoneNumber,
         });

         // Create hash and hash the user password
         bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
               if (err) throw err;
               newUser.password = hash;

               // Save user to DB
               newUser
                  .save()
                  .then((user) => {
                     jwt.sign(
                        { id: user._id },
                        process.env.JWT_SECRET,
                        (err, token) => {
                           if (err) throw err;

                           res.json({
                              token,
                              user: {
                                 id: user._id,
                                 firstName: user.firstName,
                                 lastName: user.lastName,
                                 email: user.email,
                                 isAdmin: user.isAdmin,
                                 verified: user.verified,
                                 phoneNumber: user.phoneNumber,
                              },
                           });
                        }
                     );
                  })
                  .catch((err) => {
                     if (err) throw err;
                  });
            });
         });
      }
   });
});

// Login a user
// POST @/api/users/auth
// Public
router.post('/auth', (req, res) => {
   const { email, password } = req.body;

   // Validation
   if (!email || !password) {
      res.status(400).json({ msg: 'Please enter all fields!' });
   } else {
      User.findOne({ email }).then((user) => {
         if (!user) {
            return res
               .status(400)
               .json({ msg: 'User does not exist! Please Register!' });
         }

         bcrypt
            .compare(password, user.password)
            .then((isMatch) => {
               if (!isMatch) {
                  return res.status(400).json({ msg: 'Invalid credentials!' });
               }

               jwt.sign(
                  { id: user._id },
                  process.env.JWT_SECRET,
                  (err, token) => {
                     if (err) throw err;
                     res.json({
                        token,
                        user: {
                           id: user._id,
                           firstName: user.firstName,
                           lastName: user.lastName,
                           email: user.email,
                           isAdmin: user.isAdmin,
                           verified: user.verified,
                           phoneNumber: user.phoneNumber,
                        },
                     });
                  }
               );
            })
            .catch((err) => {
               if (err) throw err;
            });
      });
   }
});


router.put('/', auth, (req, res) => {
   const {
      firstName,
      lastName,
      phoneNumber,
      newPassword,
      confirmPassword,
      currentPassword,
   } = req.body;

   User.findById(req.user.id)
      .then((user) => {
         if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.phoneNumber = phoneNumber || user.phoneNumber;

            if (currentPassword) {
               if (newPassword !== confirmPassword) {
                  res.status(409).json({
                     msg: 'New Password does not match the Retyped Password!',
                  });
               } else if (newPassword.length < 6) {
                  res.status(400).json({
                     msg: 'New password character should be at least 6 character long!',
                  });
               } else {
                  bcrypt
                     .compare(currentPassword, user.password)
                     .then((isMatch) => {
                        if (!isMatch) {
                           return res
                              .status(409)
                              .json({ msg: 'Invalid Current Password!' });
                        }

                        user.password = newPassword;

                        bcrypt.genSalt(10, (err, salt) => {
                           bcrypt.hash(user.password, salt, (err, hash) => {
                              if (err) throw err;

                              user.password = hash;

                              user
                                 .save()
                                 .then((user) => {
                                    jwt.sign(
                                       { id: user._id },
                                       process.env.JWT_SECRET,
                                       (err, token) => {
                                          if (err) throw err;

                                          res.json({
                                             token,
                                             user: {
                                                id: user._id,
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                email: user.email,
                                                isAdmin: user.isAdmin,
                                                verified: user.verified,
                                                phoneNumber: user.phoneNumber,
                                             },
                                          });
                                       }
                                    );
                                 })
                                 .catch((err) => {
                                    if (err) throw err;
                                 });
                           });
                        });
                     })
                     .catch((err) => {
                        if (err) throw err;
                     });
               }
            } else {
               user
                  .save()
                  .then((user) => {
                     jwt.sign(
                        { id: user._id },
                        process.env.JWT_SECRET,
                        (err, token) => {
                           if (err) throw err;

                           res.json({
                              token,
                              user: {
                                 id: user._id,
                                 firstName: user.firstName,
                                 lastName: user.lastName,
                                 email: user.email,
                                 isAdmin: user.isAdmin,
                                 verified: user.verified,
                                 phoneNumber: user.phoneNumber,
                              },
                           });
                        }
                     );
                  })
                  .catch((err) => {
                     if (err) throw err;
                  });
            }
         }
      })
      .catch(() =>
         res.status(404).json({
            msg: 'User does not exist! An error occured!',
         })
      );
});

router.put('/admin/update', auth, (req, res) => {
   const { firstName, lastName, isAdmin, id, phoneNumber } = req.body;

   User.findById(id)
      .then((user) => {
         if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.isAdmin = isAdmin;

            user.save().then(res.status(201).json(user));
         }
      })
      .catch(() =>
         res.status(404).json({
            msg: 'User does not exist! An error occured!',
         })
      );
});

export default router;
