import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import util from "util";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const replacePlaceholders = (
  content: string,
  placeholders: { [key: string]: string },
) => {
  for (const [key, value] of Object.entries(placeholders)) {
    if (!value) {
      console.error(chalk.red(`Error: Missing value for placeholder {${key}}`));
      process.exit(1);
    }
    content = content.replace(new RegExp(`{${key}}`, "g"), value || "");
  }
  return content;
};

const copyStubFiles = async (
  stubDir: string,
  destDir: string,
  placeholders: { [key: string]: string },
) => {
  const files = await fs.readdir(stubDir);

  for (const file of files) {
    const filePath = path.join(stubDir, file);
    const newFileName = file
      .replace("{PLUGIN_NAME}", placeholders.PLUGIN_NAME)
      .replace(".stub", "");
    const destPath = path.join(destDir, newFileName);

    if ((await fs.stat(filePath)).isDirectory()) {
      // Recursively create directories in the destination
      await fs.ensureDir(destPath);
      await copyStubFiles(filePath, destPath, placeholders); // Recurse into subdirectories
    } else {
      // Make sure the directory exists in the destination
      await fs.ensureDir(path.dirname(destPath));
      let content = await fs.readFile(filePath, "utf-8");

      // Replace placeholders in the content
      content = replacePlaceholders(content, placeholders);

      // Write the modified content to the new file
      await fs.writeFile(destPath, content);
    }
  }
};

const installDependencies = async (destDir: string) => {
  try {
    const execPromise = util.promisify(exec);
    console.log(chalk.blue("Installing dependencies..."));
    await execPromise("npm install", { cwd: destDir });
    console.log(chalk.green("✔ Dependencies installed successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Error installing dependencies: "), error);
    process.exit(1);
  }
};

const showLuaInformation = async (
  destDir: string,
  placeholders: { [key: string]: string },
) => {
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
  console.log(
    chalk.blue(
      `Now you can start editing your plugin in ${destDir}/plugins/${placeholders.PLUGIN_NAME}/core.lua`,
    ),
  );
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
};

const showJavaScriptInformation = async (
  destDir: string,
  placeholders: { [key: string]: string },
) => {
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
  console.log(
    chalk.blue(
      `Now you can start editing your plugin in ${destDir}/plugins/${placeholders.PLUGIN_NAME}/core.js`,
    ),
  );
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
};

const showTypescriptInformation = async (
  destDir: string,
  placeholders: { [key: string]: string },
) => {
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
  console.log(
    chalk.blue(
      `Now you can start editing your plugin in ${destDir}/plugins/${placeholders.PLUGIN_NAME}/core.ts`,
    ),
  );
  console.log(chalk.blue("Build your plugin using the following command:"));
  console.log(chalk.blue(chalk.bold(`cd ${destDir} && npm run build`)));
  console.log(
    chalk.blue(
      "==========================================================================================",
    ),
  );
};

export const GeneratePlugin = async (
  language: string,
  placeholders: { [key: string]: string },
) => {
  const stubDir = path.join(__dirname, "stubs", language.toLowerCase());
  if (!fs.existsSync(stubDir)) {
    console.error(
      chalk.red(`❌ The stubs directory for ${language} does not exist.`),
    );
    process.exit(1);
  }

  const destDir = path.join(process.cwd(), placeholders.PLUGIN_NAME);

  await fs.ensureDir(destDir);

  await copyStubFiles(stubDir, destDir, placeholders);
  if (language === "lua") {
    await showLuaInformation(destDir, placeholders);
  } else if (language === "javascript") {
    await showJavaScriptInformation(destDir, placeholders);
  } else if (language === "typescript") {
    await installDependencies(destDir);
    await showTypescriptInformation(destDir, placeholders);
  }
};
