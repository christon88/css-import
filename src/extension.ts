import path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { getClassNames, getVariables } from "./shared";

export function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const workspaceRootPath = workspaceFolders[0].uri.fsPath; // Assuming single workspace
    const configPath = path.join(workspaceRootPath, ".atlAutocomplete.json");

    fs.readFile(configPath, "utf8", async (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(
          ".atlAutocomplete file not found or unreadable."
        );
        return;
      }
      const config: { cssUtilityPath: string; cssVariablesPath: string } =
        JSON.parse(data);
      // Now you have your configuration object
      const { cssUtilityPath, cssVariablesPath } = config;

      const classCompletionItems = await getClassNames(cssUtilityPath);
      const classNameProvider = vscode.languages.registerCompletionItemProvider(
        "typescriptreact",
        {
          async provideCompletionItems(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            document: vscode.TextDocument,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            position: vscode.Position
          ) {
            return classCompletionItems;
          },
        }
      );
      const variableCompletionItems = await getVariables(cssVariablesPath);
      const variableProvider = vscode.languages.registerCompletionItemProvider(
        "css",
        {
          async provideCompletionItems(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            document: vscode.TextDocument,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            position: vscode.Position
          ) {
            return variableCompletionItems;
          },
        }
      );

      context.subscriptions.push(classNameProvider);
      context.subscriptions.push(variableProvider);
    });
  } else {
    vscode.window.showErrorMessage("No workspace found.");
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function deactivate() {
  // Nothing specific to clean up in this case
}
