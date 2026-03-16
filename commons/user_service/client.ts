import { USER_SERVICE_ENDPOINT } from "../constants";
import { UserSearchRequest, UserCreate, UserUpdate } from "./user_info";

const USER_SERVICE_PATH = `${USER_SERVICE_ENDPOINT}/v1/users`;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};

class UserServiceClient {

  private userToString = (user: any): string => {
    const lines = Object.keys(user).map((key) => `  ${key}: ${user[key]}`);
    return '```\n' + lines.join('\n') + '\n```\n';
  }

  private usersToString = (users: Array<any>): string => {
    return users.map(this.userToString).join("") + "\n";
  }

  getUser = async (userId: string): Promise<string> => {
    const response = await fetch(`${USER_SERVICE_PATH}/${userId}`, {headers: DEFAULT_HEADERS})

    if (response.status === 200) {
      const result = await response.json();
      return this.userToString(result);
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}}`);

  }

  searchUsers = async (partialUser: UserSearchRequest): Promise<string> => {
    const params = new URLSearchParams(partialUser as Record<string, string>);
    const response = await fetch(`${USER_SERVICE_PATH}/search?${params.toString()}`, {headers: DEFAULT_HEADERS})

    if (response.status === 200) {
      const result = await response.json();
      console.info(`Get: ${result.length} users successfuly`);
      return this.usersToString(result);
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}}`);
  }

  addUser = async (user: UserCreate): Promise<string> => {
    const response = await fetch(`${USER_SERVICE_PATH}`, {
      headers: DEFAULT_HEADERS,
      method: "POST",
      body: JSON.stringify(user)
    });

    if (response.status === 200) {
      await response.json();

      return `User successfully added: ${response.text}`;
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}}`);
  }
  updateUser = async (userId: string, user: UserUpdate): Promise<string> => {
    const response = await fetch(`${USER_SERVICE_PATH}/${userId}`, {
      headers: DEFAULT_HEADERS,
      method: "PUT",
      body: JSON.stringify(user)
    });

    if (response.status === 200) {
      await response.json();

      return `User successfully updated: ${response.text}`;
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}}`);
  }
  deleteUser = async (userId: string): Promise<string> => {
    const response = await fetch(`${USER_SERVICE_PATH}/${userId}`, {headers: DEFAULT_HEADERS, method: "DELETE"});

    if (response.status === 200) {
      await response.json();

      console.info("User successfully deleted");

      return "User successfully deleted";
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}}`);
  }

}

export default new UserServiceClient();