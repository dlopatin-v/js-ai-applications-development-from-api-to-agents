import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { UserServiceClient } from "commons/user_service/client";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "users-management-mcp-server",
    version: "1.0.0",
  });

  const userClient = new UserServiceClient();

// ==================== EXISTING TOOLS ====================

  server.registerTool(
    "get_user_by_id",
    {
      description: "Provides full user information by user_id",
      inputSchema:
        { user_id: z.number().int().describe("The user ID to look up") },
    },
    async ({ user_id }) => {
      const result = await userClient.getUser(user_id);
      return { content: [{ type: "text", text: String(result) }] };
    }
  );

  server.registerTool(
    "delete_user",
    {
      description: "Deletes user by user_id",
      inputSchema:
        { user_id: z.number().int().describe("The user ID to delete") },
    },
    async ({ user_id }) => {
      const result = await userClient.deleteUser(user_id);
      return { content: [{ type: "text", text: String(result) }] };
    }
  );

  server.registerTool(
    "search_user",
    {
      description: "Searches for users by name, surname, email and gender",
      inputSchema: {
        name: z.string().optional().describe("First name (partial match)"),
        surname: z.string().optional().describe("Last name (partial match)"),
        email: z.string().optional().describe("Email (partial match)"),
        gender: z.string().optional().describe("Gender (male, female, other, prefer_not_to_say)"),
      },
    },
    async (args) => {
      const result = await userClient.searchUsers(args);
      return { content: [{ type: "text", text: String(result) }] };
    }
  );

  server.registerTool(
    "add_user",
    {
      description: "Adds new user into the system",
      inputSchema: {
        name: z.string().describe("First name"),
        surname: z.string().describe("Last name"),
        email: z.string().email().describe("Email address"),
        about_me: z.string().optional().describe("Biography"),
        phone: z.string().optional().describe("Phone number"),
        date_of_birth: z.string().optional().describe("Date of birth (YYYY-MM-DD)"),
        gender: z.string().optional().describe("Gender"),
        company: z.string().optional().describe("Company name"),
        salary: z.number().optional().describe("Salary"),
      },
    },
    async (args) => {
      const result = await userClient.addUser(args);
      return { content: [{ type: "text", text: String(result) }] };
    }
  );

  server.registerTool(
    "update_user",
    {
      description: "Updates user by user_id",
      inputSchema: {
        user_id: z.number().int().describe("The user ID to update"),
        name: z.string().optional().describe("First name"),
        surname: z.string().optional().describe("Last name"),
        email: z.string().email().optional().describe("Email address"),
        about_me: z.string().optional().describe("Biography"),
        phone: z.string().optional().describe("Phone number"),
        date_of_birth: z.string().optional().describe("Date of birth (YYYY-MM-DD)"),
        gender: z.string().optional().describe("Gender"),
        company: z.string().optional().describe("Company name"),
        salary: z.number().optional().describe("Salary"),
      },
    },
    async ({ user_id, ...updateData }) => {
      const result = await userClient.updateUser(user_id, updateData);
      return { content: [{ type: "text", text: String(result) }] };
    }
  );

  return server;
}