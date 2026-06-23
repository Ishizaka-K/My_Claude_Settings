---
name: harness-implement
description: 設計書とタスク分解に従ってタスク単位で実装する。ユーザーが「実装して」「タスクを実装」「このタスクを進めて」と依頼したときに使う。
---

# Harness Implement Skill

レビュー済みのタスク分解に従い、タスク単位で実装する。

## Agent-based Parallel Implementation

タスク分解後の実装は、必ず 1 Task = 1 Codex worker で行う。

- `.claude/agents/task-review-agent.md`
- `.claude/agents/integration-review-agent.md`

全体の運用は `docs/harness/agents.md` に従う。

複数 agent が同時に実装する場合も、`docs/harness/worktree-parallel.md` に従って task ごとに専用 worktree を使う。

1タスクにつき1つの Codex worker で実装し、`docs/harness/codex-task-workers.md` に従う。

Codex worker は task 専用 worktree/sandbox 内で `/goal` を使って task 完了まで実装する。main workspace への反映は Codex `integration-worker` が行う。

## 入力

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/tasks/<run-id>/TaskN.md`
- `docs/usecase/usecase-<run-id>.md` があれば確認する
- `docs/reviews/<run-id>/task-review.md`
- `docs/decisions/decisions-<run-id>.md` があれば確認する
- 実装対象タスク ID

## 手順

1. 対象タスクの目的、境界、対象ファイル、完了条件を確認する。
2. 既存コードを読み、既存の設計、命名、テスト方針に合わせる。
3. 変更前に実装方針を短く説明する。
4. 対象タスクの境界を超える変更を避ける。
5. 必要なコード、テスト、ドキュメントだけを変更する。
6. テストまたは静的チェックを実行する。
7. 実装ログを `docs/implementation/<run-id>/TaskN.md` に記録する。
8. 次に `harness-review` で実装レビューを行うよう案内する。

## 複数 Agent 実装手順

1. `docs/tasks/<run-id>/TaskN.md` と `docs/tasks/<run-id>/README.md` があれば `Parallelization Plan` を確認する。
2. `docs/harness/worktree-parallel.md` に従い、task ごとに専用 worktree/sandbox を用意する。
3. worktree 間で `Owned Files` が重ならないことを確認する。
4. wave ごとに Codex worker を task 数分起動する。
5. 各 worker には担当 task ID、Owned Files、Out of Scope、Verification を明示する。
6. Codex worker には `Goal`、`Context`、`Constraints`、`Verification`、`Stop Conditions` を必ず渡す。
7. Codex workerはBash toolの`run_in_background: true`で起動し、`codex-dispatch`のBackground Completion Protocolに従って完了通知と結果を回収する。
8. 各 worker の実装完了後、task ごとに `task-review-agent`、Codex 独立レビュー、Claude 側の code-review プラグインを起動する。
9. レビューが `revise` の場合は、同じ task の Codex worker に指摘を戻す。Claude はコードを修正しない。
10. Task の Implementation Review Gate を満たすまで、実装とレビューを loop する。
11. task 単位のレビューが通ったら、Claude は Codex `integration-worker` を起動し、Codex に main workspace へ統合させる。
12. 全 wave 完了後、`integration-review-agent` で統合レビューを行う。
13. 統合レビューで明確な修正が必要な場合は、修正 task を作って実装 loop に戻す。
14. ユーザー判断が必要な場合だけ、修正するか decisions に残して進むか確認する。

## 実装ログフォーマット

```md
## <task-id>: <task title>

### 変更概要

### 変更ファイル

### 設計書との対応

### タスク境界

### テスト結果

### 未対応事項
```

## 方針

- モダンな実装にするが、既存プロジェクトの文脈を優先する。
- クリーンアーキテクチャを意識し、責務の向きと依存方向を崩さない。
- 1タスクの変更量が大きくなりすぎる場合は、実装前に分割を提案する。
- レビュー指摘を修正する場合は、指摘 ID と対応内容を実装ログに残す。
- unrelated な変更、不要な整形、広範囲のリネームは避ける。
- 実装レビューでは、Codex 独立レビューと code-review プラグインの両方を必ず通す。
- Codex worker に実装させる場合でも、`git add`、`git commit`、`git push` は許可しない。
- Codex worker と Codex reviewer は分ける。
- Claude はプロダクトコード、テスト、設定を直接編集しない。
- Codex worker が失敗した場合、Claude は代替実装せずユーザーへ報告する。
