const app = require("./app");

var sql = require("mssql");
var sqlConnection = require('./sql')

const PORT = parseInt(process.env.PORT) || 8000;
// Make sure we are running node 10.0+
const [major, minor] = process.versions.node.split(".").map(parseFloat);
if (major < 10 || (major === 10 && minor <= 0)) {
  process.exit();
}

// import environmental variables from our variables.env file
require("dotenv").config({ path: ".variables.env" });

let dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: false },
  connectionTimeout: 6000000,
  requestTimeout: 90000000,
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 3000000
}
};

async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
  } catch (error) {
    process.exit(1);
  }
}
// Start our app!


async function init() {
  // await new Promise(resolve => setTimeout(resolve, 60000));
  await connectToDatabase();

  // app.set("port", parseInt(process.env.PORT) || 8000);
  const server = app.listen(PORT, () => {
    console.log(
      `Starting MS SQL + Express → On PORT : ${server.address().port}`
    );
  });

  server.timeout = 9000000
}

init();
