import { Command } from 'commander';
import chalk from 'chalk';
import { makeModel } from './commands/makeModel.js';
import { makeDatabase } from './commands/makeDatabase.js';
import initCommand from './commands/init.js';

const program = new Command();

program
  .name('nuxt-crud')
  .description('CLI tool for generating CRUD backend files in Nuxt 3 projects')
  .version('1.0.0');

program
  .command('make:model')
  .description('Generate a new Drizzle model/schema')
  .argument('<name>', 'Model name (e.g., User, Product)')
  .option('-f, --fields <fields>', 'Model fields (e.g., "name:string,email:string,age:number")')
  .action(async (name: string, options: { fields?: string }) => {
    try {
      await makeModel(name, options.fields);
      console.log(chalk.green(`✅ Model ${name} created successfully!`));
    } catch (error) {
      console.error(chalk.red(`❌ Error creating model: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('make:database')
  .description('Create Drizzle ORM database file')
  .action(async () => {
    try {
      await makeDatabase();
      console.log(chalk.green('✅ Drizzle ORM database created!'));
    } catch (error) {
      console.error(chalk.red(`❌ Error creating database: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize database and create a default User model')
  .action(async () => {
    try {
      await initCommand.handler();
      console.log(chalk.green('✅ Project initialized: database and User model created.'));
    } catch (error) {
      console.error(chalk.red(`❌ Error initializing project: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program.parse();