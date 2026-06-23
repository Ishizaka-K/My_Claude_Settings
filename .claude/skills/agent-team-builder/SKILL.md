---
name: agent-team-builder
description: タスク内容に応じて複数 agent のチームを選び、並列実装やレビューに割り当てる。
---

# Agent Team Builder Skill

タスク分解後、task の性質に応じて実装 agent と reviewer agent を組み合わせる。

## 目的

- 固定 agent だけでなく、技術領域に合った reviewer を選ぶ。
- 並列実装時に、task ごとの担当範囲とレビュー観点を明確にする。
- 過剰な agent 起動を避け、必要な専門性だけを足す。

## 利用可能な主要 agent

- `task-planner-reviewer`: タスク分解とタスクレビュー
- `codex task-worker`: task 単位実装
- `task-review-agent`: task 単位実装レビュー
- `integration-review-agent`: 統合レビュー
- `android-kotlin-reviewer`: Android Kotlin / Compose
- `ios-swiftui-reviewer`: SwiftUI / iOS
- `python-reviewer`: Python
- `rails-reviewer`: Ruby on Rails
- `security-reviewer`: セキュリティ

## 選定ルール

- 1 task に必ず Codex task worker を割り当てる。
- すべてのCodex worker/reviewerは`codex-dispatch`のBackground Completion Protocolに従って起動・回収する。
- 1 task に必ず `task-review-agent` を割り当てる。
- 技術領域が明確な場合は、対応する専門 reviewer を追加する。
- 認証、認可、秘密情報、課金、外部入力を扱う場合は `security-reviewer` を追加する。
- 1 task に追加する専門 reviewer は原則 2 つまでにする。
- 全 task 完了後は `integration-review-agent` を使う。

## 出力

`docs/tasks/<run-id>/TaskN.md` の各 task に `Agent Assignment` を追加する。

```md
#### Agent Assignment

- Implementation: codex task-worker
- Primary Review: Codex reviewer
- Review Input Support: task-review-agent
- Specialist Review:
  - python-reviewer
  - security-reviewer
```

## 注意

- agent を増やしすぎるとレビューが重くなり、判断が散る。
- 専門 reviewer は task のリスクに応じて選ぶ。
- 同じ task に複数 reviewer を使った場合、Claude が指摘を統合し、重複や矛盾を整理してユーザーに出す。
