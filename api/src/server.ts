import express from "express";
import cors from "cors";
import busboy from "connect-busboy";
import { OPENAI_API_PORT } from "./constants";
import { defaultRoute } from "./routes";


// Configure express
const app = express();

const corsOptions = {
  origin: '*',
  mode: 'no-cors'
};

app.use(cors(corsOptions));
app.use(busboy());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */
app.use(express.static('public'));

app.use('/', defaultRoute);

// Start the Express server
app.listen(
  JSON.parse(OPENAI_API_PORT ?? "3001") as number, () => {
    console.log(`listening on: http://localhost:${OPENAI_API_PORT}`);
  }
);
