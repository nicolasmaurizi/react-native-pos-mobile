

import 'dotenv/config';

export default {
  expo: {
    name: "POS Mobile",
    slug: "pos-mobile",
    extra: {
      API_URL: process.env.API_URL,
      ENV: process.env.ENV,
    },
  },
};
