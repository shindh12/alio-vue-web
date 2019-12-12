let StringUtil = {};
StringUtil.isEmpty = (object) => {
    return !object; // means `object === undefined || object === null || object.length === 0`
};
StringUtil.equalsIgnoreCase = (object1, object2) => {
    if (object1 === undefined || object2 === undefined) {
        return false;
    }
    return object1.toUpperCase() === object2.toUpperCase();
};
StringUtil.reverse = (object) => {
    return object && object.split('').reverse().join('');
};
StringUtil.isValidLengthFromTo = (from, to, object) => {
    return !(StringUtil.isEmpty(object) || (object.length < from || object.length > to));
};
export default StringUtil;
