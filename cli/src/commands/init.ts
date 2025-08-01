import { makeDatabase } from './makeDatabase.js';
import { makeModel } from './makeModel.js';

export default {
  command: 'init',
  describe: 'Initialize database and create a default User model',
  handler: async () => {
    // 1. Initialize the database
    await makeDatabase();
    // 2. Create the User model with specified fields
    // name: string, nullable; email: string, required, unique
    await makeModel('User', 'name:string,email:string:required:unique');
    console.log('Project initialized: database and User model created.');
  }
};
