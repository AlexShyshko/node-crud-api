### Before checking the task, make sure that you use NodeJS version _22.14.0_. Different version may not work properly!   
#### Before checking the task complete these prerequisites (`commands` may vary depending on your development environment):
- Clone the repository `git clone https://github.com/AlexShyshko/node-crud-api.git`
- Enter the repository `cd node-crud-api`
- Choose the correct branch `git checkout crud-api`
- Install dependencies `npm install`
#### The application supports these predefined scripts:
- `npm run start:dev` - a single cluster mode.
- `npm run start:prod` - the same bundled in one js file.
- `npm run start:multi` - a multi cluster mode with a load balancer.
- `npm run start:multi-prod` - the same bundled in one js file.
- `npm run test:valid` - valid CRUD requests.
- `npm run test:invalid` - invalid CRUD requests.
- `npm run test:multi` - various CRUD requests to the load balancer.

An optional argument **APPLICATION_USERNAME** is acceptable `npx cross-env APPLICATION_USERNAME=your_username ts-node-dev src/index.ts`  
Below is a list of all available **methods**, _endpoints_ and ***payload types*** with request examples: *`correct`* and **`incorrect`**  
You can use command examples to speed up the review. In this case replace `<TEMPLATE>` with actual data.
If you have any questions, ask me in discord: **alexshyshko**

#### Available methods:

**PATCH**  
_api/users_  
creates 10 random users  
*`METHOD: PATCH`*  
*`PATH: localhost:4000/api/users`*  
**`METHOD: PATCH`**  
**`PATH: localhost:4000/invalid-api/invalid-users`**

**GET**  
_api/users_  
_api/users/\<USER ID>_  
requests users  
*`METHOD: GET`*  
*`PATH: localhost:4000/api/users/<USER ID>`*  
**`METHOD: GET`**  
**`PATH: localhost:4000/api/users/<INVALID USER ID>`**

**POST**  
_api/users_  
***{***  
***username: string,***  
***age: number,***  
***hobbies: string[],***  
***}***  
creates a new user  
*`METHOD: POST`*  
*`PATH: localhost:4000/api/users`*  
*`PAYLOAD:`*  
*`{`*  
*`"username": "new name",`*  
*`"age": 55,`*  
*`"hobbies": ["VALID FORMAT HOBBY: ARRAY"],`*  
*`}`*  
**`METHOD: POST`**  
**`PATH: localhost:4000/api/users`**  
**`PAYLOAD:`**  
**`{`**  
**`"username": "new name",`**  
**`"age": 55,`**  
**`"hobbies": { "INVALID FORMAT HOBBY": "OBJECT" },`**  
**`}`**

**PUT**  
_api/users/\<USER ID>_  
***{***  
***username?: string,***  
***age?: number,***  
***hobbies?: string[],***  
***}***  
edits an existing user  
*`METHOD: PUT`*  
*`PATH: localhost:4000/api/users/<USER ID>`*  
*`PAYLOAD:`*  
*`{`*  
*`"username": "VALID FORMAT NAME: STRING"`*  
*`}`*  
**`METHOD: PUT`**  
**`PATH: localhost:4000/api/users/<USER ID>`**  
**`PAYLOAD:`**  
**`{`**  
**`"username": { "INVALID FORMAT NAME": "OBJECT" }`**  
**`}`**

**DELETE**  
_api/users/\<USER ID>_  
removes an existing user
*`METHOD: DELETE`*  
*`PATH: localhost:4000/api/users/<USER ID>`*  
**`METHOD: DELETE`**  
**`PATH: localhost:4000/api/users/<INVALID USER ID>`**