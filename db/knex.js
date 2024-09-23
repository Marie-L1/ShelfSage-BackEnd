import knex from 'knex';
import knexConfig from '../knexfile.js'; 

const knexDb = knex(knexConfig.development);

export default knexDb;

