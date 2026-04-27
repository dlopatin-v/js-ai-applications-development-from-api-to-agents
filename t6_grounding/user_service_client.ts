import { USER_SERVICE_ENDPOINT, UserInfo, UserSearchRequest } from "../commons";

export class UserServiceClient {
  private headers = { "Content-Type": "application/json" };
  async getAllUsers(): Promise<any> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async getUser(id: number): Promise<any> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users/${id}`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async searchUsers(params: UserSearchRequest): Promise<any> {

    const urlParameters = new URLSearchParams(params);
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users/search?${urlParameters.toString()}`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async health(): Promise<void> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/health`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}