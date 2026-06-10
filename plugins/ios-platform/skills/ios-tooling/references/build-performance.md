# Build Performance

Systematic Xcode build performance analysis and optimisation. Measure before optimising, then target the critical path first.

## Build Timeline (Xcode 14+)

The Build Timeline shows task parallelism and idle gaps visually.

**Access**:
1. Build the project (Cmd+B).
2. Open Report Navigator (Cmd+9).
3. Select the latest build.
4. Show Assistant Editor (Cmd+Option+Return) -- the timeline appears alongside the build log.

### Critical Path

The critical path is the longest chain of dependent tasks. It defines the shortest possible build time regardless of CPU cores. All optimisation effort should target this chain.

**What to look for**:
- Empty vertical space -- cores idle waiting for inputs. Break the dependency that blocks them.
- Long horizontal bars -- single slow tasks. Investigate individually.
- Serial target builds -- targets queued when they could run in parallel.

### Parallel Builds

Enable in scheme: Product -> Scheme -> Edit Scheme -> Build -> Parallelize Build. Only truly independent targets benefit; do not remove legitimate dependencies to force parallelism.

## Bottleneck Decision Tree

When build times are slow, identify the dominant phase first:

```
Is "Compile Swift sources" the longest phase?
├─ YES → Check type-checking warnings (below)
└─ NO
   Is linking slow?
   ├─ YES → Check link dependencies, reduce linked frameworks
   └─ NO
      Are build phase scripts slow?
      ├─ YES → Guard scripts with configuration checks (below)
      └─ NO → Check parallelisation (Build Timeline gaps)
```

Extract phase times from the build log or use Product -> Perform Action -> Build with Timing Summary.

## Type-Checking Warnings

When "Compile Swift sources" dominates build time, find the slow functions:

```swift
// Add to Debug → Other Swift Flags
-warn-long-function-bodies 100
-warn-long-expression-type-checking 100
```

Build, and Xcode emits warnings like:

```
MyView.swift:42: Function body took 247ms to type-check (limit: 100ms)
```

**Common slow patterns**:
- Chained operations without intermediate type annotations.
- Deeply nested closures.
- Large dictionary/array literals.
- Operator overloading in complex expressions.

**Fix**: break chains into steps with explicit types.

```swift
// Slow (247ms) -- compiler infers every intermediate type
items.filter { $0.isActive }.map { $0.price * $0.quantity }.reduce(0, +)

// Fast (12ms) -- explicit intermediates
let active: [Item] = items.filter { $0.isActive }
let prices: [Double] = active.map { $0.price * $0.quantity }
let total: Double = prices.reduce(0, +)
```

### Advanced: Per-Function Timing

```bash
xcodebuild clean build -scheme YourScheme \
  OTHER_SWIFT_FLAGS="-Xfrontend -debug-time-function-bodies" 2>&1 | \
  grep ".[0-9]ms" | sort -nr | head -20
```

## Compilation Mode

| Configuration | Setting | Why |
|---|---|---|
| **Debug** | `singlefile` (Incremental) | Only recompiles changed files |
| **Release** | `wholemodule` | Maximum runtime optimisation |

Check: `grep "SWIFT_COMPILATION_MODE" project.pbxproj`

Setting Debug to `wholemodule` is the single most common cause of slow incremental builds. Fix: Project -> Build Settings -> Compilation Mode -> Debug = Incremental.

**Impact**: 40-60% faster incremental debug builds.

## Build Active Architecture Only

| Configuration | Setting |
|---|---|
| **Debug** | `ONLY_ACTIVE_ARCH = YES` |
| **Release** | `ONLY_ACTIVE_ARCH = NO` |

Halves debug compile work by building only the current device's architecture.

## Debug Information Format

| Configuration | Setting |
|---|---|
| **Debug** | `dwarf` |
| **Release** | `dwarf-with-dsym` |

Skip dSYM generation in debug builds. Saves 3-5 seconds per build.

## Build Phase Scripts

Scripts that run unconditionally in debug builds (dSYM uploads, asset processing, uncached codegen) add seconds to every iteration.

**Fix**: guard with configuration checks:

```bash
if [ "${CONFIGURATION}" = "Release" ]; then
    firebase crashlytics upload-symbols
fi
```

