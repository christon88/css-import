import path from 'path';
import * as vscode from 'vscode';
import * as fs from "fs";
import postcss from 'postcss';

export function activate(context: vscode.ExtensionContext) {
	const provider = vscode.languages.registerCompletionItemProvider('html', {
	  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		const cssFilePaths = [
		  path.join(__dirname, '..', 'node_modules', '@tlx/atlas', 'dist', 'atlas-utilities.css'),
		  // Add more paths as needed
		];
		const classNames = new Set<string>();
		
		// Read and parse each CSS file
		for (const filePath of cssFilePaths) {
		  const cssContent = await readCssFile(filePath);
		  const fileClassNames = await extractClassNames(cssContent);
		  fileClassNames.forEach(className => classNames.add(className));
		}
  
		const completionItems = Array.from(classNames).map(className =>
		  new vscode.CompletionItem(className, vscode.CompletionItemKind.Class));
  
		return completionItems;
	  }
	});
  
	context.subscriptions.push(provider);
  }


function readCssFile(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
	  fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
		  reject(err);
		  return;
		}
		resolve(data);
	  });
	});
  }

   function extractClassNames(cssContent: string): string[] {
	const classNames: string[] = [];
  
	// Use PostCSS to parse the CSS
	const root = postcss.parse(cssContent);
  
	// Walk through all the rules (selectors)
	root.walkRules(rule => {
	  rule.selectors.forEach(selector => {
		// Match class selectors
		const classRegex = /\.([^\s\.#:\[]+)/g;
		let match;
		while ((match = classRegex.exec(selector)) !== null) {

			const name = match[1];
		  // Add found class name to the Set
		  classNames.push(name);
		}
	  });
	});
  
	// Return an array of unique class names
	return classNames;
  }


// This method is called when your extension is deactivated
export function deactivate() {}
