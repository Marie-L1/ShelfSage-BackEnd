// seeds/seed_users.js
import knex from 'knex';
import configuration from '../knexfile.js';
import bcrypt from 'bcrypt';

// Initialize the database connection
const db = knex(configuration.development);

export async function seed() {
  // Deletes ALL existing entries
  await db('users').del();

  // Inserts seed entries
  await db('users').insert([
    {
      username: 'user1',
      email: 'user1@example.com',
      password: await bcrypt.hash('password111', 10), // Hash the password 
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: await bcrypt.hash('password222', 10),
    },
    {
      username: 'user3',
      email: 'user3@example.com',
      password: await bcrypt.hash('password333', 10),
    },
  ]);
}

// Run the seed function
seed()
  .then(() => {
    console.log('Users seed data inserted');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding users data:', error);
    process.exit(1);
  });
