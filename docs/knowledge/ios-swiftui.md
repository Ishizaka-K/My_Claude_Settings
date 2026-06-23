# iPhone SwiftUI アプリ開発の普遍知識

## 基本方針

SwiftUI は宣言的 UI と状態駆動の設計を前提にする。View は状態から UI を導出し、副作用、永続化、通信、複雑な判断は View の外に出す。

## 構成

- `App` はエントリーポイントと依存注入の起点にする。
- `View` は表示とユーザー操作の入口に集中する。
- `Observable` な state holder や ViewModel は画面状態と操作を管理する。
- Model はドメイン上の値やルールを表す。
- Service/Repository は API、DB、Keychain、UserDefaults などの詳細を隠蔽する。

## SwiftUI の状態

- `@State` は View ローカルで短命な状態に使う。
- `@Binding` は親子 View 間で状態を共有する。
- 共有状態は専用の state holder に寄せる。
- View の再生成を前提にし、初期化や副作用に依存しすぎない。
- 画面遷移、モーダル表示、エラー表示も状態として表現する。

## Swift

- Optional は早めに安全に解決し、強制 unwrap は避ける。
- 値型を優先し、参照型は共有状態やライフサイクルが必要な場合に使う。
- protocol はテスト差し替えや境界分離に使う。
- async/await ではキャンセル、MainActor、エラー伝播を意識する。
- UI 更新はメインスレッド上で行う。

## UI

- 小さな View に分けるが、分割単位は再利用性より読みやすさを優先する。
- Dynamic Type、VoiceOver、色覚特性、ダークモードを前提にする。
- 端末サイズ、向き、Safe Area、キーボード表示で崩れないようにする。
- UIKit 連携は必要な箇所に限定し、境界を明確にする。

## データとセキュリティ

- 秘密情報やトークンは Keychain を検討する。
- 軽い設定値は UserDefaults、構造化データは SwiftData/Core Data などを検討する。
- API 通信は DTO とドメインモデルを分ける。
- エラーはユーザー向けメッセージと開発者向けログを分ける。

## テスト

- ドメインロジックと state holder は UI から切り離してテストする。
- API、時計、UUID、永続化は差し替え可能にする。
- UI テストは主要フローに絞り、壊れやすい細部に依存しすぎない。

## 参照

- SwiftUI documentation: https://developer.apple.com/documentation/swiftui
- SwiftUI tutorials: https://developer.apple.com/tutorials/swiftui-concepts

