import express from 'express';
import { auth } from '../middleware/auth.js';

import Product from '../models/productModel.js';

const router = express.Router();

// Get all products
// GET @/api/products
// Public
router.get('/', (req, res) => {
   const keyword = req.query.keyword
      ? {
           $or: [
              {
                 name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
              {
                 image: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
              {
                 imagePublicId: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
              {
                 description: {
                    $regex: req.query.keyword,
                    $options: 'i',
                 },
              },
           ],
        }
      : {};

   Product.find({ ...keyword })
      .sort({ updatedAt: -1 })
      .then((product) => res.status(200).json(product))
      .catch((err) => res.status(400).json({ msg: 'An error occured!!!' }));
});

// Get recent products
// GET @/api/products/recent/products
// Public
router.get('/recent/products', (req, res) => {
   Product.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .then((product) => res.status(200).json(product))
      .catch((err) => res.status(400).json({ msg: 'An error occured!!!' }));
});

// Get a single products
// GET @/api/products/:id
// Public
router.get('/:id', (req, res) => {
   Product.findById(req.params.id)
      .then((product) => {
         if (product) {
            res.status(200).json(product);
         } else {
            res.status(400).json({ msg: 'Product does not exist!!!' });
         }
      })
      .catch((err) => res.status(400).json({ msg: 'An error occured!!!' }));
});

// Post a product
// POST @/api/products
// Private
router.post('/', (req, res) => {
   const { name, image, description, price, numReviews, imagePublicId } =
      req.body;

   // Validation;
   if (!name || !description || !price) {
      res.status(400).json({ msg: 'Please enter all fields!' });
   } else if (!image) {
      res.status(400).json({ msg: 'Please upload product image' });
   } else {
      //    Create new Product object
      const newProduct = new Product({
         name,
         image,
         description,
         price,
         numReviews,
         imagePublicId,
      });

      //    Save product to Database
      newProduct
         .save()
         .then((product) => res.status(201).json(product))
         .catch((err) => res.status(400).json({ msg: 'An error occured!' }));
   }
});

// Create Product Review
// POST @/api/products/:id/reviews
// Private
router.post('/:id/reviews', auth, (req, res) => {
   const { comment, rating, firstName, lastName } = req.body;

   Product.findById(req.params.id).then((product) => {
      if (product) {
         const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user.id.toString()
         );

         if (alreadyReviewed) {
            res.status(400).json({ msg: 'Product already reviewed by you!' });
         } else {
            if (!rating || !comment) {
               res.status(400).json({ msg: 'Please enter all fields!' });
            } else {
               const review = {
                  name: `${firstName} ${lastName}`,
                  rating: Number(rating),
                  comment,
                  user: req.user.id,
               };

               product.reviews.push(review);

               product.numReviews = product.reviews.length;

               product.rating =
                  product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                  product.reviews.length;

               product
                  .save()
                  .then(() =>
                     res
                        .status(201)
                        .json({ product, msg: 'Review Added successfully!' })
                  );
            }
         }
      } else {
         res.status(404).json({
            msg: 'An error occured! Product does not exist!!!',
         });
      }
   });
});

router.put('/', auth, (req, res) => {
   const { name, image, description, price, imagePublicId, id } = req.body;

   Product.findById(id)
      .then((product) => {
         if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.image = image || product.image;
            product.imagePublicId = imagePublicId || product.imagePublicId;

            product
               .save()
               .then(() => res.status(201).json(product))
               .catch((err) =>
                  res
                     .status(400)
                     .json({ msg: 'An error occured! Product not updated!' })
               );
         } else {
            res.status(400).json({ msg: 'Product does not exist!!!' });
         }
      })
      .catch((err) => res.status(400).json({ msg: 'An error occured!' }));
});

// Delete a product by id
// DELETE @/api/products/:id
// Private
router.delete('/:id', (req, res) => {
   Product.findById(req.params.id)
      .then((product) => {
         if (product) {
            product
               .remove()
               .then(() => res.status(200).json({ success: true }))
               .catch(() =>
                  res.status(400).json({ msg: 'Product not deleted!' })
               );
         } else {
            res.status(400).json({ msg: 'Product does not exist!!!' });
         }
      })
      .catch((err) => res.status(400).json({ msg: 'Product not deleted!!!' }));
});

export default router;
