import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

import { apiDbPath } from '../constants';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbOptions = {};

const db = new Database(apiDbPath, dbOptions);
db.pragma('journal_mode = WAL');

// let User: any;

export const database = () => db;

//@ts-ignore
export const me = async(userId: string) => {
      // let userId = "";

    // User = db.table("users").doc(userId);
    // User.set(
    //   {
    //     name: "Rose Kamal Love",
    //     userId,
    //   },
    //   { merge: true }
    // );
    // const userData = await User.get();
    // const user = userData.data();
    // return user;
    // res.send({ user }); 
};

export const todo = async(
    //@ts-ignore
    userId: string, text: string, completed: boolean
) => {
    // const todo = { text, completed };
    // db.table("users")
    //   .doc(userId)
    //   .collection("todos")
    //   .add(todo);
    // res.send({ todo });
}

export const todoUpdate = async(
    //@ts-ignore
    userId: string, text: string, completed: boolean
) => {
    // const todo = { text, completed };
    // db.table("users")
    //   .doc(userId)
    //   .collection("todos")
    //   .add(todo);
    // res.send({ todo });
}