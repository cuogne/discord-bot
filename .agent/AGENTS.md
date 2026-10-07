# Bot Discord Project Agent Guide

This is the canonical implementation guide for this repository. It combines the original agent
guide with the current code and the owner's conventions. Read the relevant code before changing
it; this document is a rulebook, not a substitute for inspecting behavior. The user's task-specific
instructions take precedence over these defaults. Preserve unrelated worktree changes.

## 1. Runtime and actual application flow

The bot is a single Bun process using TypeScript ESM and `discord.js` v14. It serves Vietnamese
users through Discord slash commands, external APIs, MongoDB, Gemini, and scheduled jobs. Pino
provides structured server-side logging; a configured Discord channel receives command-usage
records separately.

The startup sequence in `src/index.ts` is significant:

1. Create the Discord client and register process cleanup.
2. Connect registered databases and initialize the in-memory ban manager.
3. Load commands, then register Discord event handlers.
4. Log in with `BOT_TOKEN`.
5. On `clientReady`, bulk overwrite global application commands and start the HCMUS news scheduler.

Shutdown stops that scheduler, destroys the client, waits briefly for in-flight coin commands,
then disconnects databases. New long-running work needs an equivalent shutdown path. Never start
network requests, timers, or database writes merely by importing a module. Do not use `bun run
start` as a syntax check: it connects to services and republishes global Discord commands.

`loadCommands()` uses `Bun.Glob('*/index.ts')` inside `src/commands`. This scans only direct
command directories, not every nested `index.ts`. Each discovered module must default-export a
valid `SlashCommand`. Keep the command list populated before event registration; event dispatch
uses the loaded `commandMap` and command definitions.

## 2. Architecture and folder structure

The repository's top-level source layout is an ownership map, not merely a list of folders:

```text
src/
├── index.ts             # application startup and shutdown orchestration
├── commands/
│   ├── index.ts         # discovers direct-child command folders; builds commands/commandMap
│   └── <feature>/       # one slash command and its private implementation
├── core/                # central, reusable capabilities used by commands and other consumers
│   ├── ban/             # shared ban state, persistence, and checks
│   ├── database/        # connection registration and lifecycle
│   ├── gemini/          # shared Gemini client, fallback, timeout, error handling
│   └── <tool_name>/     # add a new shared integration/tool here
├── events/              # Discord event registration, dispatch, ready, lifecycle
├── logging/             # Pino logger plus console and Discord usage-log sinks
├── types/               # contracts shared across features and infrastructure
└── utils/               # generic, stateless helpers with no feature ownership
```

The runtime dependency and dispatch directions are:

```text
src/index.ts
  -> core/database + core/ban initialization
  -> commands/index.ts: load */index.ts into commandMap
  -> events/registerEvents.ts: attach Discord event handlers
  -> Discord login -> events/ready.ts: publish commands, start scheduler

Discord interaction -> events/interaction.ts
  -> events/command.ts | events/autocomplete.ts | events/selectmenu.ts
  -> command's index.ts -> feature implementation -> reusable src/core or src/utils

command execution -> logging/context.ts -> logging/console.ts + logging/channel.ts
```

`src/events/interaction.ts` currently handles chat-input commands, autocomplete, and string
select menus. `src/types/command.ts` defines the matching `SlashCommand` contract. Do not place
a new interaction type only inside a command: add its type, event dispatch, acknowledgement,
error handling, and lifecycle route as appropriate. `src/events/ready.ts` republishes global
commands; command registration is a real external side effect. The usage-log sinks are separate
from user replies and technical Pino errors.

### Layout of a command feature

Create a new slash command as `src/commands/<command-name>/index.ts`. The direct child and its
default `SlashCommand` export are required for automatic discovery. Start with only `index.ts`
for a small command; create other directories when their responsibility appears:

```text
src/commands/<feature>/
├── index.ts              # SlashCommand builder, option contract, execute routing
├── subcommands/          # one entry/flow per named slash subcommand
├── main/                 # substantial primary workflows shared by entry points
├── handlers/             # select-menu or other interaction-specific handlers
├── api/                  # feature-only external API adapters/clients
├── database/             # feature-owned schema and repository, if durable data is needed
├── data/                 # checked-in static choices or rebuildable local cache
├── types/
│   └── types.ts          # feature-specific types shared by its modules
├── utils/                # feature-only parsing, transforms, embeds, components, formatting
├── assets/ or resources/ # static images and other feature-owned files
└── config.ts             # feature-only constants/configuration when substantial
```

