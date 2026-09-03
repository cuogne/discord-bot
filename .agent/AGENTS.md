# Bot Discord Project Agent Guide

This document defines how an AI agent must understand, modify, and maintain this repository.
These project-specific rules apply whenever they do not conflict with higher-priority instructions.

## 1. Project overview

This is a Discord utility bot. It runs as a single Bun process, registers Discord slash commands, calls external APIs, formats results as messages or embeds, and logs command usage to the console and optionally to a configured Discord channel.

Current command areas:

- `action`: anime-style reaction GIFs for a selected user.
- `avatar`: user, banner, and server images.
- `calendar`: a month calendar in Vietnam time.
- `cinestar`: today's showtimes and upcoming movies with select menus and link buttons.
- `dictionary`: English dictionary lookup.
- `football`: schedules and scores from ESPN.
- `gemini`: streaming AI chat with model fallback and cooldown handling.
- `giaxang`: current fuel prices.
- `omikuji`: AI-generated Japanese fortune messages with image assets.
- `random`: random selection from comma-separated input.
- `today`: Vietnamese solar/lunar date information.

User-facing text is primarily Vietnamese. New bot messages should normally be Vietnamese unless a
feature intentionally uses another language.

## 2. Language and technology stack

- TypeScript with strict compiler settings.
- Bun runtime and package manager.
- Native ESM modules with explicit `.ts` import extensions.
- `discord.js` v14 for Discord interactions and embeds.
- `pino` and `pino-pretty` for structured console logging.
- Native `fetch` for most HTTP calls; Axios is currently used by ESPN.
- Google GenAI SDK for Gemini.
- `@nghiavuive/lunar_date_vi` for lunar-date calculations.
- Local JSON files for the Cinestar showtime cache.

Useful commands:

```text
bun run start
bun run dev
bun run typecheck
bun run lint
bun run format:check
```

After a non-trivial change, run at least `bun run typecheck`, `bun run lint`, and
`bun run format:check`. Never claim a check passed unless it was actually run.

## 3. Architecture and application flow

```text
src/
├── commands/       # Discord slash command modules
├── core/           # Core integrations
├── events/         # Discord lifecycle and interaction events
├── logging/        # Logging for Bot
├── types/          # Cross-feature TypeScript types
└── utils/          # Generic cross-feature utilities
```

Startup flow:

1. `src/index.ts` creates the Discord client and installs process-level error handlers.
2. `loadCommands()` scans `src/commands/**/index.ts` and imports command modules.
3. `registerEvents(client)` registers lifecycle and interaction event handlers.
4. The client logs in using `BOT_TOKEN`.
5. `ready.ts` publishes the loaded slash-command definitions to Discord.

Commands must be loaded before event registration. `interactionCreate.ts` uses the loaded command
collection, including select-menu handlers. Do not add unrelated `index.ts` files under
`src/commands`, because the dynamic loader may interpret them as commands.

Each command folder exposes one default `SlashCommand` from `index.ts`:

```typescript
const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('...'),

  async execute(interaction) {
    // command entry point
  },

  selectHandlers: {
    // optional select-menu handlers
  },
};

export default command;
```

For subcommands, keep definition and routing in `index.ts`, primary flows in `main/`, and select menus or other interaction-specific logic in `handlers/`. Use `avatar` as reference patterns. Select handlers are exposed through `selectHandlers` on the root command. Subcommand entry points are defined in `subcommands/`, imported into the root command and used `switch-case` style in the root `execute()`.

### Separation of concerns and reuse

Keep each file focused on one responsibility so that command code remains easy to read and
maintain. Depending on the feature, separate these concerns into focused modules:

- command definition and subcommand routing;
- primary command business logic;
- select-menu or button interaction handlers;
- external API/client calls;
- data transformation and validation;
- embed and Discord component builders;
- storage/cache access;
- feature-specific types and constants.

