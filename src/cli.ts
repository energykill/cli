#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { GeneratePlugin } from './utils';

const program = new Command();

program
  .name('energykill-cli')
  .description('CLI for creating and managing SwiftlyCS2 plugins projects')
  .version('1.0.3');

program
  .command('init')
  .description('Initialize a new project')
  .option('-l, --language <language>', 'Language of the Project (lua, javascript, typescript)')
  .option('-n, --name <name>', 'Name of the Project')
  .option('-d, --description <description>', 'Description of the Project')
  .option('-a, --author <author>', 'Author of the Project')
  .option('-w, --website <website>', 'Website of the Project')
  .action(async (options) => {
    let { name, language, author, website, description } = options;

    const questions: any = [];

    if (!language) {
      questions.push({
        type: 'list',
        name: 'language',
        message: 'Select the language of the project:',
        choices: [
          { name: 'Lua', value: 'lua' },
          { name: 'Javascript', value: 'javascript' },
          { name: 'Typescript', value: 'typescript' },
        ],
        default: 'lua',
      });
    }

    if (!name) {
      questions.push({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the project:',
        default: 'example-project',
        validate: (input: string) => {
          if (!input) {
            return 'Name cannot be empty.';
          }
          if (input.length < 3) {
            return 'Name must be at least 3 characters long.';
          }
          return true;
        },
      });
    }

    if (!description) {
      questions.push({
        type: 'input',
        name: 'description',
        message: 'Enter the description of the project:',
        default: 'An example plugin for SwiftlyCS2',
        validate: (input: string) => {
          if (!input) {
            return 'Description cannot be empty.';
          }
          if (input.length < 10) {
            return 'Description must be at least 10 characters long.';
          }
          return true;
        },
      });
    }

    if (!author) {
      questions.push({
        type: 'input',
        name: 'author',
        message: 'Enter the author of the project:',
        default: 'Your Name',
        validate: (input: string) => {
          if (!input) {
            return 'Author cannot be empty.';
          }
          if (input.length < 3) {
            return 'Author name must be at least 3 characters long.';
          }
          return true;
        },
      });
    }

    if (!website) {
      questions.push({
        type: 'input',
        name: 'website',
        message: 'Enter the website of the project:',
        default: 'https://example.com',
        validate: (input: string) => {
          const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
          if (!input) {
            return 'Website cannot be empty.';
          }
          if (!urlPattern.test(input)) {
            return 'Please enter a valid URL.';
          }
          return true;
        },
      });
    }

    try {
      const answers = await inquirer.prompt(questions);

      name = name || answers.name;
      language = language ?? answers.language;
      author = author || answers.author;
      website = website || answers.website;
      description = description || answers.description;
      const placeholders = {
        PLUGIN_NAME: name,
        PLUGIN_VERSION: '1.0.0',
        PLUGIN_DESCRIPTION: description,
        PLUGIN_AUTHOR: author,
        PLUGIN_URL: website,
      };

      await GeneratePlugin(language, placeholders);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('User force closed the prompt')) {
          console.log('Prompt was closed by the user, no worries!');
        } else {
          console.error('An unexpected error occurred:', error.message);
        }
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

program.parseAsync(process.argv);