This is a placement guide, **not** a requirement to create every directory. Match the
responsibility and existing feature precedent. For example, `avatar` uses `subcommands/`,
`cinestar` separates `api/`, `main/`, `handlers/`, `types/types.ts`, and `utils/`, while a small
command such as `ping` needs only `index.ts`. `hcmus-news/core/` is internal to that feature;
it does not mean the same thing as the cross-command `src/core/`. Do not put a feature-only
crawler or prompt into global core merely because its local folder happens to be named `core`.

Keep command `index.ts` as the public Discord boundary: define its builder, required and
optional options, and a short `execute` dispatcher. For a subcommand, define its builder in
the root entry, route by `getSubcommand()` there, and place its work in
`subcommands/<name>.ts`. Use `main/` when that work has a substantial reusable workflow; use
`handlers/` for follow-up interaction handling such as a select menu. Put embed and component
construction in feature `utils/` when it would obscure the flow. Keep a one-purpose helper
local to the command until another actual consumer needs it.

### Where to create shared capabilities

`src/core/<tool_name>/` is the extension point for a reusable service, integration, or tool.
Give that folder only the files its implementation needs: for example, `client.ts` for external
client setup, `config.ts` for shared configuration, `errors.ts` for service error mapping,
`types.ts` for its public data contract, and `index.ts` for a small public API if useful.
These names are examples, not a template to generate blindly. The core API should accept
ordinary typed inputs and return data or domain errors; it must not require a Discord
interaction or import from `src/commands`. Each command then uses that API and decides its
own prompts, options, permissions, embed, and reply. Database connections belong to
`src/core/database/`; feature-only models can live in the feature's `database/` and obtain
the existing connection from core. Put broadly shared domain models in core only when they
are genuinely shared.

Use `src/utils/` only for a pure helper that has no service or feature identity, such as date
conversion or generic HTTP mechanics. Use `src/types/` only for contracts crossing feature or
infrastructure boundaries; keep feature-specific shapes in that feature's `types/types.ts`.
Use `src/logging/` for log production and sinks; do not create an alternate logging subsystem
inside a command. Static data belongs with its feature; runtime cache must remain rebuildable
and excluded from commits.

### Implementation sequence for a new feature

1. Inspect the nearest existing command, `src/types/command.ts`, `src/commands/index.ts`, and
   the relevant event route. Check `git status --short` before touching files.
2. Create `src/commands/<name>/index.ts` with a default `SlashCommand`. For a simple command,
   implement `execute` there; for subcommands, add only the needed `subcommands/` files.
3. As the flow grows, separate feature-owned API, storage, type, embed/component, and
   interaction-handler code into the matching folders above. Do not create empty scaffolding.
4. If the capability is needed by several commands or is explicitly intended as a central
   tool, implement it under `src/core/<tool_name>/` and import that API into each command.
   Never make one command import another command's private files.
5. Add a new event/interaction route only if `SlashCommand` and the existing dispatcher cannot
   represent the UI. Add explicit validation, permission checks, acknowledgement, safe user
   errors, and structured technical logs at the boundary.
6. Update `/help` metadata and `README.md` for user-visible commands; add environment
   placeholders to `.env.example` for new configuration. Typecheck, lint, format-check, review
   the diff, and run focused logic tests where risk warrants them. Avoid starting the bot merely
   to check syntax, because ready-time registration mutates global Discord commands.

## 3. Code style and non-negotiable formatting

- Follow `.editorconfig` and `.prettierrc`: UTF-8, LF, two spaces, single quotes, semicolons,
  trailing commas, and 100-character print width. Use `import type` for type-only imports and
  explicit `.ts` extensions for new local imports. Preserve strict TypeScript settings; do not
  hide errors with `any`, `@ts-ignore`, disabled checks, or broad casts.
- Each method in a Discord builder chain gets its own line. This applies to both slash-command
  builders and `new EmbedBuilder()` chains: create an embed with `new EmbedBuilder()`, then put
  `.setDescription()`, `.setImage()`, `.setColor()`, `.setFooter()`, `.setTimestamp()`, etc. on
  separate lines. Do not build a new embed as a raw object or compress the chain onto one line.
  Put `// prettier-ignore` immediately before a builder expression when Prettier would collapse
  its visual hierarchy. Apply it only to the affected expression, never an entire file.
