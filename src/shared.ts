import * as vscode from "vscode";
import * as fs from "fs";
import postcss from "postcss";

export const getClassNames = async (path: string) => {
  const cssContent = await readCssFile(path);
  console.log("here");
  const classRules = extractClassNamesAndRules(cssContent);

  const completionItems = [];

  for (const [className, rules] of classRules.entries()) {
    const item = new vscode.CompletionItem(
      className,
      vscode.CompletionItemKind.Class
    );
    const documentation = new vscode.MarkdownString(
      "```css\n" + rules + "\n```"
    ); // Use MarkdownString for better formatting
    item.documentation = documentation;
    completionItems.push(item);
  }

  return completionItems;
};

export const getVariables = async (path: string) => {
  const cssContent = await readCssFile(path);

  const cssVariables = extractCssVariables(cssContent);

  const completionItems = Object.entries(cssVariables).map(
    ([variableName, variableValue]) => {
      const completionItem = new vscode.CompletionItem(
        variableName,
        vscode.CompletionItemKind.Variable
      );
      completionItem.detail = variableValue; // Optionally, show the variable value in the detail
      return completionItem;
    }
  );
  return completionItems;
};

function extractClassNamesAndRules(cssContent: string) {
  const classRules = new Map<string, string>(); // Use a Map to store class names and their rules

  // Use PostCSS to parse the CSS
  const root = postcss.parse(cssContent);

  // Walk through all the rules
  root.walkRules((rule) => {
    rule.selectors.forEach((selector) => {
      // Match class selectors
      // eslint-disable-next-line no-useless-escape
      const classRegex = /\.([^\s\.#:\[]+)/g;
      let match;
      while ((match = classRegex.exec(selector)) !== null) {
        const className = match[1]; // Extract class name
        if (!classRules.has(className)) {
          classRules.set(className, rule.toString()); // Store the whole rule as a string
        }
      }
    });
  });

  return classRules; // Return the Map containing class names and their rules
}

function extractCssVariables(cssContent: string) {
  const cssVariables = new Map<string, string>();

  // Use PostCSS to parse the CSS
  const root = postcss.parse(cssContent);

  // Walk through all the declarations to find CSS variables
  root.walkDecls((decl) => {
    if (decl.prop.startsWith("--")) {
      // Store variable name and value
      cssVariables.set(decl.prop, decl.value);
    }
  });

  return Object.fromEntries(cssVariables);
}

function readCssFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
