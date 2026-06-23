---
paths:
  - "**/*.swift"
---

# iOS SwiftUI Rules

- SwiftUI の View は状態から UI を導出し、副作用を詰め込まない。
- `@State`、`@Binding`、共有状態の役割を分ける。
- API、永続化、Keychain、UserDefaults などは View から直接扱わず境界を作る。
- Optional の強制 unwrap は原則避ける。
- async/await ではキャンセル、MainActor、エラー伝播を意識する。
- Dynamic Type、VoiceOver、ダークモード、Safe Area を壊さない。
- 重要なドメインロジックと state holder は UI から切り離してテストする。