- **Parenthesized object rule:** whenever an opening parenthesis is immediately followed by an
  opening brace, put the object's contents on their own lines and put its closing brace on its
  own line. This includes call arguments, arrow-function object returns, and destructured
  callback parameters. A one-property object is not exempt. If Prettier condenses it, use a
  targeted `// prettier-ignore` for that expression. For example:

  ```ts
  // prettier-ignore
  await interaction.reply({
    content: 'Xin chào!',
  });

  // prettier-ignore
  const labels = items.map(({
    name,
    time,
  }) => `${name} ${time}`);

  // prettier-ignore
  const mapped = items.map(() => ({
    helo,
  }));
  ```

  The same shape applies to `setFooter`, `interaction.reply`, `editReply`, `followUp`, HTTP
  options, logger calls, and other APIs. Put the reply payload on the lines following `({`,
  including a one-field payload such as `embeds: [embed]`; do not compress it just because it
  fits on one line. This rule governs **new or touched code**; do not launch an unrelated
  repository-wide reformat.

- Always use braces for `if`, `else`, and loop bodies, including one-statement branches. Prefer
  early returns after invalid input. Name functions, variables, and types descriptively in
  English. The bot is primarily for Vietnamese users: slash-command descriptions, option
  descriptions, configured labels/choices, embeds, buttons, footers, success messages, and
  errors shown in Discord must be Vietnamese unless the feature intentionally requires another
  language. Internal identifiers, configuration keys, code comments, and system logs use English.
- Keep a file focused on one responsibility. A short `execute` can stay inline. When it mixes
  API calls, parsing, storage, UI construction, and error handling, move those concerns into
  focused feature modules. Do not create a separate file for a trivial expression.

## 4. Where reusable behavior belongs

`src/core` is the **central implementation layer** for services and capabilities used by more
than one command. Commands depend on core; core must not import command-private modules. Each
command adapts the shared core capability to its own inputs, prompt, presentation, and policy.

Use this ownership test before adding a file:

| Responsibility                                                                   | Owner                                                 | Decision rule                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Slash-command options, interaction acknowledgement, user-facing embed            | The command                                           | Discord-specific behavior stays at the edge.                        |
| One command's parser, prompt, embed, or API adapter                              | That command's feature modules                        | Keep it local until another consumer actually needs the behavior.   |
| Service client, tool, fallback policy, or database connection reused by commands | `src/core/<service_or_tool>/`                         | Make the reusable operation independent of any command.             |
| Pure stateless formatting, date, collection, or HTTP helper                      | `src/utils`                                           | It must make sense without knowing a feature name.                  |
| Durable data owned by one feature                                                | Feature repository/model using the core DB connection | Move it to core only when the domain data becomes genuinely shared. |

- Gemini is the model: `src/core/gemini` owns client creation, configuration, timeout, error
  classification, and model fallback. `/gemini`, Omikuji, and HCMUS news can use that core while
  keeping their own prompts, stream handling, and Discord responses.
- Database infrastructure lives in `src/core/database`: connection lifecycle, registration,
  reconnection, and access to the active connection. A schema/repository used only by one
  command can stay with that command; move a genuinely shared domain repository into core.
  Never create a separate Mongoose connection inside a command.
- For a new reusable tool or integration, create `src/core/<tool_name>/` first. Put its client,
  config, shared types, error/timeout handling, and stable operations there as needed. Commands
  import its public functions and customize only command-specific behavior. For example, a
  reusable search tool belongs in `src/core/search/`; the answer formatting for `/ask` belongs
  in that command. Do not make command A import the private helper of command B.
- `src/utils` is for generic, stateless helpers such as dates, formatting, shuffling, or HTTP
  mechanics. Keep feature-specific helpers inside that feature. Do not move code to global
  utilities merely because it is short; share behavior only when ownership is genuinely common.

Before adding a helper, search for an existing equivalent. If a new feature needs storage,
consider the lifetime and concurrency of its state first: process memory for ephemeral cooldowns,
rebuildable JSON for caches, MongoDB for durable user/server data. A new database engine or broad
framework requires a concrete need; avoid adding one for a small feature.

## 5. Building commands and feature modules

Each direct child of `src/commands` represents one slash command and has an `index.ts`. The
entry file defines its Discord interface and routes work; it must export a `SlashCommand` default.
For simple behavior, implement `execute` directly. For complex behavior, keep the entry thin and
delegate to functions in `main/`, `subcommands/`, `handlers/`, or feature-local `utils/` according
to responsibility. The `types/types.ts` convention is intentional for feature-specific shared
types; do not flatten it. Do not define a substantial shared response shape at the top of every
consumer file.

