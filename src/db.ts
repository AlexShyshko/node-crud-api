import { DataBaseInterface, DataBase, DataBaseItem, UserToUpdate, UserProperties } from './types-and-interfaces';
import { v4 as uuidv4 } from 'uuid';

class DB implements DataBaseInterface {

    #db: DataBase;

    constructor() {
        this.#db = {
            /*"5c7de414-31ff-43ea-ba91-8fcbf92441a6": {
                "id": "5c7de414-31ff-43ea-ba91-8fcbf92441a6",
                "username": "mocked_user",
                "age": 36,
                "hobbies": [
                    "DIVING",
                    "BICYCLE"
                ]
            }*/
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
            const infoMessage = `User ${remainingDb.deletedProperty.username} with ID ${remainingDb.deletedProperty.id} was deleted`;
            return { Message: infoMessage };

        } else {
            return { Error: `ID not found: ${id}` };
        }

    };

    patchUsers = () => {

        const newUsers: DataBase = {};
        const pirates = getPirates();
        const availableHobbies = getHobbies();
        let pirateHobbies: string[] = [];

        for (let i = 0; i < 10; i++) {
            
            pirateHobbies = [];
            pirateHobbies.push(availableHobbies[getNumber(0, 9)]);
            pirateHobbies.push(availableHobbies[getNumber(10, 19)]);
            pirateHobbies.push(availableHobbies[getNumber(20, 29)]);

            const newUser: DataBaseItem = {
                id: uuidv4(),
                username: pirates[i],
                age: getNumber(20, 50),
                hobbies: pirateHobbies,
            };

            this.createNewUser(newUser);
            newUsers[newUser.id] = newUser;

        }

        return newUsers;

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

function getPirates() {
    return [
        'Captain Jack Sparrow',
        'Hector Barbossa',
        'Davy Jones',
        'Will Turner',
        'Elizabeth Swann',
        'Blackbeard',
        'Joshamee Gibbs',
        'Bootstrap Bill Turner',
        'Angelica',
        'James Norrington',
    ];
};

function getHobbies() {
    return [
        'Searching for the Black Pearl',
        'Escaping from the authorities',
        'Sword fighting',
        'Sailing the seven seas',
        'Teaching pirate lingo',
        "Writing in the captain's log",
        'Reading maps',
        'Navigating by the stars',
        'Exploring uncharted islands',
        'Drinking rum',
        'Battling sea monsters',
        'Hiding treasure chests',
        'Making pirate flags',
        'Polishing cannonballs',
        'Repairing sails',
        'Carving wooden legs',
        'Diving for pearls',
        'Digging for buried treasure',
        'Swabbing the deck',
        'Treasure hunting',
        'Fishing for sharks',
        'Trading stolen goods',
        'Searching for the Fountain of Youth',
        'Telling tall tales',
        'Training parrots',
        'Collecting doubloons',
        'Playing pirate shanties',
        'Raiding coastal villages',
        'Cooking fish stew',
        'Hosting pirate parties',
    ];
}

function getNumber(min: number, max: number): number {
    if (min > max) {
        return Math.floor(Math.random() * (min - max + 1)) + max;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { db };