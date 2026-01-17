/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map<string, Thenable<ExampleSettings>>();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = (
			(change.settings.languageServerExample || defaultSettings)
		);
	}
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received a file change event');
});

const keywords = [
	'if', 'else', 'for', 'while', 'break', 'continue', 'return', 'and', 'or', 'import'
];

const functions = [
	{ name: 'to_timestamp', category: 'Date', documentation: 'Convert to timestamp' },
	{ name: 'to_unix_timestamp', category: 'Date', documentation: 'Convert to Unix timestamp' },
	{ name: 'parse_date', category: 'Date', documentation: 'Parse date string' },
	{ name: 'parse_local_datetime', category: 'Date', documentation: 'Parse local datetime' },
	{ name: 'date_format', category: 'Date', documentation: 'Format date' },
	{ name: 'print', category: 'IO', documentation: 'Print to stdout' },
	{ name: 'printf', category: 'IO', documentation: 'Formatted print' },
	{ name: 'println', category: 'IO', documentation: 'Print with newline' },
	{ name: 'printi', category: 'IO', documentation: 'Print integer' },
	{ name: 'interpolate', category: 'IO', documentation: 'String interpolation' },
	{ name: 'rand', category: 'Random', documentation: 'Random float' },
	{ name: 'randi', category: 'Random', documentation: 'Random integer' },
	{ name: 'choose', category: 'Random', documentation: 'Choose random element' },
	{ name: 'uuid', category: 'Random', documentation: 'Generate UUID' },
	{ name: 'uuid32', category: 'Random', documentation: 'Generate 32-char UUID' },
	{ name: 'uuid36', category: 'Random', documentation: 'Generate 36-char UUID' },
	{ name: 'reverse', category: 'String', documentation: 'Reverse string or array' }
];

const brackets = [
	{ label: '(', kind: CompletionItemKind.Text, insertText: '(' },
	{ label: ')', kind: CompletionItemKind.Text, insertText: ')' },
	{ label: '{', kind: CompletionItemKind.Text, insertText: '{' },
	{ label: '}', kind: CompletionItemKind.Text, insertText: '}' },
	{ label: '[', kind: CompletionItemKind.Text, insertText: '[' },
	{ label: ']', kind: CompletionItemKind.Text, insertText: ']' }
];

const quotes = [
	{ label: '"', kind: CompletionItemKind.Text, insertText: '"' },
	{ label: "'", kind: CompletionItemKind.Text, insertText: "'" }
];

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const keywordItems: CompletionItem[] = keywords.map((keyword, index) => ({
			label: keyword,
			kind: CompletionItemKind.Keyword,
			data: { type: 'keyword', id: index }
		}));

		const functionItems: CompletionItem[] = functions.map((func, index) => ({
			label: func.name,
			kind: CompletionItemKind.Function,
			data: { type: 'function', id: index }
		}));

		return [...functionItems, ...keywordItems, ...brackets, ...quotes];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		const data = item.data as { type: string; id: number };

		if (data.type === 'keyword') {
			const keyword = keywords[data.id];
			item.detail = `Keyword: ${keyword}`;
			switch (keyword) {
				case 'if':
				case 'else':
					item.documentation = 'Conditional statement';
					break;
				case 'for':
				case 'while':
					item.documentation = 'Loop statement';
					break;
				case 'break':
					item.documentation = 'Exit from loop';
					break;
				case 'continue':
					item.documentation = 'Skip to next iteration';
					break;
				case 'return':
					item.documentation = 'Return from function';
					break;
				case 'and':
				case 'or':
					item.documentation = 'Logical operator';
					break;
				case 'import':
					item.documentation = 'Import statement';
					break;
			}
		} else if (data.type === 'function') {
			const func = functions[data.id];
			item.detail = `${func.category}: ${func.name}`;
			item.documentation = {
				kind: 'markdown',
				value: func.documentation
			};
		} else if (data.type === 'keyword') {
			item.documentation = {
				kind: 'markdown',
				value: item.documentation as string
			};
		}

		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
