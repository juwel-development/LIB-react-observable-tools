---
name: keep-awake
description: Keep the Mac awake with `caffeinate`. Use when the user wants to stop the machine sleeping or the screen switching off, keep a long job running unattended, or let it sleep again.
argument-hint: "how long, or what to stay awake for"
---

Wakefulness is held by a live `caffeinate` process, and it lasts exactly as long as that process does. Give every one a **leash** — the thing that ends it — so it can't outlive the work it was started for.

## Starting

1. **Pick the leash** from what the user asked for, in this order of preference:

   | The request names… | Command | Leash |
   |---|---|---|
   | a command to run | `caffeinate -di <command>` | the command's own lifetime |
   | a running process | `caffeinate -di -w <pid>` | that process exiting |
   | a duration | `caffeinate -di -t <seconds>` | the timeout |

   Wrapping a command is best — it cannot outlive its reason to exist. A bare duration is the fallback. If the request names no bound at all, use one hour and say so in your report.

   `-di` holds the display on as well as the system. Drop to `-i` when the user is happy for the screen to switch off and only wants the machine to keep working.

2. **Look for an existing hold** with `pgrep -lf caffeinate`. If one is already running, report it and ask whether to replace it — a second one just makes two things to remember to kill.

3. **Start it in the background** so it keeps holding while you carry on, and capture its pid.

4. **Confirm the hold is real**: `pmset -g assertions` lists a `PreventUserIdleSystemSleep` (and `PreventUserIdleDisplaySleep` for `-di`) assertion attributed to `caffeinate`. If the assertion is absent, the hold failed — say so rather than reporting success.

5. **Report** what is held, what the leash is, and the exact `kill <pid>` that ends it early.

## Letting it sleep again

Kill the pid you started; fall back to the pids from `pgrep -f caffeinate` if you no longer have it. Then read `pmset -g assertions` again and confirm no `caffeinate` assertion remains before telling the user the Mac can sleep.

## Limits worth stating up front

- **The lid wins.** Closing it sleeps the Mac regardless; `caffeinate` does not override clamshell sleep. Staying awake with the lid shut needs AC power plus an attached external display.
- **`-s` needs AC power.** It is ignored on battery, so `-i` is the flag that actually does the work when unplugged.
- **The hold dies with this session.** A backgrounded `caffeinate` is a child of this session and goes when the session does. For a hold that survives, have the user run it themselves — they can type `! caffeinate -di -t 7200` in the prompt.
