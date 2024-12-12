const { Client } = require('pg');

const client = new Client({
    user: 'myuser',
    host: 'localhost',
    database: 'mydatabase',
    password: 'mypassword',
    port: 5432,
});

let isConnected = false;

const connectDB = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('PostgreSQL connected');
    } catch (err) {
      console.error('Error connecting to PostgreSQL:', err);
    }
  }
};

const getClient = () => client;

module.exports = { connectDB, getClient };