Keep `index.ts` and command entry points thin. They should define the Discord interface and delegate
business work to the appropriate module. Do not put API calls, large data transformations, storage
logic, or long embed construction directly into a command definition when those concerns can be
isolated clearly.

Before adding a helper, search the project for an existing equivalent. Do not copy-paste logic
between commands. If a helper is used by two or more features, move it to a shared location:

- use `src/utils/` for generic stateless helpers such as dates, formatting, HTTP wrappers, and
  collection operations;
- use `src/core/` for reusable service integrations, clients, retry policies, persistence, or
  domain infrastructure;
- keep helpers used by only one feature inside that feature's `utils/` folder.

Do not move code to global utilities merely because it is short. Reuse must be real and the shared
module must have a clear, feature-independent responsibility. Conversely, when the same behavior
is genuinely shared, centralize it instead of maintaining multiple slightly different copies.

Split large or mixed-responsibility files, but avoid creating one file for every trivial expression.
The goal is clear ownership, low coupling, and straightforward future changes.

Recommended feature layout:

```text
commands/<feature>/
├── index.ts          # command definition and routing
├── subcommands/      # subcommand entry points
├── types/types.ts    # feature-specific types; intentionally nested
└── utils/            # feature-specific helpers, embeds, components, dates, storage
```

The nested `types/types.ts` convention is intentional. Do not flatten it merely to reduce folders.

Interaction flow:

- `interactionCreate.ts` routes chat-input commands through `commandMap`.
- It routes autocomplete interactions to the optional command `autocomplete` handler.
- It resolves string-select handlers from loaded command definitions.
- Command errors are logged and an ephemeral fallback error is sent when possible.
- Usage logging is independent: `logging/context.ts` builds shared data, `logging/console.ts`
  writes to Pino, and `logging/channel.ts` sends an embed.

## 4. Core integrations, HTTP, and dates

`src/core/gemini/` contains behavior shared by Gemini-backed features:

- `client.ts`: model fallback execution.
- `config.ts`: environment-driven model order and Gemini timeout.
- `errors.ts`: retryable and timeout error classification.
- `timeout.ts`: Gemini request timeout wrapper.

Feature-specific Gemini prompts and streaming behavior stay inside their feature. Do not make one
command import another command's private utility when a reusable concern belongs in `core/`.

Use `src/utils/http.ts` for native `fetch` calls so external requests use the shared 15-second
timeout. Axios calls must use `HTTP_TIMEOUT_MS` from that module. Keep Vietnam timezone handling
explicit with `Asia/Ho_Chi_Minh`; do not rely on the server's local timezone for business logic.
Prefer existing date helpers over duplicating `Intl.DateTimeFormat` logic.

## 5. JSON and runtime data

Cinestar uses JSON files under `src/commands/cinestar/data/` as a daily runtime cache. These files
are ignored by Git except for `.gitkeep`. They are not a source of truth and may be recreated or
normalized at runtime.

When using JSON:

- Define TypeScript interfaces for the expected shape.
- Treat parsed JSON as `unknown` until checked or safely narrowed.
- Base file paths on `import.meta.dir`, not the process working directory.
- Do not commit generated cache files.
- Do not silently change cache schemas without considering existing local files.
- A database is unnecessary for a small single-process cache; consider SQLite or MongoDB only when
  persistence, multiple instances, concurrency, or querying requirements justify it.

## 6. Coding conventions

### Formatting and method chains

Put each chained builder method on its own line when there are multiple calls. For large Discord
command builders, use the established `prettier-ignore` style:

```typescript
// prettier-ignore
data: new SlashCommandBuilder()
  .setName('command_name')
  .setDescription('the description of command_name')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('subcommand_name')
      .setDescription('the description of subcommand_name')
      .addStringOption((option) =>
        option
          .setName('option_name')
          .setDescription('the description of option_name')
          .setRequired(true)
          .addChoices(
            // choices
          ),
      ),
  ),
```

Use the repository's Prettier configuration rather than manually fighting formatting.

### Imports and types

