import { fetch } from 'undici';
// import * as kill_port from 'kill-port';
import killPort = require('kill-port');
import detectPort = require('detect-port');
import { ChatResponse } from 'chatgpt';
import { apiBaseUrl, apiBasePath } from "./constants";
import { toBoolean } from "./helpers";
import {
  DataResponse, 
  ErrorResponse
} from "./types";

export const apiHost = new URL(apiBaseUrl);

export const getHealth = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`health`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
    console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const getSetup = async (): Promise<DataResponse> => {
  const result = await getAuth();

  const isAuth = toBoolean(result?.message);
  if (isAuth) {
    throw new Error('Already authenticated. Skipping setup.');
  };

  const fetchUrl = new URL(`${apiBasePath}/setup`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const getAuth = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/auth`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const getLogin = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/login`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const setLogin = async (
  username?: string, password?: string, isGoogleLogin?: boolean
): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/login`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);

  const credentials = JSON.stringify({ username, password, isGoogleLogin });
  console.debug(credentials);
  try {
    const response = await fetch(fetchUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: credentials,
    });
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const askQuestion = async (question: string): Promise<ChatResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/question`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);

  const message = JSON.stringify({ question });
  console.debug(message);
  try {
    const response = await fetch(fetchUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: message,
    });
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as ChatResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};


export const getLogout = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/logout`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const getCredentials = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/credentials`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const setCredentials = async (
    username: string, password: string, isGoogleLogin?: boolean
  ): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/credentials`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);

  const credentials = JSON.stringify({ username, password, isGoogleLogin });
  console.debug(credentials);

  try {
    const response = await fetch(fetchUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credentials }),
    });
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);
   
    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const resetSession = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/reset-session`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const refreshSession = async (): Promise<DataResponse> => {
  const fetchUrl = new URL(`${apiBasePath}/refresh-session`, apiHost);
  console.debug(`fetching url: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl.toString());
    console.debug(
      `API connection ${fetchUrl.toString()}: '${response.ok ? 'success' : response.status}'`,
    );

    const data = JSON.stringify(await response.json());
    console.info(`data: ${data}`);

    if (!response.ok) {    
      const errorResponse = JSON.parse(data) as ErrorResponse;
      throw new Error(errorResponse.error);
    };

    return JSON.parse(data) as DataResponse;
  } catch (err: any) {
        console.error(`Error fetching('${fetchUrl.toString()}'): '${err?.message}'`);
    throw new Error(err?.message);
  };
};

export const stopServer = async (
  port: number, timeOut: number = 1000
): Promise<boolean | void> => {
  setTimeout(() => {
    // Currently you can kill ports running on TCP or UDP protocols
    try {
      killPort(port, 'tcp')
        .then(console.log)
        .catch(console.log);
    } catch (err: any) {
      throw new Error(err?.message);
    };
  }, timeOut);

  const detected = detectPort(port)
  .then(_port => {
    if (port === _port) {
      console.info(`port: ${port} is not occupied`);
      return false;
    } else {
      console.warn(`port: ${port} is occupied, try port: ${_port}`);
      return true;
    }
  })
  .catch(err => {
    throw new Error(err);
  });

  return detected;
};