Example of the expected command definition style:

```ts
const command: SlashCommand = {
  // prettier-ignore
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Mô tả lệnh')
    .addStringOption((option) =>
      option
        .setName('value')
        .setDescription('Giá trị cần xử lý')
        .setRequired(true),
    ),

  async execute(interaction) {
    const value = interaction.options.getString('value', true);
    // prettier-ignore
    await interaction.reply({
      content: value,
    });
  },
};

export default command;
```

When there are subcommands, route them explicitly with `switch` in the command entry and place
the actual handlers in `subcommands/` or `main/`. A handler should receive the interaction and
return after replying. Keep select-menu handlers in `selectHandlers` on the root command;
`src/events/selectmenu.ts` resolves a full `customId` first, then the part before `|`. Prefixes
must be unique, and the suffix must be parsed and validated.

Required options precede optional options. Use the typed `getString`, `getInteger`, or `getUser`
with `true` for required values; handle `null` for optional values. Discord limits string choices
and select-menu options to 25, so design autocomplete or pagination if necessary. UI choices
do not replace server-side validation of values with important effects.

Adding or changing a user-visible command also means updating `/help` data in
`src/commands/help/utils/commands.ts` and `README.md`. Do not mechanically refactor other
commands while adding one. Check command `data.toJSON()` or typecheck before running the bot,
because `clientReady` republishes all global command definitions.

`SlashCommand` currently supports chat-input commands, autocomplete, and string-select handlers.
To add a context-menu command, modal, persistent button, or another interaction type, extend the
types, registration, and dispatcher deliberately. A short-lived confirmation button may use a
message component collector with a user filter, timeout, and component cleanup, as HCMUS setup
and remove do. A button that must survive restart needs persistent routing and durable state.

## 6. Discord response, permissions, and errors

For work that may take time, call `await interaction.deferReply()` before I/O and finish with
`editReply()`. A trivial reply can use `reply()` directly. An interaction must be acknowledged
once; use `followUp()` or `deferUpdate()` only in the appropriate subsequent path. Do not reply
again after a defer. Use `flags: MessageFlags.Ephemeral` for private feedback; do not use the
numeric flag or the deprecated `ephemeral: true` form.

Before a server-scoped action, check guild context, the caller's permissions, and the bot's
permissions in the target channel. The HCMUS setup/remove flow is the reference for Admin or
Manage Channels checks and channel send/embed permissions. For user-generated text, consider
`allowedMentions` to avoid unintended mass pings. Keep embeds/messages within Discord limits;
split long output rather than silently truncating essential information.

**Language and error boundary:** Discord is the Vietnamese-facing product surface, including
command and option descriptions, configured choice labels, embeds, footers, confirmations,
and error replies. Technical logs, system events, and internal configuration identifiers use
English. Expected user errors may have a specific, helpful Vietnamese reply. For unexpected
failures, catch at the command or interaction boundary, log the original error on the server,
and send only a safe Vietnamese message. Never interpolate `error.message`, `error.stack`, a
raw API/HTTP body, a database error, a token, or an internal path into any Discord message or
embed. Do not convert every exception into a success-shaped return value: preserve the cause
for traceability, then translate it only at the user-facing boundary. Use the common fallback
in `src/events/command.ts` for uncaught command errors. Give new interaction routes the same
safe boundary. The `LOG_CHANNEL_ID` channel is for usage/audit events, not technical exception
reports; keep raw errors out of that Discord sink too.

Use Pino `logger`, not ad-hoc `console.log/error/warn`. Write all new system log messages in
English, with the original error under `err` and useful structured identifiers such as
`command`, `userId`, `guildId`, `resourceId`, or `durationMs` when relevant. Log a failure once
at the boundary that can provide context; avoid repeated logs for the same error in every
helper. Use `debug` for noisy details, `info` for meaningful lifecycle/results, `warn` for
recoverable or expected operational problems, and `error` for failed operations. Do not log
credentials or unnecessary user content. Log significant external API, cache, model, or
scheduled-work outcomes, but do not duplicate global command-usage logging in each command.
The current code contains some older Vietnamese log messages; apply this English convention
to new or touched logging without unrelated mass rewrites.

```ts
// prettier-ignore
logger.error(
  {
    err: error,
    command: interaction.commandName,
    userId: interaction.user.id,
  },
  'Failed to execute command',
);
```

