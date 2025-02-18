const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

const createHash = (data, publicKey) => {
  return crypto.createHmac("sha512", publicKey).update(data).digest("base64");
};

const encodeUsingBase64 = (data) => {
  return Buffer.from(JSON.stringify(data)).toString("base64");
};

function getCurrentTimestamp() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
}

app.get("/checkout", async (req, res) => {
  try {
    const publicKey = process.env.ABA_PAYWAY_API_KEY;
    const merchantId = process.env.ABA_PAYWAY_MERCHANT_ID;
    const apiUrl = process.env.ABA_PAYWAY_API_URL;

    const items = [
      {
        name: "Beng Beng",
        quantity: 1,
        price: 1.0,
      },
      {
        name: "Top ten",
        quantity: 20,
        price: 10.0,
      },
    ];

    const payload = {
      req_time: getCurrentTimestamp(),
      merchant_id: merchantId,
      tran_id: getCurrentTimestamp(),
      first_name: "Fandi",
      last_name: "Az",
      email: "fandiaz@gmail.com",
      phone: "089423157675",
      amount: items.reduce((data, item) => data + item.price, 0),
      purchase_type: "purchase",
      payment_option: "abapay_khqr",
      items: encodeUsingBase64(items),
      currency: "usd",
      // callback_url: null,
      // return_deeplink: null,
      // custom_fields: null,
      // return_params: null,
      // lifetime: 6,
      qr_image_template: "template3_color",
    };

    console.log({ payload });

    const hashValue =
      payload.req_time +
      payload.merchant_id +
      payload.tran_id +
      payload.amount +
      payload.items +
      payload.first_name +
      payload.last_name +
      payload.email +
      payload.phone +
      payload.purchase_type +
      payload.payment_option +
      // payload.callback_url +
      // payload.return_deeplink +
      payload.currency +
      // payload.custom_fields +
      // payload.return_params +
      // payload.lifetime +
      payload.qr_image_template;

    payload.hash = createHash(hashValue, publicKey);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        language: "en",
      },
    });

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        status: error.response.status,
        message: "Request Error",
        errors: error.response.data,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: "Server Error",
        errors: error.message,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`pakek nanya`);
});
