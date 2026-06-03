---
name: find-skills
description: >
  Helps users discover and install agent skills. Activates when the user asks
  things like "how do I do X", "find a skill for Y", "is there a skill that can Z",
  or wants to extend Claude's capabilities. Teaches Claude how to use `npx skills`
  to search, evaluate, and install community skills from skills.sh.
---

# Find and Install Agent Skills

When a user asks "how do I do X", "is there a skill for Y", or anything that
sounds like they need a specialized capability, use this process to search for,
evaluate, and install a matching skill.

## The Skills CLI (npx skills)

`npx skills` is the package manager for the open agent skills ecosystem.
Skills are shareable, modular agent instructions published on skills.sh.

### Discovery workflow (5 steps)

1. **Understand the need.** Identify the domain, the specific task, and whether
   a skill is likely to exist. Not every task needs a dedicated skill — some are
   handled well by Claude's built-in capabilities.

2. **Check the leaderboard** at https://skills.sh for popular, high-install
   skills matching the user's request. Well-known sources include
   `vercel-labs/agent-skills` and `anthropics/skills`.

3. **Search** by running:
   ```
   npx skills find [query]
   ```
   - Use specific keywords ("react testing" not "testing")
   - Search only supports English — translate Chinese queries first
   - If the default Bash/Git Bash returns empty output on Windows, wrap in
     PowerShell: `powershell -Command "npx skills find '[query]'"`

4. **Verify quality.** Check install counts (prefer 1K+), source reputation,
   GitHub stars. Be cautious with anything under 100 installs.

5. **Present options.** Show the best matches with: skill name, install count,
   source, install command, and a skills.sh link.

6. **Offer to install** with:
   ```
   npx skills add <owner/repo@skill> -g -y
   ```

## Common search categories

| Domain | Example search query |
|---|---|
| Web Development | `react best practices`, `next.js deployment` |
| Testing | `jest unit test`, `playwright e2e testing` |
| DevOps | `docker compose`, `github actions ci` |
| Documentation | `readme generator`, `api docs` |
| Code Quality | `code review`, `linting rules` |
| Design | `ui components`, `tailwind patterns` |
| Productivity | `git workflow`, `project scaffolding` |
| Data Analysis | `data analysis`, `python data science` |

## Chinese → English keyword reference

| 中文 | English |
|---|---|
| 数据分析 | data analysis |
| 代码审查 | code review |
| 测试/单元测试 | testing / unit test |
| 前端/后端 | frontend / backend |
| 部署/运维 | deployment / devops |
| 文档 | documentation |
| 数据库 | database |
| API 开发 | API development |

## When nothing matches

If no skill is found:
- Acknowledge the gap
- Offer to help directly
- Suggest the user create a custom skill with `npx skills init my-skill-name`

## Installing skills

```bash
# Search
npx skills find [keywords]

# Install (global, skip confirmation)
npx skills add <owner/repo@skill> -g -y

# List installed
npx skills list

# Check for updates
npx skills check

# Update all
npx skills update

# Uninstall
npx skills remove <skill-name>
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npx skills` returns empty output on Windows (Git Bash) | Use `powershell -Command "npx skills find 'query'"` instead |
| Chinese search returns nothing | Translate to English keywords |
| Installed skill not appearing | Restart Claude Code (new conversation) |

---

Attribution: Original skill by Vercel Labs. Windows compatibility by KimYx0207.
Source: https://github.com/vercel-labs/skills/tree/main/skills/find-skills
Market: https://skills.sh
