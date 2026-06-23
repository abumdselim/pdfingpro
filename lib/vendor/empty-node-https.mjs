function request() {
  throw new Error("HTTPS requests are not available in the browser bundle.");
}

const https = { request };

export default https;
export { request };
