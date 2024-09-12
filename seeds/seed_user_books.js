// initial data for testing

import knex from 'knex';
import configuration from '../knexfile.js';

const db = knex(configuration);

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('user_books').del();

  // Inserts seed entries
  await knex('user_books').insert([
    {
      user_id: 1,
      book_id: EcekAwAAQBAJ 
    },
    {
      user_id: 1,
      book_id: Su2pDwAAQBAJ
    },
    {
      user_id: 2,
      book_id: Jelk7EMpA7sC
    },
  ]);
}

// Run the seed function
seed(db)
  .then(() => {
    console.log('User-books seed data inserted');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding user-books data:', error);
    process.exit(1);
  });
