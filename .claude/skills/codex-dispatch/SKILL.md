---
name: codex-dispatch
description: Claude Code から Codex を個別に呼び出す。ユーザーが「Codexに聞いて」「Codexでレビュー」「Codexにワンショット実装させて」と依頼したときに使う。
---

# Codex Dispatch Skill

Claude Code から Codex を独立した作業者またはレビューアとして呼び出す。

## Tool

Codex 呼び出しには、次の tool 仕様とラッパースクリプトを使う。

- Tool spec: `docs/harness/tools/codex-cli-tool.md`
- Wrapper: `scripts/ai-harness/codex_cli.sh`
- Prompt templates: `scripts/ai-harness/prompts/`

## モード

依頼内容に応じて、次のいずれかを選ぶ。

- `review`: Codex にレビューだけを依頼する。
- `ask`: Codex に調査、設計相談、実装方針の確認を依頼する。
- `prototype-patch`: Codex に小さな実装の Unified Diff Patch 案だけを依頼する。
- `task-worker`: Codex に task 専用 worktree/sandbox 内で `/goal` による完了までの実装を依頼する。
- `bug-analysis`: Codex に read-only で不具合の根本原因を調査させる。
- `bug-fix-worker`: Codex に bug 専用 worktree/sandbox 内で `/goal` による修正を依頼する。
- `integration-worker`: レビュー済み差分を Codex が main workspace に反映する。
- `compare`: Claude の方針と Codex の方針を比較する。

## 原則

- Codex に渡す入力を明示する。
- レビューでは、前工程の会話コンテキストを渡さず、対象ファイルや diff に限定する。
- レビューの主体は Codex とする。Claude は Codex のレビュー結果を統合し、修正指示を Codex worker に返し、ユーザー報告を担当する。
- Codex レビューでは、すべての指摘に具体的な修正案を必須とする。
- 可能であれば、Codex は修正前後のコード例、設計書の追記案、Task 記述の修正案、または Unified Diff Patch 案を示す。
- read-only modeではCodexに実ファイルを編集させない。
- `task-worker`と`bug-fix-worker`は専用worktree/sandbox内、`integration-worker`はレビュー通過後のmain workspace内に限って編集を許可する。
- `task-worker` mode でも main workspace の直接編集、`git add`、`git commit`、`git push` は許可しない。
- `prototype-patch`の出力はUnified Diff Patch案に限定する。worker modeではCodexが許可されたworktree内を直接編集する。
- Claude が patch 案を読み、必要な修正指示を Codex worker に返す。実ファイルへの反映は Codex worker または integration-worker が行う。
- patch 案を使う場合は、変更範囲、禁止事項、完了条件、テストコマンドを明記する。
- Codex の出力はそのまま採用せず、Claude が差分とリスクを確認してからユーザーに報告する。

## Background Completion Protocol

Codex CLIの全modeは、Claude CodeのBash toolで`run_in_background: true`を指定して起動する。短い`ask`や`review`も同じ経路に統一し、完了通知の取りこぼしを防ぐ。

- shellの末尾へ`&`を付けたり、`nohup`で切り離したりしない。Claude Codeが管理するbackground taskとして起動する。
- 起動時に返るbackground task IDを保持し、通常は定期pollingせず、Claude Codeの完了通知を待つ。
- 完了通知を受けたらbackground taskの出力を1回だけ読み、`[codex_cli] finished`と`CODEX_RESULT`を確認する。
- wrapperのstateが`complete`のときだけ次の工程へ進む。書き込みmodeでは`CODEX_RESULT: COMPLETE`も必須とする。
- `BLOCKED`は質問または環境対応へ、`FAILED`は失敗分析へ進む。
- `finished-unconfirmed`または完了マーカーなしは完了扱いにせず、同じworkerへ最終報告だけ再要求する。
- Claudeはbackground taskが残っている間にturnを完了しない。通知後に必ず結果を回収してworkflowを再開する。

この方式では、毎秒のモデルpollingや`/loop`を使わない。ステータス文字列はbackground taskの出力ファイルへ蓄積され、完了時に必要な出力だけを読む。

## 呼び出し例

### review

```sh
scripts/ai-harness/codex_cli.sh review scripts/ai-harness/prompts/review.md <input-file...>
```

Codex review の期待出力:

- Findings
- 各 finding の根拠
- 影響
- 具体的な修正案
- 可能であれば修正例または patch 案
- Open Questions
- Verdict