`sendCommandUsageLog` may include option values and attachments in a configured Discord channel.
Before introducing sensitive options or files, review both the Pino redaction policy and that
Discord audit payload; Pino redaction does not sanitize a separately built embed. A logging
failure must not replace a successful command response. The current audit embed can also include
the error message from `setCommandUsageError`; that is a known legacy leak, not a pattern to
copy. When touching the logging flow, remove or sanitize that field so the Discord log channel
receives only safe audit metadata.

## 7. Persistence, scheduling, HTTP, and time

Get MongoDB models from `useMongoDatabase().getConnection()` and reuse existing
`connection.models` before defining a model. Use schemas and indexes near the owning domain,
`.lean()` for read-only queries, and explicit defaults/backfills when stored documents predate a
field. Updates affecting balances, streaks, or one-time actions must be atomic or conditional at
the database boundary. `/coin daily` checks a Vietnam calendar date in the update filter; game
settlement filters by available balance and retries conflicting writes. Do not read a balance
and then write a computed value from stale state.

In-memory cooldowns are process-local and vanish on restart. The HCMUS news scheduler starts on
ready, runs every ten minutes without overlapping cycles, and stops on shutdown. New scheduled
work needs overlap protection, idempotency, bounded delivery, per-item error handling, and
cleanup. Cinestar's local JSON files are a rebuildable daily cache, not durable user storage;
paths should be derived from `import.meta.dir`, not the current working directory.

Use `fetchWithTimeout` from `src/utils/http.ts` for native fetch: it has a 15-second timeout and
limited retries for idempotent HTTP methods. ESPN uses its own Axios-based `espnFetch` with the
shared retry/timeout policy. Check response status and validate external payloads. Encode user
input with `encodeURIComponent`, `URL`, or `URLSearchParams`. A failed source need not fail an
independent batch if partial results are useful; log the source and continue deliberately.

Business dates use `Asia/Ho_Chi_Minh`, never the host's timezone. Prefer
`getVietnamDateParts`, `getTodayInVietnam`, or `formatInTimeZone`. Be careful with the existing
`getVNTimeNow()` helper: it returns a `Date` whose timestamp is already shifted by seven hours;
`formatVNStoredDate()` displays that legacy representation as UTC. Do not shift it again or
reuse it for a new true-UTC timestamp without tracing the storage and display path. Test
midnight boundaries when changing daily rewards, schedules, or ban expiry.

The shared Gemini core owns configured model order, client creation, timeout, and fallback.
Feature-specific prompts and Discord presentation stay with the feature. Account for missing
keys, quota, timeout, attachment validation, streaming, and usage metadata when extending AI
features. Add new environment variables as placeholders to `.env.example`; never commit `.env`,
`config.json`, credentials, or generated cache files.

## 8. Docker, Compose, and release workflow

Treat the container files as part of the application contract. Inspect `Dockerfile`,
`.dockerignore`, `docker-compose.yml`, `.env.example`, and `.github/workflows/cicd.yaml`
before changing startup, dependencies, environment variables, runtime files, or deployment.
Do not assume a local `bun run start` and the production container have identical dependency
sets or filesystem behavior.

### Image build and runtime

The current `Dockerfile` uses one `oven/bun:1-alpine` stage. It installs `tzdata`, sets
`TZ=Asia/Ho_Chi_Minh`, copies `package.json` and `bun.lock`, runs
`bun install --frozen-lockfile --production`, then copies the remaining build context with
ownership assigned to the non-root `bun` user. It sets `NODE_ENV=production` and launches
`bun run src/index.ts`. This is a long-running Discord client, not an HTTP server: no port
mapping or health endpoint is currently defined.

- Keep the lockfile committed and the build reproducible; update `bun.lock` when dependencies
  change. A package imported at runtime must be in `dependencies`, not only in
  `devDependencies`, because the image installs production dependencies only. Build tooling
  such as TypeScript, ESLint, and Prettier can remain development-only.
- Keep secrets out of image layers and the build context. `.dockerignore` excludes `.env`,
  `.env.local`, `.env.*`, `.git`, `node_modules`, and other local artifacts. `COPY . .` still
  includes anything not excluded: when adding generated files, local caches, credentials, or
  a new config file, update `.dockerignore` deliberately. `.gitignore` alone does **not**
  protect the Docker build context. In particular, the current `.dockerignore` does not list
  `config.json` or Cinestar's generated JSON cache; audit the local context before building
  and add exclusions when those files may exist.
- The process runs as `bun`, not root. New code must not assume root permissions or write
  into arbitrary image paths. Keep rebuildable cache paths explicit and writable; persistent
  state belongs in the configured database or a deliberately managed volume.
