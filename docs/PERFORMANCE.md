# Performance measurements — v0.4 RC

Initiated by Firm Impulse · FIBO FRAB11. Measured 2026-11-02.

Three alternating fresh-context runs per version, same headless system Chromium 154.0.8037.57, 1440×1000, software WebGL/SwiftShader, no throttling, managed proxy, live OpenFreeMap tiles and no concurrent browser QA. Original main was served from a detached checkout on localhost:8081; final source used localhost:8082. Browser version in the JSON is authoritative. Provider/proxy cache and connection variance were uncontrolled; three samples cannot establish a causal performance improvement.

| Metric (median of three) | Original main | Release candidate |
| --- | ---: | ---: |
| Catalog ready | 690.8ms | 646.2ms |
| Map `load` event | 4,297.0ms | 4,639.6ms |
| Synchronous search/list update | 0.6ms | 0.6ms |

Map load ranges: baseline 3,296.3–4,372.8ms; final 3,744.5–6,037.6ms. All six loaded one canvas with zero uncaught application errors. The map mark is MapLibre's initial load event, not a verified geographical readiness or field-device measurement. Search times cover ten fixed input queries per run and their synchronous DOM update, not paint/input-to-next-paint latency. Optional dataset loading is independent of the core map and catalog; vendor runtime removes a CDN connection, but the live tile provider remains required.

**The approximately 3-second target was not met under these conditions.** The measured median is 4.64s. Physical mid-range Android 30 FPS, thermal behavior, GPU memory and long-duration leak/interaction targets are not measured; SwiftShader/headless results cannot substitute. Snapshot JS heaps were about 26–30MB final versus 23–27MB baseline; these are noisy snapshots and do not prove leak freedom.

Raw results: [qa/v04/performance.json](qa/v04/performance.json). Reproduce after stopping other browser workloads:

```sh
# Serve detached original main on 8081 and final source on 8082 first.
OPENMAP_CHROMIUM=/usr/bin/chromium node scripts/measure-performance.mjs \
  http://127.0.0.1:8081/ http://127.0.0.1:8082/ /workspace/work/performance.json
```

Next acceptance: Codex A/students measure actual published final SHA on documented physical mid-range Android/network conditions, including FPS during camera movement, search/share latency, repeated theme/selection cycles and foreground/background recovery. Improve only measured bottlenecks; do not inflate geometry or remove attribution/data disclosure to make a benchmark look better.

An earlier exploratory comparison before the final framing refinement measured 4.93s baseline versus 4.45s candidate. The final repeat reversed that ordering (4.30s versus 4.64s). Both raw runs are retained; provider/cache/host variation is material, so **no robust speedup is claimed**. The final measured application source is commit `bfc75647b3104a702c97e13044f1b51c86806dc1`; subsequent changes only update QA/docs/workflow release guards.
