import { isExpressionWithTypeArguments } from "typescript";

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
    }
  }
};

interface GithubUsers
  { id : number
  };

// CREATE INDEX github_users_idx_location_login ON github_users (location,login);
// CREATE INDEX language_prefs_idx_language_login ON language_prefs (language,login);

const pgp = pgPromise(pgpDefaultConfig);
const db = pgp(options);
var listUsersByLocation = (location) => db.manyOrNone('SELECT login from github_users WHERE location = ' + location + ';');
var listUsersByLanguage = (location, language) => db.manyOrNone('SELECT u.login FROM github_users u, language_prefs l  WHERE u.location = ' + location + ' AND l.language = ' + language + ' AND u.login = l.login;');
var addPreference = (login, language) => db.none('INSERT INTO language_prefs (login, language) VALUES (' + login + ',' + language + ')');

// when running the list command lists users
if(process.argv[2] == "list"){

  listUsersByLocation("'" + process.argv[3] + "'") // reads argument using it for user location search
.then((result) => console.log(result))
.catch(error => console.error(error))
.finally(() => process.exit(0));

// when running the pref command lists user with specific preference
}else if(process.argv[2] == "pref"){

  listUsersByLanguage("'" + process.argv[3] + "'", "'" + process.argv[4] + "'") // reads arguments using them for user location and languagePref search
.then((result) => console.log(result))
.catch(error => console.error(error))
.finally(() => process.exit(0));

// adds 1 or more language preferences to a user
}else if(process.argv[2] == "add"){

    addPreference("'" + process.argv[3] + "'", "'" + process.argv[4] + "'")
  .catch(error => console.error(error))
  .finally(() => process.exit(0));

}else{
  // IF NOT EXISTS - allows for multiple test runs without complaint that table already exists
  db.none('CREATE TABLE IF NOT EXISTS github_users (id BIGSERIAL, login TEXT UNIQUE, name TEXT, company TEXT, bio TEXT, location TEXT, PRIMARY KEY (ID))')
.then(db.none('CREATE INDEX orderedLogin ON github_users (login);'))
.then(db.none('CREATE TABLE IF NOT EXISTS language_prefs (login TEXT NOT NULL, language TEXT, UNIQUE(login, language))')) 
.then(() => request({  

  uri: 'https://api.github.com/users/' + process.argv[2],
  headers: {
        'User-Agent': 'Request-Promise'
    },
  json: true
})
) // added extra field bio to be taken from git API
.then((data: GithubUsers) =>  db.one(
  'INSERT INTO github_users (login, bio, location) VALUES ($[login], $[bio], $[location]) RETURNING id', data))
.then(({id}) => console.log(id))
.catch(error => console.error(error))
.finally(() => process.exit(0));
}


