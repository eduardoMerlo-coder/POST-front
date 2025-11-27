export const generateInternalBarcode = () => {
  const PREFIX = "9900";

  const randomDigits = Array.from(
    crypto.getRandomValues(new Uint8Array(8)),
    (b) => b % 10
  ).join("");

  return PREFIX + randomDigits;
};
