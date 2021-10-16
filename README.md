## Typescript Interview Test

1. Install postgres & nodejs
2. Create the test database using the `./createdb.sh` script
3. Install the `npm_modules` for this project running `npm install`
4. Run `npm run test` to get the program running (modify the user and password if needed)
5. Examine the typescript code under `server.ts`

Challenge 2:
1. Added IF NOT EXISTS to table creation statement to not crash after first run
2. Running the command "npm test <username>" will add your username to the uri link to reach the github API, and add that user to the table.
3. Added a location and a bio field, which can both be called from the same uri as the login
4. Added the UNIQUE statement to the login field, so only users couldnt be added more than once.
5. To process the desired query, utilized the manyOrNone function which, and then utilised the then and catch funcionalities to log the result and deal with errors.
6 & 7. in detail on the file of the same name.
