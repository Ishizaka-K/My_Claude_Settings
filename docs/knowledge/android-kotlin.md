# Android Kotlin アプリ開発の普遍知識

## 基本方針

Android アプリは、ライフサイクル、状態、非同期処理、端末差分の影響を強く受ける。画面、状態、ドメイン、データ取得を分け、テスト可能で保守しやすい構成を優先する。

## 推奨アーキテクチャ

- UI layer は画面表示とユーザーイベントの受付を担う。
- ViewModel は UI state を保持し、UI event をアプリケーション処理に変換する。
- Domain layer は必要な場合だけ置き、複数 ViewModel や複雑なビジネスルールを共有する。
- Data layer は repository を通じて、API、DB、DataStore などのデータ源を隠蔽する。
- 依存方向は UI から domain/data の抽象へ向け、UI が具体的な永続化や通信詳細を直接扱わない。

## Kotlin

- nullable を型で表現し、`!!` は原則避ける。
- `data class` は値オブジェクト、UI state、DTO に使う。
- sealed interface/class は状態やイベントの有限集合に使う。
- coroutine は structured concurrency を意識し、スコープを明確にする。
- Flow は継続的な状態やストリームに使い、一回限りの結果と混同しない。

## Jetpack Compose

- Composable は可能な限り stateless にし、状態は上位に hoist する。
- UI state は単一の state object として渡すと、画面の状態が追いやすい。
- Composable 内で重い処理や副作用を直接実行しない。
- `remember`、`LaunchedEffect`、`DisposableEffect` はライフサイクルとキーを明確にする。
- Preview しやすいように、画面本体とデータ取得を分離する。

## 非同期とライフサイクル

- ViewModel 内の処理は `viewModelScope` を使う。
- 画面側の Flow 収集はライフサイクルを考慮する。
- Activity/Fragment/Composable に長寿命の処理を持たせない。
- 再作成、バックグラウンド復帰、設定変更で状態が破綻しないか確認する。

## データ永続化

- 小さな設定値は DataStore を検討する。
- 構造化データや検索が必要なローカルデータは Room を検討する。
- ネットワークとローカルキャッシュは repository で統合する。
- オフライン対応が必要な場合は、同期方針、競合、失敗時の再試行を設計する。

## テスト

- ViewModel は fake repository でテストする。
- ドメインロジックは Android 依存から切り離して単体テストする。
- Compose UI は意味のある test tag やアクセシビリティ情報を使って検証する。
- coroutine/Flow のテストでは dispatcher と時間制御を明示する。

## 参照

- Android app architecture: https://developer.android.com/topic/architecture
- Thinking in Compose: https://developer.android.com/develop/ui/compose/mental-model

