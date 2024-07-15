export default () => ({
  server: {
    port: parseInt(process.env.PORT, 10) || 4000,
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    user: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    name: process.env.POSTGRES_DB, // Название базы данных
    synchronize: process.env.SYNCHRONIZE,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET,
    tokenTimeLimit: process.env.TOKEN_TIME_LIMIT,
  },
});
