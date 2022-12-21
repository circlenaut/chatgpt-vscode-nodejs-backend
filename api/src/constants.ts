import dotenv from 'dotenv';
import path from 'path';

// Import environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define environment variables
export const {
    OPENAI_API_PORT,
    OPENAI_EMAIL,
    OPENAI_PASSWORD,
    OPENAI_USE_GOOGLE
} = process.env;

// Check environment variables
if (OPENAI_EMAIL && !OPENAI_PASSWORD) {
    throw new Error(
        "Make sure to also provide you OpenAI password in your .env file.\nie: OPENAI_EMAIL=your-openai-email\nOPENAI_PASSWORD=your-openai-password"
    );
};

// Print environment variables
console.log(`env: OPENAI_API_PORT: '${OPENAI_API_PORT}'`);
console.log(`env: OPENAI_EMAIL: '${OPENAI_EMAIL ?? "not set"}'`);
console.log(`env: OPENAI_PASSWORD: '${OPENAI_PASSWORD ?? "not set"}'`);
console.log(`env: OPENAI_USE_GOOGLE: '${OPENAI_USE_GOOGLE}'`);

// Define application constants
export const apiDbPath = "./data/chatgpt.db";
console.log(`SQLite DB path: '${apiDbPath}'`);