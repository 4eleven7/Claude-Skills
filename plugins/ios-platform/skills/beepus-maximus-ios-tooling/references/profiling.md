# Performance Profiling

Record Time Profiler via `xctrace`, extract samples, symbolicate, and identify hotspots -- all without opening Instruments.

## Recording

### Attach to a Running Process

Start the app yourself, then attach by PID:

```bash
xcrun xctrace record \
  --template 'Time Profiler' \
  --time-limit 90s \
  --output /tmp/App.trace \
  --attach <pid>
```

### Launch and Record

Launch the binary directly under xctrace:

```bash
xcrun xctrace record \
  --template 'Time Profiler' \
  --time-limit 90s \
  --output /tmp/App.trace \
  --launch -- /path/App.app/Contents/MacOS/App
```

Prefer the direct binary path for `--launch` to ensure the correct build is profiled.

### iOS Device Recording

```bash
# List available devices
xcrun xctrace list devices

# Record on device by UDID
xcrun xctrace record \
  --template 'Time Profiler' \
  --device <UDID> \
  --time-limit 60s \
  --output /tmp/App.trace \
  --attach <pid>
```

Launch via Xcode if needed; attach with `xctrace --attach`. Ensure debug symbols are present for meaningful stacks.

## Extracting Samples

Export time-sample data from the .trace file to XML:

```bash
scripts/extract_time_samples.py --trace /tmp/App.trace --output /tmp/time-sample.xml
```

### Direct xctrace Export

```bash
# Inspect available tables
xcrun xctrace export --input /tmp/App.trace --toc

# Export raw time-profile samples
xcrun xctrace export \
  --input /tmp/App.trace \
  --xpath '/trace-toc/run[@number="1"]/data/table[@schema="time-profile"]' \
  --output /tmp/time-profile.xml
```

Post-process in a script (Python/Rust) to aggregate stacks.

## ASLR-Aware Symbolication

ASLR randomises the load address at launch. You must capture the runtime `__TEXT` base address while the app is still running:

```bash
vmmap <pid> | rg -m1 "__TEXT" -n
```

Then symbolicate and rank hotspots:

```bash
scripts/top_hotspots.py \
  --samples /tmp/time-sample.xml \
  --binary /path/App.app/Contents/MacOS/App \
  --load-address 0x100000000 \
  --top 30
```

## Instruments UI Workflow

When CLI analysis is insufficient, open the trace in Instruments:

```bash
open -a Instruments /tmp/App.trace
```

**Template**: Time Profiler.

**Call Tree tips** (bottom pane):
- **Hide System Libraries** -- focus on your code.
- **Invert Call Tree** -- see leaf functions ranked by cost.
- **Separate by Thread** -- isolate main-thread work from background.
- Focus on hot frames and call counts, not individual sample timestamps.

**Capture strategy**: Record the slow path specifically (startup, refresh, scroll). Idle traces produce noise.

## Helper Scripts

| Script | Purpose |
|---|---|
| `scripts/record_time_profiler.sh` | Record via attach or launch (wraps xctrace). |
| `scripts/extract_time_samples.py` | Export time-sample XML from a .trace file. |
| `scripts/top_hotspots.py` | Symbolicate frames via `atos` and rank top app functions by sample count. |

## Gotchas

**Wrong app profiled**: LaunchServices may resolve the installed `/Applications` copy instead of your local build.
- Fix: use the direct binary path for `--launch`, or `--attach` with a known PID.
- Verify after launch: `ps -p <pid> -o comm= -o command=`.

**Empty trace / no samples**: App exits too quickly or never does meaningful work during capture.
- Fix: extend `--time-limit`, trigger the workload during recording (open menus, refresh data, scroll).

**Privacy prompts**: `xctrace` requires Developer Tools permission on macOS.
- Fix: System Settings -> Privacy & Security -> Developer Tools -> allow Terminal and Xcode.

**Large XML exports**: `time-profile` exports can be hundreds of megabytes.
- Fix: filter with XPath, aggregate offline in a script. Never cat or print the raw XML to terminal.

**Mismatched symbols**: Stacks show raw addresses instead of function names.
- Fix: `--binary` must point to the exact build that produced the trace. Rebuild and re-record if the binary has changed.

**xctrace help syntax**: `xcrun xctrace --help` is invalid. Use `xcrun xctrace help record` or `xcrun xctrace help export`.

## Verification Checklist

- Confirm trace process path matches target build.
- Confirm stacks show expected app frames (not just system frames).
- Capture covers the slow operation (startup, refresh, scroll).
- Export stacks for automated diffing if optimising iteratively.
