function unavailable(method) {
  return () => {
    throw new Error(`${method} is not available in the browser bundle.`);
  };
}

const promises = {
  readFile: unavailable("fs.promises.readFile"),
  writeFile: unavailable("fs.promises.writeFile"),
};

const fs = {
  promises,
  readFileSync: unavailable("fs.readFileSync"),
  writeFileSync: unavailable("fs.writeFileSync"),
};

export { promises };
export default fs;