- `TZ` provides timezone data for the container, but business dates must still use the
  project's explicit `Asia/Ho_Chi_Minh` helpers. Do not depend on host/container local time
  for rewards, schedules, or expiry logic.
- The container entry point executes normal bot startup: it connects to MongoDB, logs into
  Discord, and publishes global slash commands on ready. Building an image is a safe code
  packaging check; running it is an external-state action, not a syntax check.

### Compose configuration and data lifetime

`docker-compose.yml` currently runs the published `cuogne/discord-bot:latest` image. It
uses `pull_policy: always`, `restart: unless-stopped`, `init: true`, `.env` via `env_file`,
and `TZ=Asia/Ho_Chi_Minh`. It defines no local `build:`, port mapping, named volume, or
MongoDB service. Therefore `docker compose up` does **not** use an image just built under a
different local tag, and replacing the container loses any files written only inside it.
MongoDB is external and must be reachable through `MONGO_URI`; Cinestar JSON is a rebuildable
cache, not persistent application data.

Compose's `.env` values can override image defaults. Set `NODE_ENV=production` in the actual
deployment environment; do not leave the `.env.example` placeholder blank. Otherwise the
logger may enter development mode and try to load `pino-pretty`, which is a dev dependency
omitted by the production install. Provide `BOT_TOKEN`, `MONGO_URI`, and the feature keys in
the deployment environment without committing their values. Check each new environment
variable in both `.env.example` and deployment configuration; do not bake secrets into the
Dockerfile, Compose file, CI logs, or source.

For a deployment, review the intended image tag and environment, then use the Compose
workflow appropriate to that host. A change to `Dockerfile` or a local build does not by
itself update the running bot. Pulling/recreating a container can interrupt in-flight
commands and triggers ready-time command registration; coordinate that operationally.
Read container logs through Docker/Compose rather than exposing technical errors through
Discord. Do not run `docker compose down -v` or delete cache/volumes as a routine update.

### CI and verification

The current GitHub Actions workflow runs on pushes to `master` or manual dispatch. Its
`check` job installs with the frozen lockfile and runs `bun run typecheck`. Only after that
passes, the build job pushes a `linux/amd64` image to Docker Hub with both commit-SHA and
`latest` tags, using Docker Hub credentials from repository secrets and Buildx cache. It
does **not** run lint, formatting checks, integration tests, or a deployment/restart step.
Do not describe image publication as automatic deployment. Prefer the SHA tag when a release
needs to be reproducible; `latest` is mutable.

For Docker-related changes, first run the relevant local typecheck, lint, and formatting
checks. `docker compose config` can validate Compose interpolation when a suitable local
`.env` exists; do not print its resolved output in shared logs because it can contain secrets.
`docker build -t bot-discord:local .` validates the image build without logging into Discord;
it does not test runtime API connectivity. Run containers only when the task calls for a real
deployment/runtime check and the required credentials and external effects are understood.
Report which checks actually ran and what remains unverified.

## 9. Work sequence and verification

1. Read the user request, `git status --short`, and the affected command, core APIs, types,
   event routes, and existing user changes before editing.
2. State assumptions that change behavior or external effects. Make the smallest coherent
   change; preserve unrelated files and existing behavior unless the user asks otherwise.
3. Reuse a core service or helper when its responsibility is shared. Add only the necessary
   environment configuration, event route, schema migration/backfill, and user documentation.
4. Run `bun run typecheck`, `bun run lint`, and `bun run format:check` for substantial TypeScript
   changes. CI currently runs typecheck; local lint and formatting still matter. Add focused
   tests for risky pure logic such as parsing, time boundaries, monetary updates, and
   concurrency; the repo has no established test suite yet.
5. Review `git diff` and `git status --short` for accidental changes, generated files, stale
   imports, and failures of the parenthesized-object rule. Report exactly what was verified and
   what still needs a real Discord/API check. Never claim an unrun check passed.

Do not reset or overwrite unrelated user work, run destructive Git commands, expose secrets,
silence compiler errors, or change a command's public behavior during an unrelated refactor.

## 10. Worked examples: wrong, right, and why

These are examples for code **being written or edited now**. Existing code does not need a
repository-wide style rewrite. The “Wrong” snippets illustrate an antipattern; do not copy them.

### Builder layout

Wrong:

```text
data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
```

Right:

```ts
// prettier-ignore
data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Pong!'),
```

