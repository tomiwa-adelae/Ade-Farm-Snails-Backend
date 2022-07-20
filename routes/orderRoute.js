import express from 'express';

const router = express.Router();

import Order from '../models/orderModel.js';
import { auth } from '../middleware/auth.js';

// Get all Orders
// GET @/api/orders
// Private
router.get('/', auth, (req, res) => {
   Order.find()
      .sort({ updatedAt: -1 })
      .then((order) => res.status(200).json(order))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get recent Orders
// GET @/api/orders/recent/orders
// Private
router.get('/recent/orders', auth, (req, res) => {
   Order.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .then((order) => res.status(200).json(order))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get a single Order
// GET @/api/orders/:id
// Private
router.get('/:id', auth, (req, res) => {
   Order.findById(req.params.id)
      .then((order) => {
         if (!order)
            return res.status(404).json({ msg: 'Order does not exist!' });

         res.status(200).json(order);
      })
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Create an Order
// POST @/api/orders/
// Private
router.post('/', auth, (req, res) => {
   const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemPrice,
      shippingPrice,
      totalPrice,
      user,
      userObj,
   } = req.body;

   if (orderItems.length === 0) {
      res.status(400).json({ msg: 'Cart is empty!' });
   } else {
      const newOrder = new Order({
         orderItems,
         shippingAddress,
         paymentMethod,
         itemPrice,
         shippingPrice,
         totalPrice,
         user,
         userObj,
      });

      newOrder
         .save()
         .then((order) => res.status(201).json(order))
         .catch(() =>
            res
               .status(400)
               .json({ msg: 'Order not created! An error occured!' })
         );
   }
});

// Get all my orders list
// GET @/api/orders/myorders/mine
// Private
router.get('/myorders/mine', auth, (req, res) => {
   Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .then((order) => res.status(200).json(order))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get all my orders list recent
// GET @/api/orders/myorders/mine/recent
// Private
router.get('/myorders/mine/recent', auth, (req, res) => {
   Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .then((order) => res.status(200).json(order))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Get all user id orders
// GET @/api/orders/myorders/mine/recent/:id
// Private
router.get('/user/orders/:id', auth, (req, res) => {
   Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .then((order) => res.status(200).json(order))
      .catch(() => res.status(400).json({ msg: 'An error occured!' }));
});

// Update Order to paid
// PUT @/api/orders/:id/pay/cash
// Private
router.put('/:id/pay/cash', auth, (req, res) => {
   Order.findById(req.params.id).then((order) => {
      if (order) {
         order.isPaid = true;
         order.paidAt = Date.now();

         order
            .save()
            .then(() => res.status(201).json(order))
            .catch(() => res.status(400).json({ msg: 'An error occured!' }));
      } else {
         res.status(404).json({ msg: 'Order not found! An error occured!' });
      }
   });
});

// Update Order to Delivered
// PUT @/api/orders/:id/deliver
// Private
router.put('/:id/deliver', auth, (req, res) => {
   Order.findById(req.params.id).then((order) => {
      if (order) {
         order.isDelivered = true;
         order.deliveredAt = Date.now();

         order
            .save()
            .then(() => res.status(201).json(order))
            .catch(() => res.status(400).json({ msg: 'An error occured!' }));
      } else {
         res.status(404).json({ msg: 'Order not found! An error occured!' });
      }
   });
});

export default router;
