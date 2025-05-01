import { Transform } from 'stream';

interface MessageColorizerInterface {

    ESCAPE_CHARACTER_DEFAULT: string;
    TRANSFORM_CHUNK_COLOR: string;

    colorize: (message: string | object, attribute: string) => string,
    mapAttribute: (attribute: string) => string,
    escapeCharacterWrapper: (code: string) => string;
    isObject: (variable: string | object) => boolean;
    objectNormalizer: (object: object) => string;
    setTransformChunkColor: (color: string) => void;
    getTransformStreamColorizer: (color: string) => Transform;

};

class MessageColorizer implements MessageColorizerInterface {

    ESCAPE_CHARACTER_DEFAULT;
    TRANSFORM_CHUNK_COLOR;

    constructor() {

        this.ESCAPE_CHARACTER_DEFAULT = this.escapeCharacterWrapper('0');
        this.TRANSFORM_CHUNK_COLOR = 'white';
        
    }

    colorize = (message: string | object, attribute: string) => {

        const colorCode = this.mapAttribute(attribute);
        const escapeCharacter = this.escapeCharacterWrapper(colorCode);
        const stringifiedObject = this.isObject(message) ? this.objectNormalizer(message) : message;
        const coloredString = `${escapeCharacter}${stringifiedObject}${this.ESCAPE_CHARACTER_DEFAULT}`;
        return coloredString;

    };

    mapAttribute = (attribute: string) => {

        let colorCode;

        switch (attribute) {

            case 'black':
                colorCode = '30';
                break;
            case 'red':
                colorCode = '31';
                break;
            case 'green':
                colorCode = '32';
                break;
            case 'yellow':
                colorCode = '33';
                break;
            case 'blue':
                colorCode = '34';
                break;
            case 'magenta':
                colorCode = '35';
                break;
            case 'cyan':
                colorCode = '36';
                break;
            case 'white':
                colorCode = '37';
                break;
            case 'black_bgc':
                colorCode = '40';
                break;
            case 'red_bgc':
                colorCode = '41';
                break;
            case 'green_bgc':
                colorCode = '42';
                break;
            case 'yellow_bgc':
                colorCode = '43';
                break;
            case 'blue_bgc':
                colorCode = '44';
                break;
            case 'magenta_bgc':
                colorCode = '45';
                break;
            case 'cyan_bgc':
                colorCode = '46';
                break;
            case 'white_bgc':
                colorCode = '47';
                break;
            default:
                colorCode = '0';

        }

        return colorCode;

    };

    escapeCharacterWrapper = (code: string) => {
        return `\x1b[${code}m`;
    };

    
    isObject = (variable: string | object) => {
        return variable !== null && typeof variable === 'object';
    };

    objectNormalizer = (object: object) => {
        return JSON.stringify(object, (key, value) => {
            return value === undefined ? "undefined" : value as string;
        }, '\t');
    };

    setTransformChunkColor = (color: string) => {
        this.TRANSFORM_CHUNK_COLOR = color;
    };

    getTransformStreamColorizer = (color: string = this.TRANSFORM_CHUNK_COLOR) => {

        return new Transform({
            transform: (chunk, encoding, callback) => {

                try {

                    const stringifiedChunk = String(chunk);

                    const asciiChars = stringifiedChunk.match(/[\x20-\x7E]/g);
                    const newLineChars = /(\r\n|\n|\r)/g;
                    const is80PercentAscii = asciiChars && asciiChars.length / stringifiedChunk.replace(newLineChars, '').length > 0.8;
                    const asciiAlert = this.colorize('The data contains less than 80% ASCII characters. It seems that this is not a text data. But the transform stream will continue anyway.\n', 'red');
                    
                    if (!is80PercentAscii) {
                        process.stdout.write(asciiAlert);
                    }

                    callback(null, this.colorize(stringifiedChunk, color));

                } catch(e) {
                    throw e;
                }
                
            },
        });

    };

}

const mc = new MessageColorizer();

export { mc };