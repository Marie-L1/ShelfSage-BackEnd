export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.timestamps(true, true); // Adds created_at and updated_at
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
  
