# Codex Task Workers

タスク分解後、1タスクにつき1つの Codex worker を割り当て、`/goal` でタスク完了まで走らせる運用方針。

## 基本方針

- 1 Task = 1 Codex worker とする。
- Codex worker は担当 Task の完了条件を満たすまで自律的に実装する。
- Codex worker は必ず task 専用 worktree/sandbox 内で作業する。
- main workspace への反映は Codex `integration-worker` が行う。
- `git add`、`git commit`、`git push` は Codex worker に許可しない。
- Codex worker は非対話実行のため、必ず `--ask-for-approval never` で起動する。
- 承認が必要な操作は待機せず失敗として扱い、別の実装手段を選ばせる。
- 実装後のレビューは、実装担当とは別の Codex reviewer を使う。
- workerとreviewerはClaude Codeのbackground taskとして起動し、ネイティブの完了通知後に出力を1回だけ回収する。
- shellの`&`、`nohup`、毎秒のモデルpollingは使わない。

## Flow

```text
Task/Task1.md
-> Codex Worker 1 with /goal
-> Task completed in isolated worktree
-> Claude collects diff and verification result
-> Codex Reviewer reviews Task1 diff
-> code-review plugin runs automatically / or via implementation review flow
-> Claude sends findings back to Codex Worker
-> repeat until gate passes
-> Codex integration-worker integrates into main workspace
```

## When to Use

使ってよい場合:

- Task の `Scope`、`Owned Files`、`Out of Scope`、`Acceptance Criteria` が明確。
- 他 task との依存関係が少ない。
- task 専用 worktree で安全に実装できる。
- テストまたは検証方法が明確。

避けるべき場合:

- 設計判断が未確定。
- 認証、認可、課金、DB migration など重大領域を広範囲に触る。
- 共有ファイルを複数 task が同時に編集する。
- ユーザー判断が必要なプロダクト仕様を含む。

## Codex Worker Prompt Shape

Codex worker には必ず次の形で依頼する。

```md
# Goal

TaskN を完了条件まで実装してください。

# Context

- Design: `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- Use cases: `docs/usecase/usecase-<run-id>.md`
- Task: `docs/tasks/<run-id>/TaskN.md`
- Decisions: `docs/decisions/decisions-<run-id>.md`
- Relevant files:
  - `<path>`: <why it matters>

# Constraints

- この task 専用 worktree/sandbox 内でのみ編集する。
- `Owned Files` を主な編集範囲とする。
- `Out of Scope` に書かれた変更をしない。
- unrelated な整形、リネーム、削除をしない。
- `git add`、`git commit`、`git push` を実行しない。
- 既存の設計、命名、テスト方針に合わせる。
- sandbox や permission によりコマンドが失敗した場合、承認待ちにせず、失敗内容と代替案を報告する。

# Verification

- Task の `Acceptance Criteria` を満たす。
- 指定されたテストまたは静的チェックが通る。

# Stop Conditions

- Acceptance Criteria と Verification をすべて満たしたら完了する。
- 仕様判断や scope 変更が必要なら停止して質問する。
- sandbox や permission で続行できない場合は停止して報告する。
- 変更ファイル、検証結果、未確認事項を報告する。
- main workspace に統合可能な diff が残っている。
```

## Review Separation

実装担当 Codex とレビュー担当 Codex は分ける。

```text
Codex Worker
-> 実装

Codex Reviewer
-> 独立レビュー
-> findings + 修正案
```

同じ Codex セッションに実装とレビューを兼任させない。

## Claude Responsibilities

Claude は次を担当する。

- Task ごとの worktree/sandbox を用意する。
- Codex worker に渡す Goal / Context / Constraints / Verification / Stop Conditions を整える。
- Codex worker の diff と検証結果を回収する。
- Codex reviewer と code-review plugin の結果を統合する。
- 必要なら Codex worker に修正指示を返す。Claude はコードを修正しない。
- gate を満たした diff だけ Codex `integration-worker` に渡す。
- integration-worker の結果を確認する。
