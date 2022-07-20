import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema(
   {
      password: {
         type: String,
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

const Password = mongoose.model('Password', passwordSchema);

export default Password;
