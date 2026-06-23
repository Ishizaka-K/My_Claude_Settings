# Quality Gates

ハーネスの各フェーズで、曖昧なまま次に進まないための gate を定義する。

## 基本原則

- 各フェーズの成果物は、次工程に進む前に gate を通す。
- High 指摘がある場合は、原則として自動で修正して再レビューする。
- Medium 以下は、ユーザー判断で `docs/decisions/decisions-<run-id>.md` に残して進めてもよい。
- 判断を保留したまま実装に進まない。
- workflow 実行中は、完了条件を満たすまで loop する。
- ユーザーの意思決定が必要なときだけ停止する。
- Codex レビューが必要な gate では、Codex をレビュー主体とする。
- Codex の finding には、根拠、影響、修正案、可能な修正例が必要。

## Loop Rule

各フェーズは次の loop で進める。

```text
produce
-> review
-> gate
-> revise
-> review again
```

停止するのは、ユーザー判断が必要な場合だけにする。

## Requirement Gate

設計前に、要件の明確さを 10 点満点で確認する。

- 目的が明確: 0-3
- 期待する成果物が明確: 0-3
- 対象範囲と非対象範囲が明確: 0-2
- 制約と前提が明確: 0-2

判定:

- 7 点以上: 設計へ進む。
- 6 点以下: 不明点を質問する。

## Design Review Gate

設計レビュー後の判定。

- Codex による独立設計レビューを必ず実行している。
- High あり: 設計を修正して再レビューする。
- Medium のみ: ユーザーに修正するか、decisions に残して進むか確認する。
- Low のみ、または重大な問題なし: タスク分解へ進める。

設計書の品質確認:

- 全体像から詳細へ読める構成になっている。
- 主要な構造、処理フロー、シーケンスが Mermaid で示されている。
- 必要に応じて classDiagram などで責務と依存関係が示されている。
- ユーザー操作を起点にしたユースケースごとの流れが `docs/usecase/usecase-<run-id>.md` に整理されている。
- Mermaid がない場合は、文章だけで十分に理解できる理由がある。
- UI を含む案件では `docs/ui/ui-<run-id>.md` が作成され、画面、遷移、状態、アクセシビリティ、UIテスト観点が定義されている。
- UI 非対象の場合は、その理由が設計書に記録されている。

## Bug Fix Gate

バグ修正後の判定。

- Codex の read-only 原因調査結果がある。
- Claude が `docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md` に原因と修正方針を記録している。
- 実装担当とは別の Codex reviewer が修正をレビューしている。
- Claude 側の code-review プラグインを実行している。
- 元の不具合が再現しない。
- 再現テストまたは回帰テストが通る。
- High 指摘がなくなるまで修正とレビューを loop している。

## Task Review Gate

タスクレビュー後の判定。

- Codex による独立タスクレビューを必ず実行している。
- High あり: タスク分解を修正して再レビューする。
- 並列化リスクが高い: wave 分割、Owned Files、Dependencies を見直す。
- Medium 以下: ユーザー判断で進める。

## Implementation Review Gate

task 単位レビュー後の判定。

- Codex による独立実装レビューを実行している。
- Claude 側の code-review プラグインを実行している。
- High あり: 同じ task の実装を修正して再レビューする。
- Scope 違反あり: 担当範囲を戻すか、タスク分解を更新する。
- Medium 以下: ユーザー判断で次 task または次 wave に進める。

実装レビューでは完全性を優先する。トークン節約より、Codex レビューと code-review プラグインの両方を通すことを優先する。

## Integration Review Gate

統合レビュー後の判定。

- Codex を統合レビューの主体として呼び出している。
- `integration-review-agent` で task 間リスクと入力材料を整理している。
- Codex の finding には、根拠、影響、修正案、可能な修正例が含まれている。
- High あり: 対象 task に戻して修正する。
- task 間 interface 不整合あり: 統合修正 task を追加する。
- テスト不足が主要フローに影響する: テスト追加後に再レビューする。
- Medium 以下: ユーザー判断で完了または追加改善へ進む。

## User Decision Format

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を docs/decisions/decisions-<run-id>.md に残して次へ進む
```
