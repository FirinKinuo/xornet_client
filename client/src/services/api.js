import axios from "axios";
import eventHandler from "./eventHandler";

let ROOT_PATH = "https://backend.xornet.cloud";

/**
 * @author Geoxor & Niko Huuskonen

 * Main API class that interfaces with the backend
 * It contains functions and debugging logs to easily
 * handle requests with the backend
 *
 * Note: The data from here can be taken to create API docs in the future
 * @private
 */

class API {
  /**
   * Custom log function with API suffix
   * @param {String} method The API endpoint
   * @param {String} [messages] Optional messages
   * @private
   */
  log(method, ...messages) {
    // prettier-ignore
    console.log(
      `%c[API]` + 
      `%c [${method}]`, 
      "color: black; background-color: #aa66ff; padding: 2px; border-radius: 4px; font-weight: bold;", 
      "color: #cba1ff;", 
      ...messages
    );
  }

  /**
   * Custom log for errors with API suffix
   * @param {String} method The API endpoint
   * @param {String} [messages] Optional messages
   * @private
   */
  error(method, ...messages) {
    eventHandler.emit("error", { method, messages });

    // prettier-ignore
    console.log(
      `%c[API]` + 
      `%c [${method}]` + 
      `%c ${messages}`, 
      "color: black; background-color: #ff2424; padding: 2px; border-radius: 4px; font-weight: bold;", 
      "color: #ff2424;", 
      "color: #ff6363;", 
    );
  }

  /**
   * Creates a pretty log for the API responses
   * @param {String} method The API endpoint
   * @param {String} [messages] Optional messages
   * @private
   */
  logResponse(method, response) {
    if (!response) return;
    if (response.data?.message) this.log(method, response.data?.message);
    else if (response?.data) this.log(method, response?.data);
    else this.log(method, response);
  }

  /**
   * Creates a pretty log for the API errors
   * @param {String} method The API endpoint
   * @param {String} [messages] Optional messages
   * @private
   */
  logError(method, response) {
    if (!response) return;
    if (response.data?.message) this.error(method, response.data?.message);
    else if (response?.data) this.error(method, response?.data);
    else this.error(method, response);
  }

  /**
   * Creates a backend URL with the provided paramaters
   * @private
   * @param {String} route The main route
   * @returns {String} https://backend.xornet.cloud/profile
   * @example constructEndpoint('profile')
   */
  constructEndpoint(route) {
    return `${ROOT_PATH}/${route}`;
  }

  /**
   * Gets the geolocation of the client
   * @private
   * @returns {object} object
   */
  async getGeolocation() {
    const location = (await axios.get(`https://ipwhois.app/json/`)).data;
    const geolocation = {
      location: location.country,
      countryCode: location.country_code,
      isp: location.isp
    };
    return geolocation;
  }

  /**
   * Creates a new request to the backend
   * @param {string} method The type of HTTP method e.g. GET, POST, PATCH etc
   * @param {string} route The route you wanna make a request to e.g. channels/pin
   * @param {object} headers An optional headers object to send to the route
   * @param {object} body An optional body object to send to the route
   * @example 
   * const response = await super.request("get", `datacenter/${datacenter}`);
   * const response = await super.request("put", `datacenter/${datacenter}/user/${user.toLowerCase()}`);
   * const response = await super.request("post", `datacenter/new`, { "Content-Type": "application/json" }, form);
   * const response = await super.request("delete", `datacenter/${datacenter}/user/${user.toLowerCase()}`);
   * @returns {Promise<void>} A promise of the response
   * @author Geoxor
   */
  async request(method, route, headers, body) {
    if (method === "get" || method === "delete") {
      var response = await axios[method](
        this.constructEndpoint(route),
        body || {
          withCredentials: true,
          headers
        }
      ).catch(error => this.logError(`${method.toUpperCase()} ${route}`, error));
    } else {
      var response = await axios[method](this.constructEndpoint(route), body || undefined, {
        withCredentials: true,
        headers
      }).catch(error => this.logError(`${method.toUpperCase()} ${route}`, error));
    }

    this.logResponse(`${method.toUpperCase()} ${route}`, response);
    return response;
  }
}

/**
 * Contains functions for the datacenter routes in the backends
 * @author Geoxor
 */
class Datacenter extends API {
  constructor() {
    super();
    super.log("Initialized datacenter class");
  }

  /**
   * Get all of the user's datacenters
   * @returns {object}
   */
  async fetchAll() {
    return (await super.request("get", `datacenter/all`)).data;
  }

  /**
   * Get the total amount of machines in a given datacenter
   * @param {string} datacenter the datacenter's UUID
   * @returns {object} containing the data
   */
  async fetchMachineCount(datacenter) {
    if (datacenter) return (await super.request("get", `datacenter/${datacenter}/machine/count`)).data;
  }

  /**
   * Gets all details of a datacenter
   * @param {string} datacenter the datacenter's UUID
   * @returns {object} containing the data
   */
  async fetch(datacenter) {
    return (await super.request("get", `datacenter/${datacenter}`)).data;
  }

  /**
   * Removes a user from a datacenter
   * @param {string} datacenter the datacenter's UUID
   * @param {string} user the user's UUID
   * @returns {object} the updated datacenter without the user
   */
  async revokeMember(datacenter, user) {
    return (await super.request("delete", `datacenter/${datacenter}/user/${user.toLowerCase()}`)).data;
  }

