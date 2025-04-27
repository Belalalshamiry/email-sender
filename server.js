const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = 3000;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SENDER_EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Gmail Bot <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      text: message,
    };

    await transport.sendMail(mailOptions);

    res.status(200).send('📨 تم إرسال الرسالة بنجاح!');
  } catch (error) {
    console.error('فشل الإرسال:', error);
    res.status(500).send('❌ حدث خطأ أثناء إرسال الرسالة');
  }
});

app.listen(PORT, () => {
  console.log(`🔌 الخادم يعمل على http://localhost:${PORT}`);
});