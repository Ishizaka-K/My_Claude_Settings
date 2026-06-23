# Harness Agents

タスク分解後に、複数 agent で並列実装とレビューを行うための agent 定義。

## Agents

- `.claude/agents/task-planner-reviewer.md`
  - 設計書からタスク分解を作成し、Codexレビュー用の材料を整理する。
- `codex task-worker`
  - 各タスクを専用 worktree/sandbox で `/goal` により完了まで実装する。
- `.claude/agents/task-review-agent.md`
  - 各タスクの実装について、Codexレビュー用の材料と補助観点を整理する。
- `.claude/agents/integration-review-agent.md`
  - 複数タスクの実装結果について、Codex統合レビュー用の材料と補助観点を整理する。
- `.claude/agents/android-kotlin-reviewer.md`
  - Android Kotlin / Jetpack Compose 実装を専門レビューする。
- `.claude/agents/ios-swiftui-reviewer.md`
  - SwiftUI / iOS 実装を専門レビューする。
- `.claude/agents/python-reviewer.md`
  - Python アプリ実装を専門レビューする。
- `.claude/agents/rails-reviewer.md`
  - Ruby on Rails 実装を専門レビューする。
- `.claude/agents/security-reviewer.md`
  - 認証、認可、秘密情報、入力検証を専門レビューする。

## Flow

```text
Design
  -> task-planner-reviewer
      -> docs/tasks/<run-id>/Task*.md
  -> Codex task review
      -> revise until gate passes
  -> Codex task-worker per task, parallel by wave
      -> docs/implementation/<run-id>/TaskN.md
      -> docs/implementation/<run-id>/TaskN.diff.patch
  -> task-review-agent prepares inputs
  -> Codex implementation review + code-review plugin
      -> docs/reviews/<run-id>/implementation-review-TaskN.md
      -> revise until gate passes
  -> integration-review-agent prepares inputs
  -> Codex integration review
      -> docs/reviews/<run-id>/integration-review.md
  -> User Decision only when required
```

## Parallelization Rules

- 並列実装は `docs/tasks/<run-id>/README.md` または各 Task の `Parallelization Plan` に従う。
- 同じ wave の task は同時に実装してよい。
- 前 wave の成果物に依存する task は、前 wave のレビュー後に開始する。
- `Owned Files` が重なる task は原則として同じ wave に入れない。
- 共有ファイルの変更は、基盤 task として先に実装する。
- 各 implementation agent は、他 agent の変更を戻してはいけない。
- 各 review agent は、担当 task の成果物だけでなく、設計書と task 定義に照らして判断する。
- すべての実装taskで、`docs/harness/worktree-parallel.md` に従ってtaskごとに専用worktreeを使う。
- 各フェーズの進行可否は `docs/harness/quality-gates.md` に従う。

## User Decision Points

明確に修正できる問題はCodex workerへ返して再レビューする。仕様、scope、例外受け入れ、破壊的操作など、ユーザー判断が必要な場合だけ確認する。

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を docs/decisions/decisions-<run-id>.md に残して次へ進む
```
