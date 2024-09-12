exports.up = function(knex) {
  return knex.schema.createTable('user_books', table => {
    table.increments('id').primary(); // Auto-incrementing primary key
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('book_id').references('id').inTable('books').onDelete('CASCADE'); // Foreign key to the books table
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_books');
};

