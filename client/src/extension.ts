/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, window, commands, Terminal } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;
let terminal: Terminal | undefined = undefined;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for round-el documents
		documentSelector: [{ scheme: 'file', language: 'round-el' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	// Register the run file command
	const runCommand = commands.registerCommand('round-el.runFile', () => {
		runRel(context);
	});
	context.subscriptions.push(runCommand);
}

function runRel(context: ExtensionContext) {
	const editor = window.activeTextEditor;
	if (!editor) {
		window.showErrorMessage('No active editor');
		return;
	}

	const document = editor.document;
	if (document.languageId !== 'round-el') {
		window.showErrorMessage('Current file is not a Round El file');
		return;
	}

	if (!document.isUntitled && document.uri.scheme === 'file') {
		const filePath = document.fileName;

		if (!terminal) {
			terminal = window.createTerminal('Round El');
			context.subscriptions.push(terminal);
		}

		terminal.show();
		terminal.sendText(`rel "${filePath}"`);
	}
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
