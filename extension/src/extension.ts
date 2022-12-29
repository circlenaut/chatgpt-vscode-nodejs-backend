import * as vscode from 'vscode';
import { exec as cpExec } from "child_process";
import { promisify } from "util";
import path = require('path');
import ChatGptViewProvider from './chatgpt-view-provider';
import { Credentials } from "./types";
import {
	getHealth,
	getSetup,
	getAuth,
	getLogin,
	setLogin,
	getLogout,
	getCredentials,
	setCredentials,
	resetSession,
	refreshSession,
	askQuestion,
	stopServer
} from './chatgpt-client';
import { toBoolean } from './helpers';

// promisified Node executable (Node 10+)
const exec = promisify(cpExec);

// Settings
const defaultLine = "→ ";
const keys = {
  enter: "\r",
  backspace: "\x7f",
};
const actions = {
  cursorBack: "\x1b[D",
  deleteChar: "\x1b[P",
  clear: "\x1b[2J\x1b[3J\x1b[;H",
};

// cleanup inconsitent line breaks
const formatText = (text: string) => `\r${text.split(/(\r?\n)/g).join("\r")}\r`;

export async function activate(context: vscode.ExtensionContext) {
	const writeEmitter = new vscode.EventEmitter<string>();
	const chatViewProvider = new ChatGptViewProvider(context);

	context.subscriptions.push(
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.askGPT', askChatGPT),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.whyBroken', askGPTWhyBroken),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.explainPls', askGPTToExplain),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.refactor', askGPTToRefactor),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.addTests', askGPTToAddTests),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.resetToken', resetToken),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.startAPIServer', startAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.getAPIHealth', getAPIHealth),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.setupAPIServer', setupAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.loginAPIServer', loginAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.setLoginAPIServer', setLoginAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.logoutAPIServer', logoutAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.getAPIServerCredentials', getAPIServerCredentials),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.setAPIServerCredentials', setAPIServerCredentials),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.resetAPIServerSession', resetAPIServerSession),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.refreshAPIServerSession', refreshAPIServerSession),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.checkAPIServerAuthentication', checkAPIServerAuthentication),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.stopAPIServer', stopAPIServer),
		vscode.commands.registerCommand('chatgpt-vscode-nodejs-backend.clearTerminal', () => {
			writeEmitter.fire('\x1b[2J\x1b[3J\x1b[;H');
		}),
		vscode.window.registerWebviewViewProvider("chatgpt-vscode-nodejs-backend.view", chatViewProvider, {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);

	async function askGPTToExplain() { await askChatGPT('Can you explain what this code does?'); }
	async function askGPTWhyBroken() { await askChatGPT('Why is this code broken?'); }
	async function askGPTToRefactor() { await askChatGPT('Can you refactor this code and explain what\'s changed?'); }
	async function askGPTToAddTests() { await askChatGPT('Can you add tests for this code?'); }

	async function resetToken() {
		await context.globalState.update('chatgpt-session-token', null);
		await context.globalState.update('chatgpt-clearance-token', null);
		await context.globalState.update('chatgpt-user-agent', null);
		await chatViewProvider.setUpTokens();
		// await vscode.window.showInformationMessage("Token reset, you'll be prompted for it next to you next ask ChatGPT a question.");
	}

	async function askChatGPT(userInput?: string) {
		if (!userInput) {
			userInput = await vscode.window.showInputBox({ prompt: "Ask ChatGPT a question" }) || "";
		}

		let editor = vscode.window.activeTextEditor;

		if (editor) {
			const selectedCode = editor.document.getText(vscode.window.activeTextEditor?.selection);
			const entireFileContents = editor.document.getText();

			const code = selectedCode
				? selectedCode
				: `This is the ${editor.document.languageId} file I'm working on: \n\n${entireFileContents}`;

			const response = await askQuestion(userInput ?? "");
			console.info(`Response: '${response?.response}'`);
			vscode.window.showInformationMessage(`Response: '${response?.response}'`);
		}
	}

	async function startAPIServer() {
		const runAPIServer = () => {
			const { fork } = require('child_process');
			const serverPath =  path.resolve(__dirname, './api/dist/server.js');
			console.info('Starting API server', serverPath);
			fork(serverPath, {detached: true, env: {...process.env, ELECTRON_RUN_AS_NODE:'1'}});
		};
		
		return runAPIServer();
	}

	async function startAPIServer2(context: vscode.ExtensionContext) {
		const writeEmitter = new vscode.EventEmitter<string>();
		// context.subscriptions.push(vscode.commands.registerCommand('extensionTerminalSample.create', () => {
		
		const runAPIServer = async () => {
			// content
			let content = defaultLine;

			// handle workspaces
			const workspaceRoots: readonly vscode.WorkspaceFolder[] | undefined =
			  vscode.workspace.workspaceFolders;
			if (!workspaceRoots || !workspaceRoots.length) {
			  // no workspace root
			  return "";
			}
			const workspaceRoot: string = workspaceRoots[0].uri.fsPath || "";
	  
			const pty = {
			  onDidWrite: writeEmitter.event,
			  open: () => writeEmitter.fire(content),
			  close: () => {},
			  handleInput: async (char: string) => {
				switch (char) {
				  case keys.enter:
					// preserve the run command line for history
					writeEmitter.fire(`\r${content}\r\n`);
					// trim off leading default prompt
					const command = content.slice(defaultLine.length);
					try {
					  // run the command
					  const { stdout, stderr } = await exec(command, {
						encoding: "utf8",
						cwd: workspaceRoot,
					  });
	  
					  if (stdout) {
						writeEmitter.fire(formatText(stdout));
					  }
	  
					  if (stderr && stderr.length) {
						writeEmitter.fire(formatText(stderr));
					  }
					} catch (error: any) {
					  writeEmitter.fire(`\r${formatText(error.message)}`);
					}
					content = defaultLine;
					writeEmitter.fire(`\r${content}`);
				  case keys.backspace:
					if (content.length <= defaultLine.length) {
					  return;
					}
					// remove last character
					content = content.substr(0, content.length - 1);
					writeEmitter.fire(actions.cursorBack);
					writeEmitter.fire(actions.deleteChar);
					return;
				  default:
					// typing a new character
					content += char;
					writeEmitter.fire(char);
				}
			  },
			};
			const terminal = (<any>vscode.window).createTerminal({
			  name: `Login Handler`,
			  pty,
			});
			terminal.show();
			terminal.sendText("yarn --cwd ./api setup ; yarn --cwd ./api build ; yarn --cwd ./api serve:ts\r\n");
			
			const result = true; //@TODO check if server is running
			await vscode.window.showInformationMessage(`API Server Started: ${result ? 'Yes' : 'No'}`);
		};
		
		return runAPIServer();
	}

	async function getAPIHealth() {
		try {
			const result = await getHealth();
			console.info(`API Health: ${result?.message}`);
			await vscode.window.showInformationMessage(`API Health: ${result?.message}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Retrieving API Health: '${error?.message}'`);
		}
	}

	async function setupAPIServer(context: vscode.ExtensionContext) {
		try {
			const result = await getSetup();
			const isSetup = toBoolean(result?.message);
	
			console.info(`API Server Setup: ${isSetup}`);
			await vscode.window.showInformationMessage(`API Server Setup: ${isSetup ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Setting Up API Server: ${error?.message}`);
		}
	}

	async function checkAPIServerAuthentication() {
		try {
			const result = await getAuth();
			const isAuthenicated = toBoolean(result?.message);
	
			console.info(`API Server Authenticated: ${isAuthenicated}`);
			await vscode.window.showInformationMessage(`API Server Authenticated: ${isAuthenicated ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Running API Server Authentication: ${error?.message}`);
		}
	}

	async function loginAPIServer() {
		try {
			const result = await getLogin();
			const isLoggedIn = toBoolean(result?.message);
	
			console.info(`API Server Login: ${isLoggedIn}`);
			await vscode.window.showInformationMessage(`API Server Login: ${isLoggedIn ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			// console.error(error)
			await vscode.window.showInformationMessage(`Error Running API Server Login: ${error?.message}`);
		}
	}

	async function setLoginAPIServer() {
		try {
			const result = await setLogin();
			const isLoginSet = toBoolean(result?.message);
	
			console.info(`API Server Logged In: ${isLoginSet}`);
			await vscode.window.showInformationMessage(`API Server Logged In: ${isLoginSet ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Setting Up API Server Login: ${error?.message}`);
		}
	}

	async function logoutAPIServer() {
		try {
			const result = await getLogout();
			const isLoggedOut = toBoolean(result?.message);
	
			console.info(`API Server Logged Out: ${!isLoggedOut}`);
			await vscode.window.showInformationMessage(`API Server Logged Out: ${!isLoggedOut ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Running API Server Logout: ${error?.message}`);
		}
	}

	async function getAPIServerCredentials() {
		try {
			const result = await getCredentials();
			const credentials = JSON.parse(result?.message) as Credentials;
	
			console.info(`API Server Credentials: ${credentials}`);
			await vscode.window.showInformationMessage(`Got API Server Credentials: ${credentials?.email} : ${credentials?.password}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Getting API Server Credentials: ${error?.message}`);
		}
	}

	async function setAPIServerCredentials(
		username: string, password: string, isGoogleLogin?: boolean
	) {
		try {
			const result = await setCredentials(username, password, isGoogleLogin);
			const credentials = JSON.parse(result?.message) as Credentials;

			console.info(`API Server Credentials Set: ${credentials}`);
			await vscode.window.showInformationMessage(`Set API Server Credentials: ${credentials.email} : ${credentials.password}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Setting API Server Credentials: ${error?.message}`);
		}
	}

	async function resetAPIServerSession() {
		try {
			const result = await resetSession();
			const isSessionReset = toBoolean(result?.message);
	
			console.info(`API Server Session Reset: ${isSessionReset}`);
			await vscode.window.showInformationMessage(`API Session Reset: ${isSessionReset ? 'OK' : 'Not OK'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Resetting API Session: ${error?.message}`);
		}
	}

	async function refreshAPIServerSession() {
		try {
			const result = await refreshSession();
			const isSesionRefreshed = toBoolean(result?.message);
	
			console.info(`API Session Refreshed: ${isSesionRefreshed}`);
			await vscode.window.showInformationMessage(`API Session Refreshed: ${isSesionRefreshed ? 'OK' : 'Not OK'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Refreshing API Session: ${error?.message}`);
		}
	}

	async function stopAPIServer() {
		try {
			const result = await stopServer(63450);
	
			console.info(`API Server Stopped: ${result}`);
			await vscode.window.showInformationMessage(`API Server Stopped: ${result ? 'Yes' : 'No'}`);
		} catch (error: any) {
			console.error(error?.message);
			await vscode.window.showInformationMessage(`Error Stopping API Server: ${error?.message}`);
		}
	}
}