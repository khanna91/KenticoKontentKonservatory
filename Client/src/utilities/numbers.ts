export const toRounded = (value: number, decimals: number = 0) =>
  Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);
