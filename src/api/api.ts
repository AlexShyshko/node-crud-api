import { STATUS_CODES } from 'http';
import { ApiInterface, UserToCreate, UserToUpdate, ApiResponse, ErrorResponseBody, MessageResponseBody, BodyRequestValidator, ResponseBody, UserProperties, DataBaseItem, DataBaseUpdatedItem } from '../types-and-interfaces';
import { db } from '../db';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

class Api implements ApiInterface {

    #apiPathIndex = 0;
    #listPathIndex = 1;
    #entryPathIndex = 2;
    #propertiesToCheck: UserProperties = ['username', 'age', 'hobbies'];

    public processRequest = (method: string, url: string, body: string) => {

        try {

            let result = this.#getStandardResponse(process.env.CODE_SUCCESS!, {});

            const lowMethod = method.toLowerCase();
            const parsedUrl = this.#getParsedUrl(url);
            const isNotEntry = parsedUrl[this.#entryPathIndex] === undefined;
            let errorResponseBody: ErrorResponseBody;
    
            const isWrongApi = parsedUrl[this.#apiPathIndex] !== process.env.API_BASE_PATH;
            const isWrongList = parsedUrl[this.#listPathIndex] !== process.env.API_USERS_PATH;
    
            if (isWrongApi || isWrongList) {
    
                errorResponseBody = { Error: `Wrong endpoint: ${url}. Use the correct endpoint: /${process.env.API_BASE_PATH!}/${process.env.API_USERS_PATH!}` };
                return this.#getStandardResponse(process.env.CODE_NON_EXIST!, errorResponseBody);
    
            }
    
            switch (lowMethod) {
    
                case 'get':
    
                    if (isNotEntry) {
                        result.body = db.getDb();
                    } else {
    
                        const userId = parsedUrl[this.#entryPathIndex];
                        const isValidId = uuidValidate(userId);
    
                        if (isValidId) {
    
                            const userInfo = db.getUser(userId);
    
                            if (!this.#checkIfError(userInfo)) {
                                result = this.#getStandardResponse(process.env.CODE_SUCCESS!, userInfo);
                            } else {
                                result = this.#getStandardResponse(process.env.CODE_NON_EXIST!, userInfo);
                            }
    
                        } else {
    
                            errorResponseBody = { Error: `Invalid user ID: ${userId}` };
                            result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                        }
    
                    }
    
                    break;
    
                case 'post':
    
                    if (body) {
    
                        const requestBody = JSON.parse(body) as UserToCreate;
                        const validation = this.#validatePassedBody(requestBody, lowMethod);
    
                        if (validation.isValid) {
    
                            const newUser: DataBaseItem = {
                                id: uuidv4(),
                                username: requestBody.username,
                                age: requestBody.age,
                                hobbies: requestBody.hobbies,
                            };
    
                            const newUserInfo = db.createNewUser(newUser);
                            result = this.#getStandardResponse(process.env.CODE_CREATE!, newUserInfo);
    
                        } else {
    
                            errorResponseBody = { Error: `Invalid properties: ${validation.invalidProperties.join(', ')}` };
                            result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                        }
    
                    } else {
    
                        errorResponseBody = { Error: `The request body is empty` };
                        result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                    }
    
                    break;
    
                case 'put':
    
                    if (body) {
    
                        const userId = parsedUrl[this.#entryPathIndex];
                        const isValidId = uuidValidate(userId);
    
                        if (isValidId) {
    
                            const requestBody = JSON.parse(body) as UserToUpdate;
                            const validation = this.#validatePassedBody(requestBody, lowMethod);
    
                            if (validation.isValid) {
    
                                const updatedUserInfo = db.updateUser(userId, requestBody, validation.validProperties);
    
                                if (!this.#checkIfError(updatedUserInfo)) {
                                    result = this.#getStandardResponse(process.env.CODE_SUCCESS!, updatedUserInfo);
                                } else {
                                    result = this.#getStandardResponse(process.env.CODE_NON_EXIST!, updatedUserInfo);
                                }
    
                            } else {
    
                                errorResponseBody = { Error: `Invalid properties: ${validation.invalidProperties.join(', ')}` };
                                result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                            }
    
                        } else {
    
                            errorResponseBody = { Error: `Invalid user ID: ${userId}` };
                            result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                        }
    
                    } else {
    
                        errorResponseBody = { Error: `The request body is empty` };
                        result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                    }
    
                    break;
    
                case 'delete':
    
                    const userId = parsedUrl[this.#entryPathIndex];
                    const isValidId = uuidValidate(userId);
    
                    if (isValidId) {
    
                        const deletedUserInfo = db.deleteUser(userId);
    
                        if (!this.#checkIfError(deletedUserInfo)) {
                            result = this.#getStandardResponse(process.env.CODE_DELETE!, deletedUserInfo);
                        } else {
                            result = this.#getStandardResponse(process.env.CODE_NON_EXIST!, deletedUserInfo);
                        }
    
                    } else {
    
                        errorResponseBody = { Error: `Invalid user ID: ${userId}` };
                        result = this.#getStandardResponse(process.env.CODE_INVALID!, errorResponseBody);
    
                    }
    
                    break;
    
                default:
    
                    errorResponseBody = { Error: `Unsupported method: ${method}` };
                    return result = this.#getStandardResponse(process.env.CODE_INVALID_METHOD!, errorResponseBody);
    
            }
    
            return result;

        } catch (e) {

            if (e instanceof Error) {
                return this.#getStandardResponse(process.env.CODE_SERVER_ERROR!, { Error: e.message });
            } else {
                return this.#getStandardResponse(process.env.CODE_SERVER_ERROR!, { Error: 'Unknown server error' });
            }

        }

    };

    #checkIfError = (responseToCheck: ErrorResponseBody | DataBaseItem | DataBaseUpdatedItem | MessageResponseBody | undefined): responseToCheck is ErrorResponseBody => {

        if (responseToCheck === undefined) {
            return false;
        } else {
            return (responseToCheck as ErrorResponseBody).Error !== undefined;
        }
        
    };

    #validatePassedBody = (body: UserToCreate | UserToUpdate, method: string): BodyRequestValidator => {

        const result: BodyRequestValidator = {
            isValid: false,
            atLeastOneValid: false,
            atLeastOneInvalid: false,
            validProperties: [],
            invalidProperties: [],
        };

        this.#propertiesToCheck.forEach((property) => {

            const isPresented = body[property] ?? false;
            const isProperName = ((property === 'username') && (typeof body[property] === 'string') && (body[property] !== ''));
            const isProperAge = ((property === 'age') && (typeof body[property] === 'number') && (!Number.isNaN(body[property])));
            const isProperHobbies = ((property === 'hobbies') && (Array.isArray(body[property])) && (body[property].every((hobby) => typeof hobby === 'string' &&  hobby !== '')));

            if (isPresented && (isProperName || isProperAge || isProperHobbies)) {

                result.atLeastOneValid = true;
                result.validProperties.push(property);

            } else {

                result.atLeastOneInvalid = true;
                result.invalidProperties.push(property);

            }

        });

        if ((method === 'post' && !result.atLeastOneInvalid) || (method === 'put' && result.atLeastOneValid)) {
            result.isValid = true;
        }

        return result;

    };

    #getStandardResponse = (code: string, bodyObject: ResponseBody): ApiResponse => {

        return {
            statusCode: Number(code),
            statusMessage: STATUS_CODES[code]!,
            body: bodyObject,
        };

    };

    #getParsedUrl = (url: string) => {
        
        const patternToReplace = /^\//g;
        return url.replace(patternToReplace, '').split('/');

    };

}

const API = new Api();

export { API };