require("dotenv").config();
const connectDb = require("./src/configurations/db.js");
const app = require("./src/app.js");
const startTokenCleanup = require("./src/utilities/tokenCleanup.js");
const PORT = process.env.PORT || 8000;

const startServer = async () => {
    await connectDb();
    startTokenCleanup();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
};
startServer();




