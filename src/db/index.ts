import "dotenv/config";
import fs from "fs";
import { Client, ClientConfig } from "pg";
import configs from "../config/index";

const config: ClientConfig = {
  connectionString: configs.connectionString,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./certs/root.crt").toString(),
  },
};

const conn = new Client(config);

export default conn;
