import { requiresm } from "esm-ts";
import { Database } from 'better-sqlite3';
import {
    ChatGPTAPIBrowser,
    ChatResponse,
    SendMessageOptions
} from 'chatgpt';


export interface Credentials {
    email?: string;
    password?: string;
    isGoogleLogin?: boolean;
}

export class ChatGPT {
    private db: Database;
    private sendMsgOpts?: SendMessageOptions;
    private chatGptApiBrowser?: ChatGPTAPIBrowser;
    private chatGptResponse?: ChatResponse;
    private credentials?: Credentials;

    constructor(db: Database, opts: {
        credentials?: Credentials
    }) {
        this.db = db;
        this.credentials = opts.credentials;

        this.initDatabase();
    };
        
    public initDatabase = (): Database => {
        const db = this.db;
        console.debug(`Initializing database: ${db.name}`);
        return db;
    };

    public fetchCredentials = (): Credentials => {
        if (!this.credentials?.email || !this.credentials?.password) {
            throw new Error(
                `Credentials are not valid, '${this.credentials?.email}', '${this.credentials?.password}'`
            );
        }

        return this.credentials;
    };

    public storeCredentials = (login: Credentials): Credentials => {
        if (!login.email || !login.password) {
            throw new Error(
                `Credentials are not valid, '${login.email}', '${login.password}'`
            );
        }
        this.credentials = login;
        return this.fetchCredentials();
    };

    public setup = async(): Promise<boolean | void> => {
        if (!this.credentials?.email || !this.credentials?.password) {
            throw new Error(
                `Credentials are not valid, '${this.credentials?.email}', '${this.credentials?.password}'`
            );
        };
       
        if (!this.chatGptApiBrowser) {
            console.info('Initializing ChatGPT...');
            try {
                const chatgpt: any = await requiresm("chatgpt");
                const { ChatGPTAPIBrowser: _ChatGPTAPIBrowser} = chatgpt;

                this.chatGptApiBrowser  = new _ChatGPTAPIBrowser ({...this.credentials});

            } catch (error: any) {
                switch (error?.message) {
                    case "Navigation failed because browser has disconnected!":
                        throw new Error(error.message);
                    case "Waiting for selector `#password` failed: Protocol error (Runtime.callFunctionOn): Target closed.":
                        throw new Error(error.message);
                    default: throw new Error(
                        `Failed to setup ChatGPT: '${error?.message}'`
                    );
                }
            }
        }
        console.info('ChatGPT initialized!');
        return true
    };

    public initialize = async(): Promise<boolean | void> => {
        if (!this.chatGptApiBrowser) {
            throw new Error(
                "Please run ChatGPT setup before initializing"
            );
        };       

        try {            
            await this.chatGptApiBrowser?.initSession();
            
            return this.chatGptApiBrowser?.getIsAuthenticated() ?? false;

        } catch (error: any) {
            switch (error?.message) {
                case "Navigation failed because browser has disconnected!":
                    throw new Error(error.message);
                    case "Waiting for selector `#password` failed: Protocol error (Runtime.callFunctionOn): Target closed.":
                        throw new Error(error.message);
                default: throw new Error(
                    `Failed to initialize ChatGPT: '${error?.message}'`
                );
            }
        }
    };

    public login = async(
        email: string,
        password: string,
        isGoogleLogin?: boolean
    ): Promise<boolean | void> => {
        const isAuth = await this.isAuthenicated();
        if (isAuth) {
            throw new Error("Already Authenticated");
        };

        try {
            this.storeCredentials({email, password, isGoogleLogin});

            return await this.initialize();
        } catch (error: any) {
            throw new Error(`Failed to login to ChatGPT: '${error?.message}'`);
        }
    };

    public isAuthenicated = async(): Promise<boolean | void> => {
        try {
            return await this.chatGptApiBrowser?.getIsAuthenticated() ?? false;
        } catch (error: any) {
            throw new Error (`Authentication check failed: '${error.message}'`);
        };
    };

    public logout = async(): Promise<boolean | void> => {
        const isAuth = await this.isAuthenicated();
        if (!isAuth) {
            throw new Error("Already Logged Out");
        };
        
        try {
            await this.chatGptApiBrowser?.closeSession();

            return await this.isAuthenicated();

        } catch (error: any) {
            throw new Error(`Failed to logout of ChatGPT: '${error?.message}'`);
        };
    };

    public resetSession = async(): Promise<boolean | void> => {
        const isAuth = await this.isAuthenicated();
        if (!isAuth) {
            throw new Error("Not logged in!");
        };

        try {
            await this.chatGptApiBrowser?.resetSession();

            return await this.isAuthenicated();

        } catch (error: any) {
            throw new Error(`Failed to reset ChatGPT session: '${error?.message}'`);
        };
    };

    public refreshSession = async(): Promise<boolean | void> => {
        const isAuth = await this.isAuthenicated();
        if (!isAuth) {
            throw new Error("Not logged in!");
        };

        try {
            await this.chatGptApiBrowser?.refreshSession();

            return await this.isAuthenicated();
        } catch (error: any) {
            throw new Error(`Failed to refresh ChatGPT session: '${error?.message}'`);
        };
    };

    public resetThread = async(): Promise<void> => {
        try {
            return await this.chatGptApiBrowser?.resetThread();
        } catch (error: any) {
            throw new Error(`Failed to reset ChatGPT thread: '${error?.message}'`);
        };
    };

    public isOnChatPage = async() => {
        const isAuth = await this.isAuthenicated();
        if (!isAuth) {
            throw new Error("Not logged in!");
        };

        return this.chatGptApiBrowser?.isChatPage;
    };

    public sendQuestion = async(question: string) => {
        const isAuth = await this.isAuthenicated();
        if (!isAuth) {
            throw new Error("Not Authenticated");
        };

        if (!this.sendMsgOpts) {
            this.sendMsgOpts = {
                timeoutMs: 2 * 60 * 1000
            };
        };

        try {
            this.chatGptResponse = this.chatGptApiBrowser
                && await this.chatGptApiBrowser.sendMessage(question, this.sendMsgOpts);           

            if (!this.chatGptResponse) {
                throw new Error(
                    `Error receiving question from ChatGPT: '${question}'`
                );
            };

            return this.chatGptResponse;

        } catch (error: any) {
            throw new Error(
                `Error sending request to ChatGPT: '${error?.message}'`
            );
        };
    };

    public clearChat = () => {
        this.chatGptResponse = undefined;
    }
}