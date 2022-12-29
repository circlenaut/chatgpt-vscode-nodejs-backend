export const toBoolean = (str: string) => {
    if (str === 'true') {
        return true;
    }
    if (str === 'false') {
        return false;
    }
    throw new Error('Invalid boolean string');
};