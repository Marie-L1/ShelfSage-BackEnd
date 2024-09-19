export function up(knex) {
    return knex.schema.createTable('user_books', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('book_id').notNullable();
      table.timestamps(true, true);
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTable('user_books');
  }
