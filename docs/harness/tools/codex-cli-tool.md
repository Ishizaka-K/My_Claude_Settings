# Codex CLI Tool

Claude Code から Codex を独立したレビューアまたは実装者として呼び出すための tool 仕様。

## Tool Name

`codex-cli`

## Purpose

- Claude の会話コンテキストから切り離して Codex にレビューさせる。
- 小さく境界が明確な実装を Codex にワンショットで依頼する。
- Claude の設計や実装方針に対して、別モデルの観点を得る。

## Command

```sh
scripts/ai-harness/codex_cli.sh <mode> <prompt-file> [input-file ...]
```

## Modes

- `review`: 設計、タスク、実装差分をレビューする。
- `ask`: 調査、相談、設計方針の検討を行う。
- `prototype-patch`: 小さな実装の Unified Diff Patch 案を Codex に依頼する。
- `task-worker`: task 専用 worktree/sandbox 内で `/goal` により1タスクの完了まで Codex に実装させる。
- `bug-analysis`: read-only で不具合の根本原因を調査する。
- `bug-fix-worker`: bug 専用 worktree/sandbox 内で `/goal` により修正する。
- `integration-worker`: レビュー済みの実装を main workspace に反映する。
- `compare`: Claude 案と Codex 案を比較する。

## Inputs

```text
mode
prompt-file
input-file...
```

`prompt-file` には Codex への指示を書く。`input-file` は Codex に読ませる設計書、タスク、diff、テスト結果などを指定する。

Codex への指示は、原則として次の5項目を含める。

- `Goal`: 何を変更、構築、確認したいか。
- `Context`: 重要なファイル、フォルダ、ドキュメント、サンプル、エラー、diff、テスト結果。
- `Constraints`: 従うべき標準、アーキテクチャ、安全要件、既存慣習、禁止事項。
- `Verification`: テスト、lint、typecheck、再現手順、スコアなどの確認方法。
- `Stop Conditions`: 完了条件、質問条件、続行禁止条件。

## Output

Codex の標準出力をそのまま返す。Claude はその出力を確認し、必要に応じて要約、採否判断、追加確認を行う。

## Review Isolation Rule

レビュー用途では、前工程の会話ログや Claude の思考過程を渡さない。Codex に渡すのは、レビュー対象のファイル、diff、テスト結果、明示された decisions のみとする。

## Safety Rules

- Codex は非対話実行では必ず `--ask-for-approval never` で起動する。
- approval が必要な操作は待機せず失敗として扱い、Codex に別案を考えさせる。
- `review`、`ask`、`prototype-patch`、`compare` は原則 `--sandbox read-only` で起動する。
- `task-worker`、`bug-fix-worker`、`integration-worker` は `--sandbox workspace-write` を使い、`CODEX_WORKDIR` を必須とする。
- `prototype-patch` は変更範囲が小さく、対象ファイルと完了条件が明確な場合だけ使う。
- `task-worker` は task 専用 worktree/sandbox 内でのみ使う。
- DB、認証、課金、権限、破壊的操作を含む実装は、Codex の patch 案だけで進めない。
- `task-worker` と `bug-fix-worker` はmain workspaceを編集しない。レビュー通過後の反映だけを`integration-worker`がmain workspaceで行う。
- `task-worker` でも `git add`、`git commit`、`git push` は禁止する。
- Codex のpatch案はClaudeが差分確認し、必要な修正指示をCodex workerへ返す。Claudeは実装コードへ転記しない。
- Codex に秘密情報を渡さない。

## Status Monitoring

`scripts/ai-harness/codex_cli.sh` は Codex 起動後、デフォルトで最初の10秒間だけ1秒ごとに status を stderr に出す。

```text
[codex_cli] starting mode=task-worker sandbox=workspace-write approval=never
[codex_cli] still running mode=task-worker elapsed=1s
```

調整したい場合は環境変数を使う。

```sh
CODEX_STATUS_INTERVAL_SECONDS=1
CODEX_STATUS_WINDOW_SECONDS=10
```

## Background Completion

全modeをClaude CodeのBash toolで`run_in_background: true`にして起動する。shellの`&`や`nohup`は使わない。

Claude Codeはbackground task IDと出力ファイルを管理し、終了時に通知する。Claudeは通知後に出力を1回だけ読み、次を確認する。

```text
[codex_cli] finished mode=<mode> state=<state> exit=<code>
CODEX_RESULT: COMPLETE | BLOCKED | FAILED  # 書き込みmodeのみ必須
```

毎秒のモデルpollingや`/loop`は行わない。これにより、待機中のトークン消費を抑える。

## Example

```sh
scripts/ai-harness/codex_cli.sh review \
  scripts/ai-harness/prompts/review.md \
  docs/sekkeisyo/sekkeisyo-20260620-1430-example.md \
  docs/tasks/20260620-1430-example/Task1.md \
  docs/implementation/20260620-1430-example/Task1.diff.patch
```

## Prompt Shape

```md
# Goal

# Context

# Constraints

# Verification

# Stop Conditions

# Output format
```