- Use explicit `.ts` extensions for local imports.
- Use `import type` for type-only imports.
- Avoid `any`; use `unknown` at external-data boundaries and narrow it.
- Preserve strict TypeScript compatibility. Do not weaken `tsconfig.json` to silence errors.

### Conditional blocks

Always wrap the body of every `if` statement in curly braces, even when it contains only one
statement. This keeps scopes visually clear and makes future changes safer:

```typescript
if (!result) {
  return;
}
```

Do not use single-line statements without braces, such as `if (!result) return;`.

### Discord responses

- Use `flags: MessageFlags.Ephemeral` for hidden replies. Never use numeric `64` or
  `ephemeral: true`.
- Defer before long-running work when the command's intended behavior permits it.
- Preserve intentional behavior when a feature deliberately handles timing differently; do not
  change it without a concrete reason or user request.
- Keep reusable embeds and components in feature utility files.

### Logging

Use structured logging with the error under `err` and the message as the final argument:

```typescript
logger.error(
  {
    err: error,
    movieIndex,
  },
  'error message',
);
```

Do not use ad-hoc `console.log`, `console.error`, or `console.warn` in application code. Use the project logger. For command usage logs, keep console and Discord-channel logging as separate sinks; share structured context through `src/types/log.ts`, not console output.

Every command execution function and interaction handler must have clear, appropriate structured
logging so that its behavior can be debugged later. At minimum:

- log failures at the command or handler boundary with `err` and useful identifiers/context;
- log important lifecycle or result information for non-trivial work such as external API calls,
  cache refreshes, model selection, and generated results;
- use consistent messages that identify the command or operation;
- do not duplicate the global command-usage log in every command;
- never log tokens, credentials, or unnecessarily sensitive user content.

Logging should help diagnose what happened, for which command/user/resource, and why it failed,
without turning every trivial helper into noisy output.

### Naming

- Use concise, descriptive names.
- Use `index.ts` only for command entry modules and established entry patterns.
- Use `main/` for primary command flows and `handlers/` for interaction-specific handlers.
- Use `core/` for reusable service/integration behavior shared across features.
- Use `logging/` for the logging subsystem, not `logger/` or `log/`.

## 7. Strict rules for AI agents

Unless the user explicitly requests it:

- Do not delete, reset, or overwrite unrelated user changes.
- Do not run destructive Git commands such as `git reset --hard` or `git checkout --`.
- Do not casually delete runtime data, cache files, assets, or configuration files.
- Do not expose, print, commit, or copy secrets from `.env` or credentials.
- Do not add API keys, tokens, IDs, or private URLs to source code.
- Do not change command names, user-facing behavior, response language, or data schemas when the
  task only asks for refactoring.
- Do not add a database, dependency, framework, or broad architectural layer without a clear need
  and user approval.
- Do not flatten intentional feature folders such as `types/types.ts`.
- Do not move feature-specific helpers into global `utils/` unless genuinely shared.
- Do not use numeric Discord flags; use named Discord.js constants.
- Do not silence TypeScript with `any`, `@ts-ignore`, disabled compiler options, or broad casts
  except for a documented external-library limitation.
- Do not silently swallow API failures. If partial data is intentional, log useful context.
- Do not make network calls at module import time. API calls belong inside command/service flows.
- Do not add generated JSON cache files to commits.

Before modifying a file with existing changes, inspect it and preserve the user's intent. Keep
unrelated worktree changes untouched.

## 8. Change workflow

1. Inspect the relevant command, shared types, imports, and current worktree status.
2. State assumptions when the task affects behavior or external data.
3. Make the smallest coherent change that fits the existing architecture.
4. Reuse existing helpers and patterns before introducing abstractions.
5. Run typecheck, lint, formatting, and focused checks appropriate to the change.
6. Review the diff for accidental changes, stale imports, generated files, and behavior changes.
7. Report what changed, what was verified, and any remaining limitation.

When a requested change conflicts with an existing convention, follow the user's explicit request
and document the deliberate exception in the final handoff.
