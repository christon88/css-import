import path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import postcss from "postcss";

export  function activate(context: vscode.ExtensionContext) {


  const classNameProvider = vscode.languages.registerCompletionItemProvider("typescriptreact", {

    async provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ) {
      const cssUtilityPath = path.join(
        __dirname,
        "..",
        "node_modules",
        "@tlx/atlas",
        "dist",
        "atlas-utilities.css"
      );
 

      const getClassNames = async () => {
        const cssContent = await readCssFile(cssUtilityPath);

        const classRules = extractClassNamesAndRules(cssContent);
        
        const completionItems = [];
        
        for (const [className, rules] of classRules.entries()) {
          const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Class, );
       //   const documentation =new vscode.MarkdownString('```css\n' + rules + '\n```'); // Use MarkdownString for better formatting
          item.detail = rules;
            completionItems.push(item);
        }
    
        return completionItems;
    
      };


      const completionItems = await getClassNames();
      return completionItems;
    },
  });

  const variableProvider = vscode.languages.registerCompletionItemProvider("css", {

    async provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ) {
  
      const cssVariablesPath = path.join(
        __dirname,
        "..",
        "node_modules",
        "@tlx/atlas",
        "dist",
        "atlas-base.css"
      );

    

      const getVariables = async () => {
        const cssContent = await readCssFile(cssVariablesPath);

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

      const completionItems =  await getVariables();
      return completionItems;
    },
  });


  context.subscriptions.push(classNameProvider);
  context.subscriptions.push(variableProvider);
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


function extractClassNamesAndRules(cssContent: string) {
  const classRules = new Map<string, string>(); // Use a Map to store class names and their rules

  // Use PostCSS to parse the CSS
  const root = postcss.parse(cssContent);

  // Walk through all the rules
  root.walkRules(rule => {
      rule.selectors.forEach(selector => {
          // Match class selectors
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

export function deactivate() {
  // Nothing specific to clean up in this case
}
