import BigNumber from "bignumber.js";
import Numeral from 'numeral'
import copy2Clipboard from "copy-to-clipboard"

export const copyTxt2Clipboard = (text: string) => {
  if (copy2Clipboard(text)) {
    console.log('Copied');
  } else {
    console.error('Failed to copy');
  }
};

export const handleTime = (time: string | number) => {
  const timeNum = Number(time);
  const day = Math.floor(timeNum / 86400);
  const hour = Math.ceil((timeNum - day * 86400) / 3600);
  return `${day > 0 ? day + 'd ': ''}${hour}h`;
}

export const handleTimeThMaxPer = (time: string | number, isLower?: boolean) => {
  const timeNum = Number(time)
  const day = Math.floor(timeNum / 86400);
  let str = '';
  if (day >= 365) {
    const year = Math.floor(day / 365)
    str =  `${year} Year${year > 1 ? 's' : ''}`
  } else if (day >= 30) {
    const month = Math.floor(day / 30);
    str =  `${month} Month${month > 1 ? 's' : ''}`
  } else if (day >= 7) {
    const week = Math.floor(day / 7);
    str =  `${week} Day${week > 1 ? 's' : ''}`
  } else if (day >= 1) {
    str =  `${day} Day${day > 1 ? 's' : ''}`
  } else {
    const hour = Math.floor(timeNum / 3600);
    str =  `${hour} Hour${hour > 1 ? 's' : ''}`
  }
  if (isLower) {
    return str.toLocaleLowerCase();
  }
  return str;
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

export function randomCssGradient() {
  const c1 = randomHex();
  const c2 = randomHex();

  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}


export function randomCssGradient2(addr: string | undefined) {
  if (!addr) return randomCssGradient();
  const len = addr.length;
  const c1 = `#${String(addr).slice(len - 6, len)}`;
  const c2 = `#${String(addr).slice(2, 8)}`;

  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

export const checkDefaultNum = (account: string | number | bigint) => {
  if (['-', 'N/A'].includes(String(account))) {
    return true;
  } else {
    return false;
  }
}

export const removeExtraZero = (str: string): string => {
  if (checkDefaultNum(str)) return str;
  let decimalPlace = String(parseFloat('.' + str.split('.')[1]))
  decimalPlace = new BigNumber(decimalPlace).toString(10)
  if (isNaN(Number(decimalPlace))) return str
  return Number(decimalPlace) === 0
    ? str.split('.')[0]
    : str.split('.')[0] + '.' + decimalPlace.split('.')[1]
}

export const formatValue = (
  value: string | bigint | number | undefined,
  decimals: number | string = 18,
): string => {
  if (!value) {
    return '0'
  }
  if (checkDefaultNum(value)) {
    return String(value);
  }
  const formatNum = new BigNumber(value)
    .dividedBy(Math.pow(10, +decimals))
    .toString(10)
  return removeExtraZero(Numeral(formatNum).format('0,0'))
}

export function formatBalance(
  balance: string | number | bigint,
  decimal: number | string = 18,
): string {
  return new BigNumber(balance).dividedBy(Math.pow(10, +decimal)).toString(10)
}

export function convertBigIntToNumber(value: any): any {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map(convertBigIntToNumber);
  }
  if (typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertBigIntToNumber(v);
    }
    return out;
  }
  return value;
}

export function convertArrayItemsBigIntToNumber(arr: Array<any>) {
  if (!Array.isArray(arr)) throw new TypeError('Expected an array');
  return arr.map(item => convertBigIntToNumber(item));
}

export function isNumber(val: any) {
  const regPos = /^\d+(\.\d+)?$/
  const regNeg =
    /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
  return !!(regPos.test(val) || regNeg.test(val))
}

export const clipString = (str: string, preLen: number, sufLen: number) => {
  if (
    preLen < 1 ||
    sufLen < 1
  )
    return str;
  if (str.length <= preLen + sufLen) return str;
  let text = '';
  text = str.substr(0, preLen) + '...' + str.substr(-sufLen);
  return text;
};