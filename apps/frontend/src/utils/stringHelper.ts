export const capitalizeSmart = (text: string | number) => {
  if (text === null || text === undefined) return "";

  return String(text) // convert to string
    .split(" ")
    .map((word) => {
      if (word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
