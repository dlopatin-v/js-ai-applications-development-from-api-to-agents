import * as fs from "fs";
import * as path from "path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { UserServiceClient, userSearchSchema } from "../../commons";

const USER_SEARCH_ASSISTANT_PROMPT = `
You are helping users search through a dynamic user database. The database contains 
realistic synthetic user profiles with the following searchable fields:

## Available Search Parameters
- **name**: First name (partial matching, case-insensitive)
- **surname**: Last name (partial matching, case-insensitive)  
- **email**: Email address (partial matching, case-insensitive)
- **gender**: Exact match (male, female, other, prefer_not_to_say)

## Search Strategy Guidance

### For Name Searches
- Use partial names: "john" finds John, Johnny, Johnson, etc.
- Try common variations: "mike" vs "michael", "liz" vs "elizabeth"
- Consider cultural name variations

### For Email Searches  
- Search by domain: "gmail" for all Gmail users
- Search by name patterns: "john" for emails containing john
- Use company names to find business emails

### For Demographic Analysis
- Combine gender with other criteria for targeted searches
- Use broad searches first, then narrow down

### Effective Search Combinations
- Name + Gender: Find specific demographic segments
- Email domain + Surname: Find business contacts
- Partial names: Cast wider nets for common names

## Example Search Patterns
\`\`\`
"Find all Johns" → name="john"
"Gmail users named Smith" → email="gmail" + surname="smith"  
"Female users with company emails" → gender="female" + email="company"
"Users with Johnson surname" → surname="johnson"
\`\`\`

## Tips for Better Results
1. Start broad, then narrow down
2. Try variations of names (John vs Johnny)
3. Use partial matches creatively
4. Combine multiple criteria for precision
5. Remember searches are case-insensitive

When helping users search, suggest multiple search strategies and explain 
why certain approaches might be more effective for their goals.
`;

const USER_PROFILE_CREATION_PROMPT = `
You are helping create realistic user profiles for the system. Follow these guidelines 
to ensure data consistency and realism.

## Required Fields
- **name**: 2-50 characters, letters only, culturally appropriate
- **surname**: 2-50 characters, letters only  
- **email**: Valid format, must be unique in system
- **about_me**: Rich, realistic biography (see guidelines below)

## Optional Fields Best Practices
- **phone**: Use E.164 format (+1234567890) when possible
- **date_of_birth**: YYYY-MM-DD format, realistic ages (18-80)
- **gender**: Use standard values (male, female, other, prefer_not_to_say)
- **company**: Real-sounding company names
- **salary**: $30,000-$200,000 range for employed individuals

## Address Guidelines
Provide complete, realistic addresses:
- **country**: Full country names
- **city**: Actual city names  
- **street**: Realistic street addresses
- **flat_house**: Apartment/unit format (Apt 123, Unit 5B, Suite 200)

## Credit Card Guidelines  
Generate realistic but non-functional card data:
- **num**: 16 digits formatted as XXXX-XXXX-XXXX-XXXX
- **cvv**: 3 digits (000-999)
- **exp_date**: MM/YYYY format, future dates only

## Biography Creation ("about_me")
Create engaging, realistic biographies that include:

### Personality Elements
- 1-3 personality traits (curious, adventurous, analytical, etc.)
- Authentic voice and writing style
- Cultural and demographic appropriateness

### Interests & Hobbies  
- 2-4 specific hobbies or activities
- 1-3 broader interests or passion areas
- 1-2 life goals or aspirations

### Biography Templates
Use varied narrative structures:
- "I'm a [trait] person who loves [hobbies]..."
- "When I'm not working, you can find me [activity]..."  
- "Life is all about balance for me. I enjoy [interests]..."
- "As someone who's [trait], I find great joy in [hobby]..."

## Data Validation Reminders
- Email uniqueness is enforced (check existing users)
- Phone numbers should follow consistent formatting
- Date formats must be exact (YYYY-MM-DD)
- Credit card expiration dates must be in the future
- Salary values should be realistic for the demographic

## Cultural Sensitivity
- Match names to appropriate cultural backgrounds
- Consider regional variations in address formats
- Use realistic company names for the user's location
- Ensure hobbies and interests are culturally appropriate

When creating profiles, aim for diversity in:
- Geographic representation
- Age distribution  
- Interest variety
- Socioeconomic backgrounds
- Cultural backgrounds`;

