export function up(knex) {
  return knex.schema.createTable('user_books', (table) => {
    table.increments('id').primary(); // Auto-incrementing primary key
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('google_book_id').notNullable(); // ID from Google Books API
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('user_books');
}

