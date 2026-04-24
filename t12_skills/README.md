# Agent Skills

In this task, you will explore **Agent Skills** — a way to extend AI agents with reusable, self-contained capabilities
packaged as files (instructions, scripts, references). You will implement skill-based agents for both Anthropic and
OpenAI,
and then build a **custom agent** that loads and executes skills entirely on your own infrastructure.

[Agent skills specification](https://agentskills.io/specification)

**Run from the repository root:**

| Agent | Command |
|---|---|
| Anthropic | `npm run t12:anthropic` |
| OpenAI | `npm run t12:openai` |
| Custom (self-hosted) | `npm run t12:custom` |

---

### If the task in the main branch is hard for you, switch to the `main-detailed` branch

---

## Tasks

### Prepare Skills

**It is okay to use AI to prepare skills based on TODO provided in there.**

Open [_skills](_skills) and implement all `TODO` items:
   - [_skills/calculator/SKILL.md](_skills/calculator/SKILL.md), script is already implemented
   - [_skills/style-guide](_skills/style-guide):
     - [_skills/style-guide/SKILL.md](_skills/style-guide/SKILL.md)
     - [_skills/style-guide/EXAMPLES.md](_skills/style-guide/EXAMPLES.md)
     - [_skills/style-guide/REFERENCE.md](_skills/style-guide/REFERENCE.md)

## 🚨 Using skills via the Anthropic and OpenAI APIs consumes a large number of input tokens. Be careful, as costs can escalate very quickly.

### Anthropic Skills (Beta)

> **Important:** Anthropic Skills are currently in **beta** and may sometimes produce unexpected results or behave
> inconsistently. This is expected — the feature is still evolving.

1. Open [anthropic_app.ts](anthropicApp.ts) and implement all `TODO` items
2. Run [anthropic_app.ts](anthropicApp.ts) and test it using the **Style Guide** and **Calculator** sample requests below.
3. To switch between skills, change `skill_id` in `main()` to use either `STYLE_SKILL_DIR`/`STYLE_SKILL_TITLE` or
   `CALCULATOR_SKILL_DIR`/`CALCULATOR_SKILL_TITLE`.
4. Test it with samples below

---

### Sample Requests: Style Guide

```
Rewrite this for our brand: "We are pleased to inform you that your request has been processed successfully by our dedicated support team."
```

```
What are the rules for writing LinkedIn posts according to our style guide?
```

```
Show me an example of a bad support email and how to rewrite it using our brand voice.
```

---

### Sample Requests: Calculator

```
What is 2^10?
```

```
What is (144 * 3) + sqrt(256) - 2^8?
```

```
What is sin(pi / 2) + cos(0)?
```

```
What is 2^10 + sqrt(144)?
```

---

### OpenAI Skills

1. Open [openai_app.ts](openaiApp.ts) and implement all `TODO` items
2. Run [openai_app.ts](openaiApp.ts) and test it using the **Style Guide** and **Calculator** sample requests below.
3. To switch between skills, change the skill name and directory in `main()`.
4. Test it with samples above

---

### Custom Agent Skills

Instead of relying on a managed VM provided by Anthropic or OpenAI, the custom agent loads skills from the **local
filesystem** and executes JavaScript code via an external **Node.js MCP Code Sandbox**.

**How it works:**

- `read_skill` tool: reads any skill file (SKILL.md, scripts, references) directly from disk. The agent calls it to
  load skill instructions before acting.
- `execute_code` tool (via MCP): runs JavaScript code in a persistent Node.js sandbox container managed by the MCP server.

### Setup: Node.js Code Sandbox

The custom agent launches the sandbox automatically via Docker — no persistent service needs to be started.

Pull the image once before running:

```bash
docker pull mcp/node-code-sandbox
```

The `execute_code` tool exposed to the agent has these parameters:

```json
{
  "name": "execute_code",
  "description": "Execute JavaScript code in a persistent Node.js sandbox container.",
  "parameters": {
    "properties": {
      "code": {
        "type": "string",
        "description": "JavaScript code to execute (ESModules syntax)."
      },
      "container_id": {
        "type": "string",
        "description": "Sandbox container ID. Empty string on first call; reuse on subsequent calls.",
        "default": ""
      },
      "script_path": {
        "type": "string",
        "description": "Path to a skill script relative to the skills root — prepended to code."
      }
    },
    "required": ["code"]
  }
}
```

> Source code: https://github.com/alfonsograziano/node-code-sandbox-mcp

### Task

**[Request flow](custom_request_flow.html)**

1. Implement all TODO in [custom/_skills/SKILL.md](custom/_skills/unit-converter/SKILL.md)
2. Open [custom/tools/skills/readSkillTool.ts](custom/tools/skills/read_skill_tool.ts) and implement all `TODO`
3. Open [custom/tools/jsInterpreter/jsCodeInterpreterTool.ts](custom/tools/jsInterpreter/jsCodeInterpreterTool.ts) and implement all `TODO`
4. Open [custom/agent.ts](custom/agent.ts) and implement all `TODO`
5. Open [custom/customApp.ts](custom/custom_app.ts) and implement all `TODO`
6. Make sure Docker is running, then run [custom/customApp.ts](custom/custom_app.ts) and test it using the **Convertor** sample
   requests below.

### Sample Requests: Convertor

```
Convert 98.6°F to Celsius and Kelvin
```

```
How many MB is 1.5 TB?
```

```
I'm driving 127 km/h, what's that in mph and knots?
```

```
Convert 577 acres to hectares and square meters
```

```
My recipe needs 3 cups of milk — how many ml is that?
```

---

**Congratulations 🎉 You've built agents that use skills that are managed by cloud providers and running entirely on your
own infrastructure!**