import axios from "axios";

// const base_url = "http://localhost:3001/";
const base_url = "https://html-to-pdf-server.onrender.com";
// const base_url = process.env.SERVER_URL

const instance = axios.create({
  baseURL: base_url,
});

export default instance;
