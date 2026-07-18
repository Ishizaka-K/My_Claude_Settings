- `rails.md`: Ruby on Rails 開発の原則。
- `blog-writing.md`: ブログ執筆の原則。

### `skills/`

ユーザーの依頼文に応じて起動される作業手順です。

- `harness-workflow`: 設計から実装レビューまで一気に進める。
- `harness-design`: 要件から設計書、ユースケース、必要に応じて UI 設計書を作る。
- `harness-review`: 設計、タスク、実装、統合を Codex 主体でレビューする。
- `harness-implement`: タスク単位で Codex worker に実装させる。
- `codex-dispatch`: Claude から Codex を呼び出すための共通手順。
- `bug-fix`: Codex に原因調査させ、修正方針を文書化してから Codex に修正させる。
- `ui-design`: UI 設計書を作成する。
- `agent-team-builder`: タスクに応じて実装 agent / reviewer agent を割り当てる。
- `harness-help`: フック語と対応 Skill の一覧を出す。
- `rules-distill`: 重複した方針を rules へ昇格する候補を整理する。

### `agents/`

レビューや材料整理に使う専門 agent 定義です。

- `task-planner-reviewer`: 設計書からタスク分解し、粒度や境界を確認する。
- `task-review-agent`: task 単位の実装レビュー材料を整理する。
- `integration-review-agent`: 複数 task の統合リスクを整理する。
- `security-reviewer`: 認証、認可、秘密情報、入力検証を確認する。
- `android-kotlin-reviewer`: Android Kotlin / Compose を確認する。
- `ios-swiftui-reviewer`: SwiftUI / iOS を確認する。
- `python-reviewer`: Python アプリ構成を確認する。
- `rails-reviewer`: Rails convention、認可、DB、テストを確認する。

## 基本フロー

```text
Requirement Gate
-> Design Loop
   -> Design
   -> UI Design
   -> Codex Design Review
-> Task Loop
   -> Task Breakdown
   -> Codex Task Review
-> Implementation Loop
   -> Codex Worker Implementation
   -> Codex Implementation Review
   -> Claude code-review plugin
-> Integration Review
```

各フェーズは、`docs/harness/quality-gates.md` の完了条件を満たすまで loop します。
ユーザー判断が必要な場合だけ停止します。

## ドキュメント保存先

成果物の正本はプロジェクト内の `docs/` です。
Obsidian はコピー先として扱います。

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

`<run-id>` は `YYYYMMDD-HHmm-<topic>` を使い、過去資料を上書きしません。

## よく使う依頼文

- `設計から実装レビューまで一気に進めて`
  - `harness-workflow` を使い、全体フローをオーケストレーションします。
- `設計して`
  - `harness-design` を使い、設計書を作成します。
- `UI設計して`
  - `ui-design` を使い、UI 設計書を作成します。
- `設計レビューして`
  - `harness-review` を使い、Codex 主体で設計をレビューします。
- `タスク分解して`
  - `task-planner-reviewer` を使い、`docs/tasks/<run-id>/TaskN.md` に分解します。
- `タスクレビューして`
  - Codex 主体でタスク粒度、境界、依存関係をレビューします。
- `実装して`
  - `harness-implement` を使い、Codex worker に task 単位で実装させます。
- `実装レビューして`
  - Codex 独立レビューと Claude code-review plugin を実行します。
- `バグ修正して`
  - `bug-fix` を使い、原因調査、修正方針文書化、Codex 修正、レビュー loop を行います。
- `どう言えばいい？`
  - `harness-help` を使い、フック語一覧を表示します。

## Codex 依頼の基本形

Codex に作業を渡すときは、次の項目を必ず明確にします。

- `Goal`: 何を変更、構築、調査したいか。
- `Context`: 重要なファイル、フォルダ、ドキュメント、エラー、サンプル。
- `Constraints`: 守るべき標準、アーキテクチャ、安全要件、既存慣習。
- `Verification`: どう検証するか。
- `Stop Conditions`: いつ止まるか、何をもって完了とするか。

Codex の起動は `scripts/ai-harness/codex_cli.sh` を使います。
直接 `codex exec` を呼ばず、`codex-dispatch` の Background Completion Protocol に従います。

## Codex Background Completion Protocol

Codex は Claude Code の background task として起動します。

- shell の `&` や `nohup` で切り離しません。
- 最初の 10 秒間は 1 秒ごとの生存確認を見ます。
- 30 秒を超える作業では、30 秒ごとに進捗を確認して簡潔に報告します。
- 完了通知後に出力を回収し、`CODEX_RESULT: COMPLETE` を確認します。
- `BLOCKED`、`FAILED`、完了マーカーなしは完了扱いにしません。

## 安全上の注意

- このプロジェクト配下の `.claude/` は GitHub に上げられる想定です。
- 個人の `~/.claude/` は公開しないでください。
- `~/.claude/settings.json`、MCP 認証情報、API key、ローカルパス、plugin cache は公開対象ではありません。
- `.claude/settings.json` ではリモート Git 操作を禁止しています。
- `git push`、`git tag`、remote 変更はユーザーの明示許可があっても、設定上は拒否されます。
- `.harness/**` は過去に in-place 実装用 prompt が混入したため、直接編集を禁止しています。

## 関連ドキュメント

- `CLAUDE.md`
- `docs/harness/quality-gates.md`
- `docs/harness/codex-task-workers.md`
- `docs/harness/worktree-parallel.md`
- `docs/harness/tools/codex-cli-tool.md`
- `docs/harness/document-storage.md`
- `docs/harness/agents.md`
