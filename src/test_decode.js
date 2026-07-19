const { bech32 } = require('bech32');

const injectiveAddress = "inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx";
try {
  const decoded = bech32.decode(injectiveAddress);
  const bytes = bech32.fromWords(decoded.words);
  console.log("Bech32 decoded prefix:", decoded.prefix);
  console.log("Bech32 decoded bytes count:", bytes.length);
  console.log("Bech32 decoded hex:", Buffer.from(bytes).toString('hex'));
} catch (e) {
  console.error("Failed to decode address:", e);
}
