---
name: bug-fix
description: Codexで原因調査し、Claudeがdocs/bugsに原因と修正方針を記録してから、Codex workerに修正させる。「バグ修正して」「不具合を直して」「原因を調べて修正して」と依頼されたときに使う。
---

# Bug Fix Skill

バグの原因を Codex に独立調査させ、Claude が原因と修正方針を文書化し、Codex worker が修正する。

## Trigger

- 「バグ修正して」
- 「不具合を直して」
- 「原因を調べて修正して」
- 「このエラーを直して」

## Canonical Output

`docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md`

`<bug-summary>` は、症状または判明した原因が短く分かる kebab-case にする。

例:

```text
docs/bugs/bug-20260620-1815-login-token-refresh-loop.md
docs/bugs/bug-20260620-1830-android-offline-cache-crash.md
docs/bugs/bug-20260620-1900-rails-order-authorization-bypass.md
```

`bug-fix` のような抽象名や、日時だけのファイル名は使わない。

## Workflow

```text
Reproduction and Context
-> Codex Root Cause Analysis
-> Claude Bug Document
-> Codex Bug Fix Worker
-> Codex Implementation Review + code-review plugin
-> Fix and Review Loop
-> Claude Integration
```

## Phase 1: Reproduction and Context

Claude は次を集める。

- 期待する挙動
- 実際の挙動
- 再現手順
- エラー、ログ、stack trace
- 関連ファイル、テスト、設定
- 最後に正常だった状態や関連変更

再現できる場合は、修正前に再現テストを作るか、再現コマンドを記録する。

## Phase 2: Codex Root Cause Analysis

Codex を read-only、`approval=never` で呼び出す。

Bash toolの`run_in_background: true`で起動し、`codex-dispatch`のBackground Completion Protocolに従って調査完了通知と結果を回収する。

Codex には `Goal`、`Context`、`Constraints`、`Verification`、`Stop Conditions` を必ず渡す。

```md
# Goal

不具合の根本原因を特定し、根拠と修正候補を提示する。

# Context

- 再現手順
- エラーとログ
- 関連ファイル
- 関連テスト
- 期待する挙動と実際の挙動

# Constraints

- ファイルを編集しない。
- 推測と確認済み事実を分ける。
- 対症療法ではなく根本原因を追う。
- 影響範囲と回帰リスクを示す。

# Verification

- 根本原因候補が証拠付きで示される。
- 最有力原因と代替仮説が区別される。
- 修正方針と必要なテストが示される。

# Stop Conditions

- 根本原因と修正方針が証拠付きで示されたら完了する。
- 追加情報、外部環境、ユーザー判断が必要なら停止して質問する。
```

## Phase 3: Claude Bug Document

Claude は Codex の調査結果を検証・整理し、`docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md` を作成する。

```md
# Bug: <title>

## Status

investigating / fixing / reviewing / resolved

## Expected Behavior

## Actual Behavior

## Reproduction Steps

## Evidence

## Root Cause

## Alternative Hypotheses

## Affected Scope

## Fix Strategy

## Files to Change

## Regression Risks

## Verification Plan

## Codex Investigation Summary

## Resolution
```

原因が確定できない場合は、ユーザー判断が必要な調査、環境、データだけを質問する。

## Phase 4: Codex Bug Fix Worker

Claude は Codex worker に修正を依頼する。

- task 専用 worktree/sandbox を使う。
- `/goal` で `Verification` と `Stop Conditions` を満たすまで走らせる。
- Bash toolの`run_in_background: true`で起動し、`codex-dispatch`のBackground Completion Protocolに従って通知と結果を回収する。
- `git add`、`git commit`、`git push` を禁止する。
- main workspace への統合は Codex `integration-worker` が行う。Claude はコードを編集しない。

Codex worker には次を渡す。

- `docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md`
- 関連設計書、Task、decisions
- 再現テストまたは再現コマンド
- 対象ファイル

## Phase 5: Review Loop

修正後は必ず次を実行する。

Codex reviewerもBash toolの`run_in_background: true`で起動し、同じBackground Completion Protocolで結果を回収する。

- 実装担当とは別の Codex reviewer による独立レビュー
- Claude 側の code-review プラグイン
- 再現テスト
- 関連テスト、lint、typecheck

不具合が再現しなくなり、回帰テストが通り、High 指摘がなくなるまで修正とレビューを loop する。

## User Decision

次の場合だけ停止してユーザーへ確認する。

- 仕様上どちらが正しいか決められない。
- データ修復、migration、互換性破壊が必要。
- scope 外の大きな変更が必要。
- 外部環境や秘密情報がないと再現できない。
