---
# TODO:
# Provide name as unit-converter;
# Provide description: Write when the agent should activate this skill. Cover: what unit categories it handles and what user actions trigger it.
# License is Apache-2.0
# Metadata: 
#    - Author is ai-powered-apps-development-expert
#    - version is 1.0
# And allowed tools is execute_code
---

# Unit Converter

<!--
TODO: Fill in the workflow for the agent. The script is at scripts/convert.ts.
See references/how-code-execution-works.md to understand how execute_code works.
See examples.md for invocation examples and supported units.

## Workflow

### Step 1: Load the script (first call, container_id = "")
Call execute_code with script_path, the conversion code, and container_id = "".
Save the returned container_id from session_info for reuse.

### Step 2: Write the conversion call
Pass as code: call convertUnits(value, fromUnit, toUnit) and console.log Category, Input, Result.

### Step 3: Return output
Return the printed output as-is.

### Step 4: Reuse sandbox
On follow-up conversions skip Step 1 — pass only code + saved container_id.

### Step 5: Error handling
Unknown unit / incompatible categories: report the error and list supported units from examples.md.
Invalid number: ask to clarify. Container not found: silently restart from Step 1.
-->
