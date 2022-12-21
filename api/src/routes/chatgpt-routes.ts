import { Router } from "express";
import { database } from "../database";
import {
    OPENAI_EMAIL,
    OPENAI_PASSWORD,
    OPENAI_USE_GOOGLE
} from "../constants";
import { ChatGPT } from "../chatgpt";


// Initialize the router
export const chatGPTRoutes = Router();

// Establish database connection
const db = database();
console.log(`connected to database: ${db.name}`);

// Instantiate ChatGPT
const chatGPT = new ChatGPT(db, {
    credentials: {
        email: OPENAI_EMAIL,
        password: OPENAI_PASSWORD,
        isGoogleLogin: JSON.parse(OPENAI_USE_GOOGLE ?? "false") as boolean
    }
});


chatGPTRoutes.get("/", (_req, res) => {
    return res.send("ChatGPT VSCode Plugin Extension API");
});


chatGPTRoutes.get("/setup", async (_req, res) => {
    try {
        const result = await chatGPT.setup();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while setting up ChatGPT."
        });
    };
});


chatGPTRoutes.get("/login", async (_req, res) => {
    if (!process.env || !process.env.OPENAI_EMAIL || !process.env.OPENAI_PASSWORD) {
        throw new Error(
            "Make sure you provide a Openai credentials in your .env file. \nie: OPENAI_EMAIL=your-openai-email\nOPENAI_PASSWORD=your-openai-password"
        );
    };

    const { OPENAI_EMAIL, OPENAI_PASSWORD } = process.env;

    try {
        const result = await chatGPT.login(OPENAI_EMAIL, OPENAI_PASSWORD);
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while logging in to ChatGPT."
        });
    };
});


chatGPTRoutes.get("/logout", async (_req, res) => {
    try {
        const result = await chatGPT.logout();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while logging out of ChatGPT."
        });
    };
});


chatGPTRoutes.get("/credentials", (_req, res) => {
    try {
        const result = chatGPT.fetchCredentials();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while fetching your credentials."
        });
    };
});


chatGPTRoutes.post("/credentials", (req, res) => {
    const { body } = req;
    console.log('credentials= ', body)
  
    try {
        //   const filter = { cridentials: body.cridentials };
        const update = { 
            credentials: body.credentials
        };
  
         const result = chatGPT.storeCredentials(update.credentials);

        //   const result = await Item.findOneAndUpdate(filter, update);
        console.info('stored credentials= ', result)
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error while storing your credentials.",
        });
    }
});


chatGPTRoutes.get("/reset-session", async (_req, res) => {
    try {
        const result = await chatGPT.resetSession();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while resetting your session."
        });
    };
});


chatGPTRoutes.get("/refresh-session", async (_req, res) => {
    try {
        const result = await chatGPT.resetSession();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while refreshing your session."
        });
    };
});


chatGPTRoutes.get("/auth", async (_req, res) => {
    try {
        const result = await chatGPT.isAuthenicated();
        return res.status(201).send(result);
    } catch (error: any) {
        console.log('error = ', error)
        return res.status(500).send({
            message: error.message || "Some error occurred while checking your authentication."
        });
    };
});
