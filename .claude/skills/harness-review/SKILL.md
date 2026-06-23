---
name: harness-review
description: 設計書、タスク分解、実装差分をレビューする。ユーザーが「レビューして」「設計レビュー」「タスクレビュー」「実装レビュー」と依頼したときに使う。
---

# Harness Review Skill

成果物を独立した観点でレビューし、次工程に進むか、修正して再レビューするかを判断できる形で報告する。

## Agent-based Review

タスク分解後のレビューでは、必要に応じて次の agent を使う。

- `.claude/agents/task-planner-reviewer.md`: タスク分解とタスクレビュー
- `.claude/agents/task-review-agent.md`: task 単位の実装レビュー
- `.claude/agents/integration-review-agent.md`: 複数 task の統合レビュー

## レビュー種別

対象ファイルやユーザーの依頼から、次のいずれかを選ぶ。

- `design-review`: 設計書レビュー
- `task-review`: タスク分解レビュー
- `implementation-review`: 実装レビュー
- `integration-review`: タスク間・統合レビュー

## Codex レビューを使う原則

設計レビューとタスクレビューでは、必ず Codex を独立レビューアとして呼び出す。

実装レビューでは、Codex 独立レビューと Claude 側の code-review プラグインを必ず実行する。

統合レビューでは、Codex をレビュー主体として必ず呼び出し、`integration-review-agent` は材料整理と補助観点を担当する。

レビューの主体は Codex とする。

Claude は code-review プラグインの結果も合わせて統合し、必要な修正、再レビュー、ユーザー報告を担当する。

Claude が補足レビューを行う場合でも、Codex の Findings、修正案、Verdict を主たる判断材料にする。

Codex レビューでは、すべての指摘に具体的な修正案を必ず含める。

## Codex 呼び出し

Codexを直接`codex exec`で起動しない。必ず`codex-dispatch`とラッパースクリプトを使う。

```sh
scripts/ai-harness/codex_cli.sh review scripts/ai-harness/prompts/review.md <input-file...>
```

Bash toolでは`run_in_background: true`を指定し、`codex-dispatch`のBackground Completion Protocolに従って完了通知と結果を回収する。

## 入力

### design-review

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める

設計時の会話、Web 調査メモ、Claude の思考過程は渡さない。

必ず `codex-dispatch` を使い、Codex に独立レビューさせる。

### task-review

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/tasks/<run-id>/Task*.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める
- `docs/decisions/decisions-<run-id>.md` があれば含める

必ず `codex-dispatch` を使い、Codex に独立レビューさせる。

### implementation-review

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/tasks/<run-id>/TaskN.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める
- 対象タスクの実装ログ
- `git diff`
- テスト結果
- `docs/decisions/decisions-<run-id>.md` があれば含める

必ず次を両方実行する。

- `codex-dispatch` による Codex 独立レビュー
- Claude 側の code-review プラグインによる実装レビュー

設計レビューとタスクレビューでは、トークン節約のため code-review プラグインは必須にしない。

### integration-review

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める
- `docs/tasks/<run-id>/Task*.md`
- 各 task の実装ログ
- 各 task の review 結果
- 全体の `git diff`
- 全体テスト結果
- `docs/decisions/decisions-<run-id>.md` があれば含める

必ず `codex-dispatch` を使い、Codex を統合レビューの主体として呼び出す。

`integration-review-agent` は、Codex に渡す材料整理と補助レビューを担当する。

## レビュー基準

- High: 次工程に進むと正しさ、動作、安全性が保証できない問題。
- Medium: 手戻り、保守性低下、仕様ずれ、テスト不足につながる問題。
- Low: 改善提案、可読性、命名、軽微な整理。

High は厳選する。好みの違いや軽微な設計差分を High にしない。

## 修正案の必須化

Codex の各 finding には次を含める。

- 根拠
- 影響
- 修正案
- 可能であれば修正例

修正例は、対象に応じて次のいずれかにする。

- 設計レビュー: `docs/sekkeisyo/sekkeisyo-<run-id>.md` への追記・修正文案
- タスクレビュー: `TaskN.md` の修正文案
- 実装レビュー: 修正前後コード、または Unified Diff Patch 案

## 出力フォーマット

```md
# Review: <review type>

## Codex Review

Codex に渡した入力と、Codex の verdict を要約する。

## Code Review Plugin

実装レビューの場合のみ、Claude 側の code-review プラグインの findings と verdict を要約する。

## Findings

- [High|Medium|Low] <title>
  - 根拠:
  - 影響:
  - 修正案:
  - 修正例:

## Open Questions

## Verdict

- proceed / revise

## User Decision

- 修正して再レビューする
- 指摘を decisions に残して次へ進む
```

## レビュー後の確認

判定後は、明確に修正できる問題を自動で修正・再レビューし、ユーザー判断が必要な場合だけ確認する。

判定は `docs/harness/quality-gates.md` に従う。

ただし、ハーネス workflow 実行中は、明確に修正すべき High 指摘、完了条件未達、テスト失敗、scope 内の設計/タスク不備ではユーザー確認で止まらず、修正して再レビューする。

ユーザー確認が必要なのは、次の場合に限定する。

- Medium / Low 指摘を修正せず decisions に残して進むか判断が必要。
- High 指摘を例外的に受け入れて進むか判断が必要。
- 要件、scope、プロダクト判断が不足している。
- 破壊的操作、Git 履歴操作、リモート操作が必要。

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を docs/decisions/decisions-<run-id>.md に残して次フェーズへ進む
```

ユーザーが修正しない判断をした場合は、指摘と理由を `docs/decisions/decisions-<run-id>.md` に残して次へ進む。