### ask

```sh
scripts/ai-harness/codex_cli.sh ask scripts/ai-harness/prompts/ask.md <input-file...>
```

### prototype-patch

```sh
scripts/ai-harness/codex_cli.sh prototype-patch scripts/ai-harness/prompts/prototype_patch.md <input-file...>
```

### task-worker

```sh
CODEX_WORKDIR=<task-worktree> scripts/ai-harness/codex_cli.sh task-worker scripts/ai-harness/prompts/task_worker_goal.md <input-file...>
```

`task-worker` は、1 Task = 1 Codex worker で task 完了まで実装するための mode。

必ず `CODEX_WORKDIR=<task-worktree>` を指定してtask専用worktree/sandboxで実行する。

### bug-analysis

```sh
scripts/ai-harness/codex_cli.sh bug-analysis scripts/ai-harness/prompts/bug_analysis.md <input-file...>
```

### bug-fix-worker

```sh
CODEX_WORKDIR=<bug-worktree> scripts/ai-harness/codex_cli.sh bug-fix-worker scripts/ai-harness/prompts/bug_fix_goal.md <input-file...>
```

`bug-analysis` はread-only、`bug-fix-worker`は`CODEX_WORKDIR=<bug-worktree>`を指定したbug専用worktreeで実行する。

### integration-worker

```sh
CODEX_WORKDIR=<main-workspace> scripts/ai-harness/codex_cli.sh integration-worker scripts/ai-harness/prompts/integration_worker_goal.md <input-file...>
```

`integration-worker`はレビューgate通過後だけ使用する。`CODEX_WORKDIR=<main-workspace>`を明示し、Claudeは承認済みdiff、Task、レビュー結果を渡してCodexに反映させる。

## Codex に渡すプロンプトの必須項目

```md
# Goal

何を変更・構築・確認したいかを明確に書く。

# Context

このタスクで重要なファイル、フォルダ、ドキュメント、サンプル、エラー、diff、テスト結果を書く。

# Constraints

Codex が従うべき標準、アーキテクチャ、安全要件、既存慣習、禁止事項を書く。

# Verification

テスト、lint、typecheck、再現手順、スコア計測など、ゴール達成を確認する高速な方法を書く。

# Stop Conditions

完了条件、質問が必要な条件、続行禁止条件を書く。
```

必要に応じて `Output format` を追加する。

## Prompt Template

Codex へ依頼するときは、原則として次の形に整える。

```md
# Goal

<何を変更・構築・確認したいか>

# Context

- Important files:
  - `<path>`: <なぜ重要か>
- Important docs:
  - `<path>`: <参照理由>
- Errors / logs:
  - <関連するエラーやログ>
- Current behavior:
  - <現在の挙動>

# Constraints

- <従うべき設計、標準、慣習>
- <触ってはいけない範囲>
- <安全要件>
- mode の書き込み規則に従う。`prototype-patch` は編集せず、worker mode は専用 worktree/sandbox 内だけ編集する。

# Verification

- <テストが通る>
- <期待挙動になる>
- <不具合が再現しなくなる>

# Stop Conditions

- <完了条件>
- <ユーザー判断が必要な条件>
- <続行禁止条件>

# Output format

<期待する出力形式>
```

## prototype-patch に向く条件

- 変更範囲が小さい。
- 対象ファイルが明確。
- 仕様がすでに決まっている。
- 実装後の検証方法が明確。
- 失敗しても巻き戻しや再実装が容易。

## prototype-patch に向かない条件

- 設計判断が未確定。
- 複数ドメインにまたがる。
- DB マイグレーション、認証、課金、権限などの重要領域を含む。
- 大きなファイル構成変更を含む。
- ユーザー確認が必要なプロダクト判断を含む。

## Patch 採用手順

1. Codex から Unified Diff Patch 案を受け取る。
2. Claude が patch の対象範囲、責務境界、既存設計との整合性を確認する。
3. そのまま適用できない箇所は Claude が修正方針を立てる。
4. Codex worker または `integration-worker` に実ファイルを編集させる。
5. テストまたは静的チェックを実行する。
6. 必要に応じて Codex にレビューを依頼する。

## Implementation Authority

- プロダクトコード、テスト、アプリ設定、migration、build 設定の実装は Codex worker だけが行う。
- Claude は実装コードを直接編集しない。
- Codex が失敗しても Claude は代替実装しない。
- レビュー修正は Codex worker に返す。
