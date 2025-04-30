import { DataBaseInterface, DataBase, DataBaseItem, UserToUpdate, UserProperties } from './types-and-interfaces';

class DB implements DataBaseInterface {

    #db: DataBase;

    constructor() {
        this.#db = {
            "5c7de414-31ff-43ea-ba91-8fcbf92441a6": {
                "id": "5c7de414-31ff-43ea-ba91-8fcbf92441a6",
                "username": "mocked_user",
                "age": 36,
                "hobbies": [
                    "DIVING",
                    "BICYCLE"
                ]
            }
        };
    };

    getDb = () => {
        return this.#db;
    };

    getUser = (id: string) => {
        return this.#db[id] ?? { Error: `ID not found: ${id}` };
    };

    createNewUser = (user: DataBaseItem) => {
        return this.#db[user.id] = user;
    };

    updateUser = (id: string, body: UserToUpdate, validProperties: UserProperties) => {

        const existingUser = this.#db[id];

        if (existingUser) {

            validProperties.forEach((property) => {

                // brilliant typescript approach ;-(
                (existingUser[property] as unknown) = (body[property] as unknown);

            });

            return existingUser;
            
            // const updatedUser: DataBaseItem = {
            //     id: existingUser.id,
            //     username: validProperties.includes('username') ? body.username! : existingUser.username,
            //     age: validProperties.includes('age') ? body.age! : existingUser.age,
            //     hobbies: validProperties.includes('hobbies') ? body.hobbies! : existingUser.hobbies,
            // };

            // return this.#db[updatedUser.id] = updatedUser;

        } else {
            return { Error: `ID not found: ${id}` };
        }

    };

    deleteUser = (id: string) => {

        const existingUser = this.#db[id];

        if (existingUser) {
            
            const remainingDb = this.#excludeKey(this.#db, id as never);
            this.#db = remainingDb.newDb;
            //const infoMessage = `User ${remainingDb.deletedProperty.username} with ID ${remainingDb.deletedProperty.id} was deleted`;
            //return { Message: infoMessage };

        } else {
            return { Error: `ID not found: ${id}` };
        }

    };

    #excludeKey<T extends object, U extends keyof unknown>(obj: T, key: U) {

        const { [key]: deletedProperty, ...newDb } = obj;

        return {
            newDb: newDb,
            deletedProperty: deletedProperty,
        };

    }

}

const db = new DB();

export { db };