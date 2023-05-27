import axios from "axios";

const base_url = "http://localhost:3001";
// const base_url = "";

const instance = axios.create({
  baseURL: base_url,
});

export default instance;
