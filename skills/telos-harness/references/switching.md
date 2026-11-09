# Switch to another harness

Handle `switch`, `switch <harness>`, and equivalent natural requests using the existing Telos setup and launch paths. This is a handoff to another session, not a model change in the current harness.

## Choose and inspect

If the target is missing, offer the harnesses in the skill's reference table and ask which one to use. Mark a harness installed only after checking its executable or native app. Recognize the names in that table, including Claude Code; ask about an unknown target rather than guessing a command. If the target is already the active harness, say so and retain the session unless the user requests a new one. Cancellation makes no changes.

Inspect only the target's relevant native configuration and effective profile overrides. Check whether it already has the intended Telos connection without displaying credential values. An installed executable alone does not establish a connection. Preserve the target's saved provider, model, permissions and account; do not copy the source harness's key or defaults. Keep the current project directory and any explicitly selected target profile.

## Prepare the handoff

Use the current conversation to provide a short continuation prompt with the user's goal, decisions, relevant files, changes already made, checks performed and the next unfinished step. Omit secrets and irrelevant personal context. Provide it inline by default; write a handoff file only if requested. Do not commit, stash, reset or modify project files merely to switch. The shared working tree already contains local changes. When there is no unfinished task, no summary is needed.

## Start the destination

For an installed and configured target, give its ordinary native launch command, resolved to the actual executable when it is not on PATH. OpenClaw uses `openclaw chat`. Tell the user to run it from the current project in a separate terminal and paste the continuation prompt. Keep the current session available. Do not run an interactive harness inside a shell tool, nest it in the current TUI, kill the current process, or claim a session has opened without observing it.

If the user requests a skill refresh, use the existing installer’s `launch <harness> --skills-url <bundle-url>` mode from the same release/environment. Pass native arguments after `--`. This mode refreshes skills without changing native provider settings or requesting consent. Do not manufacture session import or resume flags.

For a missing harness or missing Telos connection, follow this skill's first-connection flow using the same Telos environment. Give the existing generated setup command with the explicit target harness. Run it in the user's terminal, where installation, consent and terminal input work normally. The existing installer provisions missing harnesses; do not build an alternate installer or reuse another harness's grant. If setup is required, state that before claiming the target is ready.

Explain that native history stays in the original harness. Telos memory is available only according to the target's existing authorized connection and memory settings; do not promise that it contains the current task or enable additional sync as part of switching.
