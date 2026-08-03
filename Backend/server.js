require("dotenv").config();

const app = require("./app");
const connectdb = require("./config/db");

connectdb();

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