  /**
   * Adds a user to a datacenter
   * @param {string} datacenter the datacenter's UUID
   * @param {string} user the user's UUID
   * @returns {object} the updated datacenter with the added user
   */
  async addMember(datacenter, user) {
    return (await super.request("put", `datacenter/${datacenter}/user/${user.toLowerCase()}`)).data;
  }

  /**
   * Adds a machine to a datacenter
   * @param {string} datacenter the datacenter's UUID
   * @param {string} machine the machine's UUID
   * @returns {object} the updated datacenter with the added machine
   */
  async addMachine(datacenter, machine) {
    return (await super.request("put", `datacenter/${datacenter}/machine/${machine.toLowerCase()}`)).data;
  }

  /**
   * Creates a new datacenter
   * @param {object} form a form containing the name of the datacenter
   * @returns {object} the new datacenter
   */
  async add(form) {
    return await super.request("post", `datacenter/new`, { "Content-Type": "application/json" }, form);
  }

  /**
   * Post signup credentials into backend and returns the result of signup process
   * @param {string} datacenter The name of the datacenter
   * @param {Blob} logo image Blob, which contains image class from the refs
   * @param {Blob} banner image Blob, which contains image class from the refs
   */
  async save(datacenter, logo, banner) {
    let formData = new FormData();
    formData.append("logo", logo);
    formData.append("banner", banner);

    datacenter = datacenter.trim();

    return super.request("patch", `datacenter/${datacenter}`, { "Content-Type": "multipart/form-data" }, formData);
  }
}

class User extends API {
  constructor() {
    super();
    super.log("Initialized user class");
  }

  /**
   * Post login credentials into backend and returns the login token on successful login
   * @param {object} json Json object, which contains login credentials
   * @returns {number} of the response's status, e.g. 200 if successful
   */
  async login(json) {
    return new Promise(async (resolve, reject) => {
      try {
        const loginForm = { geolocation: await this.getGeolocation(), ...JSON.parse(json) };
        const response = await super.request("post", "login", { "Content-Type": "application/json" }, loginForm);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", loginForm.username);
        localStorage.setItem("me", JSON.stringify(response.data.me));
        super.log("Logged in successfully");
        resolve(response.status);
      } catch (error) {
        super.log(error);
        reject(error.status);
      }
    });
  }

  /**
   * Post signup credentials into backend and returns the result of signup process
   * @param {object} json Json object, which contains signup credentials
   * @returns {AxiosResponse} of the request
   */
  async signup(json) {
    const signupForm = { geolocation: await this.getGeolocation(), ...json };

    // This doesn't return just the .data on purpose unlike the others because
    // i needed the status codes to decide wether the frontend will
    // redirect to logging in or not if the request succeeded
    return await super.request("post", "signup", { "Content-Type": "application/json" }, signupForm);
  }

  /**
   * Gets the user object of a user
   * @param {string} username the user's UUID to get
   * @returns {object} of the user's profile
   */
  async fetchProfile(username) {
    return (await super.request("get", `profile/${username}`)).data;
  }

  /**
   * Gets the logged in user's object
   * @returns {object} of the user's profile
   */
  async fetchMe() {
    return (await super.request("get", `profile/${localStorage.getItem("username")}`)).data;
  }

  /**
   * Returns the users logs, if admin they have access to admin logs for the backend
   * @param {string} machineUUID The uuid of a specific machine you want to get logs for
   * @returns {object} of the logs
   */
  async fetchLogs(machineUUID) {
    return machineUUID ? (await super.request("get", `logs/${machineUUID}`)).data : (await super.request("get", `logs`)).data;
  }

  /**
   * Post signup credentials into backend and returns the result of signup process
   * @param {object} profile profile object, which contains new desired user credentials
   * @param {object} profileImage image object, which contains image class from the refs
   * @param {object} profileBanner image object, which contains image class from the refs
   */
  async save(profile, profileImage, profileBanner) {
    let formData = new FormData();

    const { bio, socials, badges, email } = profile;

    formData.append("json", JSON.stringify({ bio, socials, badges, email }));
    formData.append("image", profileImage);
    formData.append("banner", profileBanner);

    return (await super.request("patch", "profile", { "Content-Type": "multipart/form-data" }, formData)).data;
  }

  /**
   * Puts a new machine to the users database
   * @param {string} machineUUID The machine's uuid that you want to add
   */
  async addMachine(machineUUID) {
    return (await super.request("put", "profile/machine", { "Content-Type": "application/json" }, { machine: machineUUID }))
      .data;
  }

  /**
   * Searches the database for users
   * @param {string} user Either a Username or a UUID of a user
   */
  async search(user) {
    return (await super.request("get", `/search/user/${user}`)).data;
  }
}

class Machine extends API {
  constructor() {
    super();
    super.log("Initialized machine class");
  }

  async getNetwork(machineUUID) {
    return (await super.request("get", `stats/network/${machineUUID}`)).data;
  }

  async getMachineSpecs(machineUUID) {
    return (await super.request("get", `stats/machine/${machineUUID}`)).data;
  }

  async getProcesses(machineUUID) {
    return (await super.request("get", `stats/processes/${machineUUID}`)).data;
  }
}

const api = {
  user: new User(),
  machine: new Machine(),
  datacenters: new Datacenter()
};

console.log(
  `%c[API]` + `%c [Class Loaded]`,
  "color: black; background-color: #aa66ff; padding: 2px; border-radius: 4px; font-weight: bold;",
  "color: #cba1ff;"
);

export default api;
