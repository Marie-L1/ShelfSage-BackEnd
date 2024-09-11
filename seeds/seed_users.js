// Testing data

import bcrypt from 'bcrypt';
import knex from "../knexfile.js";

export const seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
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
};