Why: command builders grow options and subcommands over time. One method per line makes the
Discord interface easy to scan and keeps a predictable place to insert new options. Put the
ignore comment directly above the `data` property in an object; do not put it at the top of the
file.

### Embed builders and reply payloads

Wrong:

```text
const embed = { description: `### ${interaction.user} wants to see ${user}'s avatar`, image: avatarUrl };
await interaction.reply({ embeds: [embed] });
```

Right:

```ts
// prettier-ignore
const embed = new EmbedBuilder()
  .setDescription(`### ${interaction.user} muốn xem ảnh của ${user}`)
  .setImage(avatarUrl)
  .setColor(0x0099ff)
  .setFooter({
    text: `Yêu cầu bởi ${interaction.user.username}`,
    iconURL: interaction.user.displayAvatarURL(),
  })
  .setTimestamp();

// prettier-ignore
await interaction.reply({
  embeds: [embed],
});
```

Why: create new embeds with `new EmbedBuilder()` and put every chained method on its own line,
just like a slash-command builder. Keep nested object arguments such as `setFooter({ ... })`
expanded. Reply and edit payloads also remain multiline even if they have only one field.
Mention users with `${interaction.user}` and `${user}` when the message intends a Discord tag;
use `.username` only where plain text is intended. Discord-facing descriptions and footers
are Vietnamese; internal log messages are English. Use a targeted `// prettier-ignore` if
formatting would collapse either expression.

### Parenthesized objects, including one-property objects

Wrong:

```text
await interaction.reply({ content: 'Xong rồi!' });
const names = members.map(({ name }) => name);
const output = members.map(() => ({ name: 'Cuong' }));
```

Right:

```ts
// prettier-ignore
await interaction.reply({
  content: 'Xong rồi!',
});

// prettier-ignore
const names = members.map(({
  name,
}) => name);

// prettier-ignore
const output = members.map(() => ({
  name: 'Cuong',
}));
```

Why: the owner wants the braces of any `({ ... })` expression to stay on separate lines,
regardless of length. This convention also covers callback destructuring and objects returned
from arrow functions. Prettier normally collapses short expressions; add a targeted ignore
comment as shown, then verify the formatted file.

### Block bodies and external data types

Wrong:

```text
if (!response.ok) return undefined;
const payload: any = await response.json();
return payload.data.url;
```

Right:

```ts
if (!response.ok) {
  throw new Error(`External service returned ${response.status}`);
}

const payload: unknown = await response.json();
if (
  typeof payload !== 'object' ||
  payload === null ||
  !('data' in payload) ||
  typeof payload.data !== 'object' ||
  payload.data === null ||
  !('url' in payload.data) ||
  typeof payload.data.url !== 'string'
) {
  throw new Error('External service returned an invalid response');
}

return payload.data.url;
```

Why: an API can return an error page or a changed schema while TypeScript still believes a cast.
Validate only the fields the feature needs. If the shape is reused, put the type and guard in a
feature-specific type/adapter module instead of repeating them in every handler.

### Core ownership versus command customization

Wrong:

```text
// A different command reaches into another command's private utility.
import { callModel } from '../../commands/gemini/main/client.ts';
```

Right:

```ts
import { generateWithModelFallback } from '../../core/gemini/fallback.ts';

const { result } = await generateWithModelFallback((modelId) =>
  ai.models.generateContent({
    model: modelId,
    contents: featurePrompt,
  }),
);
```

Why: `core` owns the reusable model-selection policy; the command owns `featurePrompt` and its
Discord reply. Follow the same pattern for a new tool:

1. Define a stable operation and its inputs/outputs in `src/core/<tool_name>/`.
2. Put shared client setup, credentials, retry/timeout, validation, and tool-level errors there.
3. Export a small API that does not require a Discord interaction type.
4. Import it from each command, then apply command-specific prompts, options, limits, and embeds.
5. Keep the dependency direction one-way: command → core. Do not import command code from core.

If only one command uses an endpoint and no reusable service exists, its adapter can remain
feature-local. Do not force every HTTP call through a new core package.

### Command entry and subcommand routing

Wrong:

```text
// index.ts mixes a long API call, parsing, Mongo writes, and embed construction
// inside every switch branch.
async execute(interaction) { /* 200 lines of unrelated work */ }
```

Right:

```ts
async execute(interaction) {
  switch (interaction.options.getSubcommand()) {
    case 'latest':
      return handleLatestSubcommand(interaction);
    case 'status':
      return handleStatusSubcommand(interaction);
    default:
      throw new Error('Unexpected subcommand');
  }
},
```

