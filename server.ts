const pgPromise = require('pg-promise');
const R         = require('ramda');
const request   = require('request-promise');

// Limit the amount of debugging of SQL expressions
const trimLogsSize : number = 200;

// Database interface
interface DBOptions
  { host      : string
  , database  : string
  , user?     : string
  , password? : string
  , port?     : number
  };

// Actual database options
const options : DBOptions = {
  user: 'postgres',
  password: 'test',
  host: 'localhost',
  port: 5432,
  database: 'lovelystay_test',
};

console.info('Connecting to the database:',
  `${options.user}@${options.host}:${options.port}/${options.database}`);

const pgpDefaultConfig = {
  promiseLib: require('bluebird'),
  // Log all querys
  query(query) {
    console.log('[SQL   ]', R.take(trimLogsSize,query.query));
  },
  // On error, please show me the SQL
  error(err, e) {
    if (e.query) {
      console.error('[SQL   ]', R.take(trimLogsSize,e.query),err)
      // prints the duplicate error when needed
      process.exit(0);
    }
  }
};

interface GithubUsers
  { id : number
  };

const pgp = pgPromise(pgpDefaultConfig);
const db = pgp(options);

const listUsers = {
  
}

// when running the list command lists users
if(process.argv[2] == "list"){
  
}else{

  // IF NOT EXISTS - allows for multiple test runs without complaint that table already exists
db.none('CREATE TABLE IF NOT EXISTS github_users (id BIGSERIAL, login TEXT UNIQUE, name TEXT, company TEXT, bio TEXT)')
  // UNIQUE forbids duplicate values of the login field
.then(() => request({
  uri: 'https://api.github.com/users/' + process.argv[2],
  headers: {
        'User-Agent': 'Request-Promise'
    },
  json: true
})
) // added extra field bio to be taken from git API
.then((data: GithubUsers) =>  db.one(
  'INSERT INTO github_users (login, bio) VALUES ($[login], $[bio]) RETURNING id', data))
.then(({id}) => console.log(id))
.then(() => process.exit(0));
}