**Script sandboxing** (Xcode 14+): enable `ENABLE_USER_SCRIPT_SANDBOXING = YES` and declare inputs/outputs explicitly. This lets the build system parallelise scripts safely. Only then enable `FUSE_BUILD_SCRIPT_PHASES = YES`.

## Compilation Caching (Xcode 26+)

Xcode 26 caches compilation results based on input content and compiler flags. Cached artifacts survive `xcodebuild clean`.

**Enable**:

```
Build Settings → COMPILATION_CACHE_ENABLE_CACHING → YES
```

Or pass on the command line:

```bash
xcodebuild build -scheme YourScheme COMPILATION_CACHE_ENABLE_CACHING=YES
```

**Current limitations**:
- SPM dependencies not yet cacheable.
- CompileStoryboard, CompileXIB, DataModelCompile, and Ld tasks not cacheable.
- First run populates the cache; benefits appear on subsequent builds.

**Impact**: 20-40% faster clean builds after cache population (up to 70% for favourable projects). Most useful in CI/CD where clean builds are common.

## Explicitly Built Modules (Xcode 16+)

Splits module compilation into three phases: scan -> build modules -> compile sources. Each phase runs in parallel within itself, and the build system knows exact dependencies.

**Enabled by default for Swift in Xcode 26.** Toggle: Build Settings -> Explicitly Built Modules.

### Module Variants

The same module can be built multiple times if targets use different settings (preprocessor macros, C language versions, ARC flags). Each variant is a separate compile task.

**Diagnose**: Build with Timing Summary (Product -> Perform Action), then filter the build log for "modules report". The report shows variant counts per module.

**Reduce variants**: unify preprocessor macros and language settings at the project or workspace level instead of per-target.

```bash
# Find macro differences across targets
grep "GCC_PREPROCESSOR_DEFINITIONS" project.pbxproj
```

**Impact**: 10-30% faster builds by eliminating duplicate module compilation.

## Automatic Build System Optimisations

These require no configuration but are worth knowing about so you don't try to replicate them manually:

- **Emit Module Separately** (Xcode 14+, Swift 5.7+): Swift modules are emitted before compilation finishes, unblocking downstream targets earlier. Reduces idle time in multi-target builds by 20-40%.
- **Eager Linking** (Xcode 14+): Linking can start before all compilation finishes if the module is ready.
- **Swift Build** (Xcode 26+): Xcode uses Swift Build (Apple's open-source build engine) for more predictable builds and better SPM integration. No configuration needed.

## Pitfalls

- **Don't optimise Release builds for speed.** Release should optimise for runtime performance, not build speed. Only optimise Debug builds for iteration speed.
- **Don't break real dependencies to force parallelism.** This causes build errors, undefined behaviour, and race conditions. Use the Build Timeline to identify genuinely independent targets.
- **Don't enable `FUSE_BUILD_SCRIPT_PHASES` without sandboxing.** Enable `ENABLE_USER_SCRIPT_SANDBOXING = YES` and fix all errors first, then enable parallel scripts.
- **Don't optimise without measuring.** Always baseline before changes, apply one change at a time, and measure after.

## Measurement

Always measure before and after, one change at a time.

```bash
# Baseline
time xcodebuild clean build -scheme YourScheme 2>&1 | tee baseline.log

# After one optimisation
time xcodebuild clean build -scheme YourScheme 2>&1 | tee optimised.log
```

Use the Build Timeline to verify: the timeline should show fewer gaps and a shorter critical path.

## Audit Checklist

**Settings**:
- [ ] Debug uses incremental compilation (`singlefile`).
- [ ] Build Active Architecture = YES for Debug.
- [ ] Debug uses DWARF (not dSYM).
- [ ] Type-checking warnings enabled; slow functions (>100ms) fixed.

**Parallelisation**:
- [ ] Parallelize Build enabled in scheme.
- [ ] No unnecessary target dependencies.
- [ ] Build phase scripts conditional or sandboxed.

**Xcode 26+**:
- [ ] Compilation caching enabled for CI/CD.
- [ ] Module variants checked and reduced.
- [ ] Explicitly Built Modules enabled (default for Swift).