export function createServer(): McpServer {
// TODO:
// 1. Create instance of McpServer with:
//       - name: "users-management-mcp-server"
//       - version: "1.0.0"
// 2. Create UserServiceClient

// ==================== TOOLS ====================
// TODO:
// You need to add all the tools here using server.registerTool().
// https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#tools
// ---
// Tools:
// 1. `get_user_by_id`:
//       - Description: "Provides full user information by user_id"
//       - inputSchema: { user_id: z.number().int().describe("The user ID to look up") }
//       - Handler: call userClient.getUser(user_id) and return { content: [{ type: "text", text: String(result) }] }
// 2. `delete_user`:
//       - Description: "Deletes user by user_id"
//       - inputSchema: { user_id: z.number().int().describe("The user ID to delete") }
//       - Handler: call userClient.deleteUser(user_id) and return { content: [{ type: "text", text: String(result) }] }
// 3. `search_user`:
//       - Description: "Searches for users by name, surname, email and gender"
//       - inputSchema: use userSearchSchema.shape
//       - Handler: call userClient.searchUsers(args) and return { content: [{ type: "text", text: String(result) }] }
// 4. `add_user`:
//       - Description: "Adds new user into the system"
//       - inputSchema: name, surname, email (required); about_me, phone, date_of_birth, gender, company, salary (optional)
//       - Handler: call userClient.addUser(args) and return { content: [{ type: "text", text: String(result) }] }
// 5. `update_user`:
//       - Description: "Updates user by user_id"
//       - inputSchema: user_id (required int) plus the same optional fields as add_user
//       - Handler: destructure user_id from args, call userClient.updateUser(user_id, updateData)
//                  and return { content: [{ type: "text", text: String(result) }] }

// ==================== MCP RESOURCES ====================

// TODO: Register a resource that provides the flow diagram image.
//       Provides the Users Management Service flow diagram as a PNG image — useful for showing
//       that MCP servers can expose static resources.
//       https://modelcontextprotocol.io/docs/concepts/resources
//       https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#resources
//       ---
//       Mark with server.registerResource():
//         - name: "flow-diagram"
//         - URI: "users-management://flow-diagram"
//         - metadata: { mimeType: "image/png", description: "The Users Management Service flow diagram as PNG image" }
async function getFlowDiagram() {
  const imagePath = path.join(__dirname, "..", "flow.png");

  if (!fs.existsSync(imagePath)) {
    throw new Error("flow.png not found");
  }

  const imageBytes = fs.readFileSync(imagePath);
  return {
    contents: [
      {
        uri: "users-management://flow-diagram",
        mimeType: "image/png",
        blob: imageBytes.toString("base64"),
      },
    ],
  };
}

// ==================== MCP PROMPTS ====================

// TODO 4: Register the "user_search_assistant_prompt" prompt using server.registerPrompt()
//  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#prompts
//   Step 1: Call server.registerPrompt() with:
//           - prompt name: "user_search_assistant_prompt"
//           - config object: { description: "Helps users formulate effective search queries" }
//           - async handler returning: { messages: [{ role: "user", content: { type: "text", text: USER_SEARCH_ASSISTANT_PROMPT } }] }

// TODO 5: Register the "user_profile_creation_prompt" prompt using server.registerPrompt()
//   Step 1: Call server.registerPrompt() with:
//           - prompt name: "user_profile_creation_prompt"
//           - config object: { description: "Guides creation of realistic user profiles" }
//           - async handler returning: { messages: [{ role: "user", content: { type: "text", text: USER_PROFILE_CREATION_PROMPT } }] }

  throw new Error('Not implemented');
}
