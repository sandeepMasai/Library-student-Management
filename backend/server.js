const dotenv = require("dotenv");
const { connectToMongo } = require("./src/config/db");
const app = require("./src/app");

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectToMongo();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start();
