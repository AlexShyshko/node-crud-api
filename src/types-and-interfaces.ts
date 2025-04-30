import { Server as NodeHttpServer } from 'http';

interface ServerUtilsInterface {
    getNewDefaultServer: () => NodeHttpServer;
}

interface UserToCreate {
    username: string,
    age: number,
    hobbies: string[],
}

interface UserToUpdate {
    username?: string,
    age?: number,
    hobbies?: string[],
}

interface DataBaseItem extends UserToCreate {
    id: string,
}

interface DataBaseUpdatedItem extends UserToUpdate {
    id: string,
}

type DataBase = Record<string, DataBaseItem>;

interface DataBaseInterface {
    getDb: () => DataBase,
    getUser: (id: string) => DataBaseItem | ErrorResponseBody,
    createNewUser: (user: DataBaseItem) => DataBaseItem,
    updateUser: (id: string, body: UserToUpdate, validProperties: UserProperties) => DataBaseItem | ErrorResponseBody,
    deleteUser: (id: string) => undefined | ErrorResponseBody,
}

interface ErrorResponseBody {
    Error: string,
}

interface MessageResponseBody {
    Message: string,
}

type ResponseBody = DataBase | DataBaseItem | object | ErrorResponseBody | MessageResponseBody | undefined;

interface ApiResponse {
    statusCode: number,
    statusMessage: string,
    body: ResponseBody,
}

type UserPropertiesKeys = keyof UserToCreate;

type UserProperties = (keyof UserToCreate)[];

interface BodyRequestValidator {
    isValid: boolean,
    atLeastOneValid: boolean,
    atLeastOneInvalid: boolean,
    validProperties: UserProperties,
    invalidProperties: UserProperties,
};

interface ApiInterface {
    processRequest: (method: string, url: string, body: string) => ApiResponse;
}

export { ServerUtilsInterface, UserToCreate, UserToUpdate, DataBaseInterface, DataBaseItem, DataBaseUpdatedItem, DataBase, ApiResponse, ApiInterface, ErrorResponseBody, MessageResponseBody, BodyRequestValidator, ResponseBody, UserProperties, UserPropertiesKeys };