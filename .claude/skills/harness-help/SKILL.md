---
name: harness-help
description: ハーネスの使い方、フックとなる言葉、どの言葉がどの Skill / Agent に結びつくかを一覧で出す。「どう言えばいい？」「使い方を教えて」「フック語を出して」「実装したいんだけど何て言えばいい？」と聞かれたときに使う。
---

# Harness Help Skill

ハーネスの使い方を案内する。  
ユーザーが「何と言えばよいか分からない」ときに、目的別のフック語、対応 Skill / Agent、実行内容を一覧で示す。

## Trigger

次のような依頼で起動する。

- 「どう言えばいい？」
- 「使い方を教えて」
- 「フック語を出して」
- 「トリガーを教えて」
- 「実装したいんだけど何て言えばいい？」
- 「設計したいときは何て言えばいい？」
- 「レビューしたいときの言い方は？」

## Output Policy

- 表または箇条書きで出す。
- ユーザーがやりたいことから逆引きできるようにする。
- 各項目には、フック語、対応 Skill / Agent、何をするか、言い方例を含める。
- 長すぎる場合は、まず主要フローだけ出し、必要に応じて詳細カテゴリを追加する。

## Quick Reference

| やりたいこと | フック語 | 対応 | 何をするか |
| --- | --- | --- | --- |
| 全体フローを開始したい | 設計から実装レビューまで一気に進めて | `harness-workflow` | 要件確認から設計、レビュー、タスク分解、実装、実装レビュー、統合レビューまでをオーケストレーションする |
| 設計書を作りたい | 設計して / 要件から設計書を作って / docs に設計書を作って | `harness-design` | `docs/sekkeisyo/sekkeisyo-<run-id>.md` と可能ならユースケースを作る |
| Mermaid 付きで設計したい | Mermaid 付きで設計書を作って | `harness-design` | flowchart、sequenceDiagram、classDiagram を使って設計を可視化する |
| UI設計したい | UI設計して / 画面設計して / UI設計書を作って | `ui-design` | `docs/ui/ui-<run-id>.md` に画面、遷移、状態、アクセシビリティを設計する |
| 設計レビューしたい | 設計レビューして | `harness-review` | 設計書とユースケースをレビューし、次に進めるか判定する |
| タスク分解したい | タスク分解して / Task1.md から連番で分けて | `task-planner-reviewer` | `docs/tasks/<run-id>/Task1.md`, `Task2.md` に分解する |
| タスクレビューしたい | タスクレビューして | `task-planner-reviewer` / `harness-review` | タスク粒度、境界、依存順、並列化可能性をレビューする |
| 実装したい | 実装して / Task1 を実装して | `harness-implement` | タスクに従って実装し、検証結果を残す |
| 複数 agent で実装したい | 複数 agent で実装して / wave 1 を並列実装して | `harness-implement` | wave ごとに task implementation agent を起動する |
| worktree で分けたい | worktree で並列実装して | `harness-implement` | task ごとに worktree 分離する方針で実装する |
| 実装レビューしたい | 実装レビューして / この diff をレビューして | `harness-review` / `task-review-agent` | task の scope、設計適合、テスト、品質をレビューする |
| 統合レビューしたい | 統合レビューして | `integration-review-agent` | task 間の整合性、主要フロー、共有ファイルを確認する |
| Codex に聞きたい | Codex に聞いて | `codex-dispatch` | Codex に調査、相談、比較を依頼する |
| Codex にレビューさせたい | Codex でレビューして | `codex-dispatch` | 入力ファイルだけを渡して独立レビューさせる |
| Codex に実装案を出させたい | Codex に prototype-patch を出して | `codex-dispatch` | Codex に Unified Diff Patch 案だけを出させる |
| 専門 reviewer を割り当てたい | 専門 reviewer を選んで / agent assignment を作って | `agent-team-builder` | 技術領域に応じて reviewer agent を割り当てる |
| セキュリティを見たい | セキュリティレビューして | `security-reviewer` | 認証、認可、秘密情報、入力検証をレビューする |
| Android を見たい | Android の観点でレビューして | `android-kotlin-reviewer` | Kotlin、Compose、ViewModel、Repository をレビューする |
| SwiftUI を見たい | SwiftUI の観点でレビューして | `ios-swiftui-reviewer` | SwiftUI、状態管理、async/await をレビューする |
| Python を見たい | Python の観点でレビューして | `python-reviewer` | Python アプリ構成、型、I/O、テスト容易性をレビューする |
| Rails を見たい | Rails の観点でレビューして | `rails-reviewer` | Rails convention、N+1、認可、migration をレビューする |
| バグを修正したい | バグ修正して / 原因を調べて修正して | `bug-fix` | Codex原因調査、Claude文書化、Codex修正、レビューloopを実行する |
| rules を育てたい | rules を整理して / rules-distill して | `rules-distill` | skills、agents、docs から共通原則を抽出し、rules 候補を出す |

## Example Prompts

### 全体を進める

```text
設計から実装レビューまで一気に進めて。
ProductName は SampleApp。
要件は以下です: ...
```

### 設計だけ作る

```text
harness-design で、docs/sekkeisyo に日時とテーマ名付きの設計書を作って。
Mermaid 付きで、全体像から詳細に降りる構成にして。
```

### タスク分解する

```text
task-planner-reviewer を使って、設計書と同じ run-id の docs/tasks フォルダへ Task1.md から連番でタスク分解して。
```

### UI設計する

```text
ui-design で、設計書と同じ run-id の UI 設計書を docs/ui に作って。
画面遷移、各状態、アクセシビリティまで含めて。
```

### バグを修正する

```text
bug-fix でこの不具合の原因を Codex に調査させて。
Claude で docs/bugs に原因と修正方針を記録した後、Codex worker に修正させて。
```

### 実装する

```text
harness-implement で docs/tasks/<run-id>/Task1.md を実装して。
実装後は task-review-agent でレビューして。
```

### 並列実装する

```text
harness-implement で wave 1 を複数 agent に分担して実装して。
衝突リスクが高ければ worktree を使って。
```

### Codex に patch 案を出させる

```text
codex-dispatch で Codex に prototype-patch を出してもらって。
実ファイルは編集させず、Unified Diff Patch 案だけ出して。
```

## Detail Categories

ユーザーが特定カテゴリを聞いた場合は、そのカテゴリだけ詳しく出す。

- 設計系
- レビュー系
- 実装系
- UI設計系
- バグ調査・修正系
- Codex 系
- ドキュメント保存 / Obsidian コピー系
- 専門 reviewer 系
- rules / audit 系
