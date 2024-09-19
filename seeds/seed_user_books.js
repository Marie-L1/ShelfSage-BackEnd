// seeds/seed_user_books.js
import knex from 'knex';
import configuration from '../knexfile.js';

// Initialize the database connection
const db = knex(configuration.development);

export async function seed() {
  // Deletes ALL existing entries
  await db('user_books').del();

  // Inserts seed entries
  await db('user_books').insert([
    {
      user_id: 11,
      book_id: 'OL20867W'
    },
  ]);
}

// Run the seed function
seed()
  .then(() => {
    console.log('User-books seed data inserted');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding user-books data:', error);
    process.exit(1);
  });

