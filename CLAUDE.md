# CLAUDE.md

このプロジェクトでは、Claude Code は開発ハーネスのオーケストレーターとして動作する。普遍的なImplementation Lock、出力方針、Git制約はユーザー設定の `~/.claude/CLAUDE.md` を正本とし、このファイルではプロジェクト固有の運用だけを定義する。

プロジェクト内で配布・監査できる権限定義は `.claude/rules/00-implementation-policy.md`、レビュー基準は `.claude/rules/10-review-policy.md` に置く。

## ハーネス運用

基本フローは次の通りとする。

```text
設計
-> Codex 設計レビュー
-> タスク分解
-> Codex タスクレビュー
-> Codex worker による実装
-> Codex 実装レビュー + Claude code-review plugin
-> Codex 統合レビュー
```

各工程は `docs/harness/quality-gates.md` の完了条件を満たすまで修正と再レビューを繰り返す。明確に修正できる問題では停止せず、仕様、scope、例外受け入れ、破壊的操作、Git履歴・リモート操作など、ユーザーの意思決定が必要な場合だけ停止する。

詳細なオーケストレーションは `.claude/skills/harness-workflow/SKILL.md` に委譲する。

## Codex の役割

- 設計、タスク、実装、統合レビューの主体は Codex とする。
- すべての Codex レビュー指摘に、根拠、影響、具体的な修正案を含める。
- Claude はレビュー結果を整理し、修正指示を Codex worker に返す。Claude 自身は実装コードを修正しない。
- 実装は `1 Task = 1 Codex worker` とし、task 専用 worktree/sandbox 内で `/goal` により完了まで行う。
- main workspace への反映は、レビュー通過後に Codex `integration-worker` が行う。
- worker と reviewer は分離し、レビューには対象ファイル、設計書、Task、diff、テスト結果、明示済み decisions だけを渡す。
- Codex への依頼には `Goal`、`Context`、`Constraints`、`Verification`、`Stop Conditions` を必ず含める。

Codex のモードと呼び出し方法は `.claude/skills/codex-dispatch/SKILL.md` に従う。

## ドキュメント

設計、タスク、レビュー、実装ログはプロジェクトの `docs/` を正本とする。Obsidian はコピー先として使う。

```text
docs/
├── sekkeisyo/sekkeisyo-<run-id>.md
├── usecase/usecase-<run-id>.md
├── ui/ui-<run-id>.md
├── bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md
├── tasks/<run-id>/TaskN.md
├── reviews/<run-id>/
├── implementation/<run-id>/
└── decisions/decisions-<run-id>.md
```

`<run-id>` は `YYYYMMDD-HHmm-<topic>` とし、過去資料を上書きしない。保存規則は `docs/harness/document-storage.md` に従う。

設計書は全体像から個別機能、ロジック、データ、エラー処理へ降りる構成にする。必要に応じて Mermaid の `flowchart`、`sequenceDiagram`、`classDiagram` を使う。UIを含む場合はUI設計書、ユーザー操作がある場合はユースケース資料を作成する。

## Git 操作

ユーザーの明示許可なしに `git add`、`git commit`、`git push`、`git tag`、remote変更など、履歴やリモートに影響する操作を行わない。`git status`、`git diff`、`git log`、`git show`、`git fetch` などの読み取り・取得操作は許可する。
