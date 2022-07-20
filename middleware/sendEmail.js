import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text, user) => {
   try {
      const output = `
         <div
            style="text-align: center;
            font-weight: lighter;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.5;
            background: #f4f4f4;
            color: #000000;
            padding: 1rem ;"
         >
            <div
               style="background-color: #ffffff;
               margin: auto;
               width: 40%;
               padding: 1rem 2rem;
               text-align: left;"

            >
               <img
                  style="width: 150px;
                  height: 150px; text-align:center;"
                  src="https://res.cloudinary.com/the-tom-media/image/upload/v1658134793/adefarmsnails/logo_ip3zad.png"
                  >
               <p>Dear ${user.firstName},</p>
               <p>We received a request for your Ade Farm Snails account. Click on the link below to reset your password</p>
               <a
                  style="text-decoration: none;
                  border: 2px solid #647244;
                  color: #647244;
                  padding: 0.5rem 1rem;
                  margin: 0.5rem 0;
                  display: inline-block;
                  font-size: 0.9rem;"
                  href=${text}
               >
                  RESET PASSWORD
               </a>
               <p>If you ignore this message, your password won't be changed.</p>
               <p>If you didn't initiate this process, you can safely ignore this message. We take your privacy very seriously at Ade Farm Snails. </p>
               <footer>The Ade Farm Snails</footer>
            </div>
         </div>
      `;

      const transporter = nodemailer.createTransport({
         host: process.env.HOST,
         service: process.env.SERVICE,
         port: Number(process.env.EMAIL_PORT),
         secure: Boolean(process.env.SECURE),
         auth: {
            user: process.env.USER,
            pass: process.env.PASS,
         },
      });

      await transporter.sendMail({
         from: 'Ade Farm Snails',
         to: email,
         subject: subject,
         text: text,
         html: output,
      });
      console.log('email sent successfully');
   } catch (error) {
      console.log('email not sent!');
      console.log(error);
   }
};

export default sendEmail;