Why: `index.ts` shows the public command contract and routing; the handlers own the feature
behavior. A small command such as `/ping` can still keep its entire `execute` inline. Do not
split simple code just to imitate a directory template.

### Interaction acknowledgement and user-visible errors

Wrong:

```text
const data = await slowApiCall();
await interaction.reply({ content: data });
await interaction.reply({ content: 'Done' });
```

Right:

```ts
await interaction.deferReply();

try {
  const data = await slowApiCall();
  // prettier-ignore
  await interaction.editReply({
    content: data,
  });
} catch (error) {
  // prettier-ignore
  logger.error(
    {
      err: error,
      command: interaction.commandName,
    },
    'Failed to fetch command data',
  );
  // prettier-ignore
  await interaction.editReply({
    content: 'Không thể lấy dữ liệu lúc này. Vui lòng thử lại sau.',
  });
}
```

Why: Discord interactions have a response deadline, and an interaction cannot receive two
initial replies. A slow operation should be deferred before it begins. The raw error belongs in
server logs; the Discord message is safe and Vietnamese. For a short validation failure before
deferring, reply once with `flags: MessageFlags.Ephemeral`.

### Server logs versus Discord replies

Wrong:

```text
console.error('Lỗi API', error);
await interaction.reply({ content: error.stack });
```

Right:

```ts
// prettier-ignore
logger.error(
  {
    err: error,
    userId: interaction.user.id,
    command: interaction.commandName,
  },
  'External API request failed',
);

// prettier-ignore
await interaction.reply({
  content: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  flags: MessageFlags.Ephemeral,
});
```

Why: technical logs stay server-side, in English, with structured context. Users receive one
consistent Vietnamese error. A command may choose a more specific Vietnamese explanation for a
known failure, but it must not expose credentials, HTTP bodies, internal paths, or stack traces.
The existing Discord usage-log channel is not a place for new raw exception output.

### Atomic MongoDB state transitions

Wrong:

```text
const user = await model.findOne({ userId });
if (user && user.balance >= stake) {
  await model.updateOne({ userId }, { $set: { balance: user.balance - stake } });
}
```

Right:

```ts
// prettier-ignore
const user = await model.findOneAndUpdate(
  {
    userId,
    balance: { $gte: stake },
  },
  {
    $inc: { balance: -stake },
  },
  {
    returnDocument: 'after',
  },
);

if (!user) {
  return replyInsufficientBalance(interaction, stake);
}
```

Why: two simultaneous commands can both read the same old balance. Put the affordability check
and update in one database operation. For multi-step rewards or settlements, also plan for
retries, idempotency, and process shutdown. Read the existing coin settlement and daily claim
paths before changing balance logic.

### HTTP input and status handling

Wrong:

```text
const response = await fetch('https://api.example.com/search?q=' + query);
const data = await response.json();
```

Right:

```ts
const url = new URL('https://api.example.com/search');
url.searchParams.set('q', query);

const response = await fetchWithTimeout(url);
if (!response.ok) {
  throw new Error(`Search API returned ${response.status}`);
}

const data: unknown = await response.json();
```

Why: query parameters must be encoded, slow requests must have a timeout, and non-2xx responses
are not successful payloads. The `unknown` result still needs narrowing before use. Do not
blindly retry POST or another operation that can create duplicate external state.

### Vietnam calendar dates

Wrong:

```text
const today = new Date().toISOString().slice(0, 10);
```

Right:

```ts
const today = getVietnamDateParts(new Date()).dateStr;
```

Why: UTC can already be tomorrow or still yesterday relative to Vietnam. For a stored instant,
use a real `Date`; for a Vietnam calendar day, use the timezone helper. Do not apply
`getVNTimeNow()` plus another seven-hour offset: that helper already shifts the timestamp for
legacy storage/display paths.

### Change scope and verification

Wrong:

```text
Run a repository-wide formatter, rename unrelated modules, and start the bot to see whether
the new command compiles.
```

Right:

```text
Inspect the changed files and existing worktree edits. Make the requested edit. Run typecheck,
lint, and a formatting check for the affected scope. Review the final diff. Use a real bot run
only when runtime verification is needed and the required external state is available.
```

Why: running the bot can write global command definitions to Discord, while broad formatting
can obscure the requested change and disturb the user's work. The CI workflow currently runs
typecheck before building the Docker image; local lint and format checks are additional gates.
