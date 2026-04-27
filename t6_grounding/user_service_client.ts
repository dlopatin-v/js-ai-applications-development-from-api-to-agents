import { USER_SERVICE_ENDPOINT, UserInfo, UserSearchRequest } from "../commons/index.js";

export class UserServiceClient {
  private headers = { "Content-Type": "application/json" };
  async getAllUsers(): Promise<UserInfo[]> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json() as UserInfo[];
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async getUser(id: number): Promise<UserInfo> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users/${id}`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json() as UserInfo;
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async searchUsers(params: UserSearchRequest): Promise<UserInfo[]> {

    const urlParameters = new URLSearchParams(params);
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/v1/users/search?${urlParameters.toString()}`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json() as UserInfo[];
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  async health(): Promise<{ status: string, timestamp: string }> {
    const response = await fetch(`${USER_SERVICE_ENDPOINT}/health`, { headers: this.headers });

    if (response.status === 200) {
      return await response.json() as unknown as { status: string, timestamp: string };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}