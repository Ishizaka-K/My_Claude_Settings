---
paths:
  - "**/*.kt"
  - "**/*.kts"
  - "**/build.gradle"
  - "**/build.gradle.kts"
---

# Android Kotlin Rules

- Android 実装では、UI、ViewModel、domain、data の責務を分ける。
- Composable は可能な限り stateless にし、状態は上位に hoist する。
- ViewModel は UI state を保持し、UI event を処理する。
- repository は API、DB、DataStore などの詳細を隠蔽する。
- `!!` は原則使わず、nullable を安全に処理する。
- coroutine/Flow はライフサイクルとスコープを明確にする。
- Activity、Fragment、Composable に長寿命の処理や重い副作用を置かない。
- テストでは ViewModel、domain、repository 境界を優先して確認する。

