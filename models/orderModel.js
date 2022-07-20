import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
   {
      orderItems: [
         {
            name: {
               type: String,
               required: true,
            },
            qty: {
               type: Number,
               required: true,
            },
            image: {
               type: String,
               required: true,
            },
            price: {
               type: Number,
               required: true,
            },
         },
      ],
      shippingAddress: {
         address: {
            type: String,
            required: true,
         },
         city: {
            type: String,
            required: true,
         },
         postalCode: {
            type: String,
            required: true,
         },
         country: {
            type: String,
            required: true,
         },
      },
      paymentMethod: {
         type: String,
         required: true,
      },
      itemPrice: {
         type: Number,
         required: true,
      },
      shippingPrice: {
         type: Number,
         required: true,
      },
      totalPrice: {
         type: Number,
         required: true,
      },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      userObj: {
         type: Object,
         required: true,
      },
      isPaid: {
         type: Boolean,
         required: false,
         default: false,
      },
      isDelivered: {
         type: Boolean,
         required: false,
         default: false,
      },
      paidAt: {
         type: Date,
      },
      deliveredAt: {
         type: Date,
      },
   },
   { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
