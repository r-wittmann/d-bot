exports.uint8ArrayToBinaryString = (a) => {
  return Array.from(a)
    .map(c => String.fromCharCode(c))
    .join('');
}

exports.binaryStringToUint8Array = (b) => {
  const buf = new Uint8Array(new ArrayBuffer(b.length));
  for (let i = 0; i < b.length; i++) {
    buf[i] = b.charCodeAt(i);
  }
  return buf;
}

// Trim trailing zeros, and possibly the decimal point.
exports.trimTrailingZeros = (s) => {
  s = s.replace(/0+$/, '');
  if (s.endsWith('.')) {
    s = s.substring(0, s.length - 1);
  }
  return s;
}
