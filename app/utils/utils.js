
const BN = require('bn.js');
const numberToBN = require('number-to-bn');

const padLeft = (number, length) => {
    var str = String(number);
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

const padRight = (number, length) => {
    var str = String(number);
    while (str.length < length) {
        str += '0';
    }
    return str;
};

const fromTokenDecimals = (value, decimals) => {
    value = numberToBN(value);
    const pow = new BN(10, 10).pow(numberToBN(decimals));
    const int = value.div(pow);
    const dec = padLeft(value.mod(pow).toString(10), decimals).replace(/0+$/, '');
    return int.toString(10) + (dec !== "" ? "." + dec : "");
};

const toTokenDecimals = (value, decimals) => {
    value = value.toString().split(".");
    const pow = new BN(10, 10).pow(numberToBN(decimals));
    const int = numberToBN(value[0]).mul(pow);
    const dec = numberToBN(padRight(value.length > 1 ? value[1] : 0, decimals));
    if(dec.toString(10).length > pow.toString(10).length) throw new Error("Too many decimal places");
    return int.add(dec).toString(10);
};

module.exports = {
    fromTokenDecimals,
    toTokenDecimals
};

