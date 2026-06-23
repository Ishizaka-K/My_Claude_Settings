---
name: harness-workflow
description: 「設計から実装レビューまで一気に進めて」と依頼されたときに使う。要件確認、プロジェクト内 docs への設計書とユースケース作成、設計レビュー、タスク分解、タスクレビュー、並列実装、実装レビュー、統合レビューをオーケストレーションする。
---

# Harness Workflow Skill

設計から実装レビューまでの開発ハーネス全体をオーケストレーションする。

この Skill は各工程の詳細を直接実装しない。  
詳細は既存の Skill / Agent に委譲し、順序、入出力、停止条件、ユーザー確認を管理する。

各工程は、完了条件を満たすまで loop で回す。

ユーザーの意思決定が必要なときだけ停止する。

このworkflowから起動するすべてのCodex worker/reviewerは、`codex-dispatch`のBackground Completion Protocolに従う。直接`codex exec`したり、shellの`&`や`nohup`で切り離したりしない。

## Trigger

次の言葉で起動する。

```text
設計から実装レビューまで一気に進めて
```

類似トリガー:

- 「harness-workflow を実行して」
- 「設計、タスク分解、実装、レビューまで通して」
- 「プロジェクトの docs に設計書を蓄積しながら開発フローを回して」
- 「この要件をハーネスに流して」

## Inputs

- ユーザーの要件
- ProductName
- 既存コード
- 必要に応じた制約、非目標、優先度

## Canonical Outputs

正本はプロジェクト内の `docs/` に保存する。

```text
docs/
├── sekkeisyo/sekkeisyo-<run-id>.md
├── usecase/usecase-<run-id>.md
├── ui/ui-<run-id>.md
├── bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md
├── tasks/<run-id>/Task1.md
├── reviews/<run-id>/
├── implementation/<run-id>/
└── decisions/decisions-<run-id>.md
```

同じ `<run-id>` をすべての関連資料で使う。Obsidian は `<ProductName>/docs/` へのコピー先とする。

## Workflow

```text
Requirement Gate
-> Design Loop
   -> Design
   -> UI Design when the product has UI
   -> Codex Design Review
   -> Revise until Design Gate passes
   -> User Decision only when needed
-> Task Loop
   -> Task Breakdown
   -> Codex Task Review
   -> Revise until Task Gate passes
   -> User Decision only when needed
-> Implementation Loop
   -> Agent Assignment
   -> Implementation by Wave
   -> Implementation Review
   -> Revise until Implementation Gate passes
   -> User Decision only when needed
-> Integration Review
   -> Revise until Integration Gate passes
   -> User Decision only when needed
```

## Loop Policy

各 loop は次の形で進める。

```text
produce
-> review
-> gate
-> revise if required
-> review again
-> continue when done
```

ユーザー確認が必要な場合だけ停止する。

停止する例:

- Requirement Gate が 7 点未満で、要件確認が必要。
- Medium / Low 指摘を修正せず decisions に残して進むか判断が必要。
- High 指摘を例外的に受け入れて進むか判断が必要。
- Scope 変更、追加要件、プロダクト判断が必要。
- 破壊的操作、Git 履歴操作、リモート操作が必要。

停止しない例:

- High 指摘があり、明らかに修正すべき。
- review で抜け漏れが見つかり、設計書や Task を修正できる。
- 実装レビューで task の Acceptance Criteria 未達が見つかった。
- テスト失敗の原因が task 範囲内で修正できる。

## Phase 0: Requirement Gate

参照:

- `docs/harness/quality-gates.md`

実行内容:

1. 要件、目的、成果物、対象範囲、非対象範囲、制約を確認する。
2. Requirement Gate を 10 点満点で採点する。
3. 7 点未満なら、設計に進まずユーザーに質問する。
4. 7 点以上なら Phase 1 に進む。

## Phase 1: Design

委譲先:

- `.claude/skills/harness-design/SKILL.md`
- `.claude/skills/ui-design/SKILL.md`

実行内容:

1. `YYYYMMDD-HHmm-<topic>` 形式で `<run-id>` を決める。
2. `docs/sekkeisyo/sekkeisyo-<run-id>.md` を作成する。
3. 可能であれば `docs/usecase/usecase-<run-id>.md` を作成する。
4. Mermaid の `flowchart`、`sequenceDiagram`、`classDiagram` を使う。
5. 全体像から個別機能、ロジック、データ、エラー処理へ降りる構成にする。
6. UI を含む案件では `docs/ui/ui-<run-id>.md` を必ず作成する。
7. UI 非対象の場合は、設計書に理由を記録する。

## Phase 2: Design Review Loop

委譲先:

- `.claude/skills/harness-review/SKILL.md`
- `.claude/skills/codex-dispatch/SKILL.md`

入力:

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める

実行内容:

1. 設計レビューを行う。
2. Codex を必ず独立レビューアとして呼び出す。
3. Codex には、前工程の会話コンテキストを渡さず、入力ファイルだけを渡す。
4. Codex には、すべての finding に修正案と可能な修正例を出させる。
5. Claude は Codex の修正案をもとに設計書を修正する。
6. Design Review Gate に従って判定する。
7. High 指摘、構造不足、Mermaid 不足、ユースケース不足など、明確に修正すべき問題は自動で修正して再レビューする。
8. Design Review Gate を満たすまで loop する。

停止条件:

- Requirement や product 判断が不足しており、Claude だけでは決められない。
- Medium / Low 指摘を修正せず `decisions.md` に残して進むか判断が必要。
- High 指摘を例外的に受け入れて進むか判断が必要。

確認文:

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を `docs/decisions/decisions-<run-id>.md` に残して次フェーズへ進む
```

## Phase 3: Task Breakdown Loop

委譲先:

- `.claude/agents/task-planner-reviewer.md`

入力:

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md` があれば含める
- `docs/ui/ui-<run-id>.md` があれば含める
- `docs/decisions/decisions-<run-id>.md` があれば含める

出力:

- `docs/tasks/<run-id>/Task1.md`
- `docs/tasks/<run-id>/Task2.md`
- `docs/tasks/<run-id>/Task3.md`

実行内容:

1. 設計書をタスクへ分解する。
2. タスクはドメイン関心ごとで分ける。
3. 1タスクはおおむね 800 行前後の変更量を目安にする。
4. `Owned Files`、`Out of Scope`、`Dependencies`、`Parallel Safety` を明確にする。
5. `Parallelization Plan` を作る。

## Phase 4: Task Review

委譲先:

- `.claude/agents/task-planner-reviewer.md`
- `.claude/skills/codex-dispatch/SKILL.md`

入力:

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md`
- `docs/ui/ui-<run-id>.md` があれば含める
- `docs/tasks/<run-id>/Task*.md`
- `docs/decisions/decisions-<run-id>.md`

実行内容:

1. タスク粒度、境界、依存順、並列化可能性をレビューする。
2. Codex を必ず独立レビューアとして呼び出す。
3. Codex には、設計書、ユースケース、Task ファイル、decisions だけを渡す。
4. Codex には、すべての finding に修正案と可能な Task 修正文案を出させる。
5. Claude は Codex の修正案をもとに Task ファイルを修正する。
6. Task Review Gate に従って判定する。
7. High 指摘、粒度不適合、境界不明瞭、依存順不明、並列化リスクの明確な問題は自動で Task ファイルを修正する。
8. Task Review Gate を満たすまで再レビューする。

停止条件:

- タスク境界の変更により、ユーザー判断が必要な scope 変更が発生する。
- Medium / Low 指摘を修正せず `decisions.md` に残して実装へ進むか判断が必要。
- High 指摘を例外的に受け入れて進むか判断が必要。

確認文:

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を `docs/decisions/decisions-<run-id>.md` に残して実装へ進む
```

## Phase 5: Agent Assignment

委譲先:

- `.claude/skills/agent-team-builder/SKILL.md`

実行内容:

1. 各 Task に実装 agent と review agent を割り当てる。
2. 技術領域に応じて専門 reviewer を追加する。
3. セキュリティ要素がある場合は `security-reviewer` を追加する。

例:

```md
## Agent Assignment

- Implementation: codex task-worker
- Primary Review: Codex reviewer
- Specialist Review:
  - python-reviewer
  - security-reviewer
```

## Phase 6: Implementation Loop by Wave

委譲先:

- `.claude/skills/harness-implement/SKILL.md`
- Codex task worker

参照:

- `docs/harness/worktree-parallel.md`

実行内容:

1. `Parallelization Plan` に従って wave ごとに実装する。
2. 必ず 1 Task = 1 Codex worker で実装し、`docs/harness/codex-task-workers.md` に従う。
3. 各 Codex worker に task 専用 worktree/sandbox を割り当て、`/goal` で完了条件まで実装させる。
4. 各 Task の `Owned Files` と `Out of Scope` を守る。
5. 実装後、各 Task の実装ログ、diff、検証結果を残す。

重要:

- Codex worker に main workspace を直接編集させない。
- Codex worker は task 専用 worktree/sandbox 内だけ編集してよい。
- Codex worker に `git add`、`git commit`、`git push` を実行させない。
- Claude は Codex への依頼で `Goal`、`Context`、`Constraints`、`Verification`、`Stop Conditions` を明確にする。
- main workspace への反映は Codex `integration-worker` が行い、Claude は承認済み入力の準備と結果確認を担当する。
- Claude はプロダクトコード、テスト、設定を直接編集しない。
- レビュー修正は Codex worker に戻す。
- Codex が失敗した場合、Claude は代替実装せず、必要な許可や環境変更をユーザーへ報告する。

## Phase 7: Task Implementation Review Loop

委譲先:

- `.claude/agents/task-review-agent.md`
- 技術別 reviewer agent
- `.claude/skills/codex-dispatch/SKILL.md`
- Claude 側の code-review プラグイン

入力:

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md`
- `docs/ui/ui-<run-id>.md` があれば含める
- 対象 `docs/tasks/<run-id>/TaskN.md`
- 実装ログ
- `git diff`
- テスト結果
- `docs/decisions/decisions-<run-id>.md`

実行内容:

1. Task ごとに実装レビューする。
2. 専門 reviewer がある場合は、その結果も統合する。
3. Codex を独立レビューアとして呼び出す。
4. Codex には、設計書、ユースケース、対象 Task、diff、テスト結果、decisions だけを渡す。
5. Claude 側の code-review プラグインを必ず実行する。
6. Codex には、すべての finding に修正案と可能なコード修正例または Unified Diff Patch 案を出させる。
7. Claude は Codex と code-review プラグインの結果を統合する。
8. Claude は統合した修正案を同じ Codex worker に返し、Codex に実装を修正させる。
9. Implementation Review Gate に従って判定する。
10. High 指摘、Acceptance Criteria 未達、テスト失敗、明確な scope 違反は自動で修正し、再レビューする。
11. Task ごとに Implementation Review Gate を満たすまで loop する。

注意:

- code-review プラグインは実装レビューでのみ必須にする。
- 設計レビューやタスク分解レビューでは、トークン節約のため code-review プラグインは回さない。
- Codex レビューと code-review プラグインの指摘が衝突する場合は、正しさ、安全性、設計適合、テスト結果を優先して Claude が統合判断する。

停止条件:

- Task の scope を超える修正が必要。
- 仕様判断やプロダクト判断が必要。
- Medium / Low 指摘を修正せず `decisions.md` に残して次へ進むか判断が必要。
- High 指摘を例外的に受け入れて進むか判断が必要。

確認文:

```text
次のどちらで進めますか？
1. 指摘を修正して再レビューする
2. 指摘を `docs/decisions/decisions-<run-id>.md` に残して次へ進む
```

## Phase 8: Integration Review

委譲先:

- `.claude/agents/integration-review-agent.md`
- `.claude/skills/codex-dispatch/SKILL.md`

入力:

- `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- `docs/usecase/usecase-<run-id>.md`
- `docs/ui/ui-<run-id>.md` があれば含める
- `docs/tasks/<run-id>/Task*.md`
- 全 Task の実装ログ
- 全 Task の review 結果
- 全体の `git diff`
- 全体テスト結果
- `docs/decisions/decisions-<run-id>.md`

実行内容:

1. `integration-review-agent` で、task 間リスクと Codex に渡すべき材料を整理する。
2. Codex を統合レビューの主体として必ず呼び出す。
3. Codex には、設計書、ユースケース、Task 群、各 task の実装ログ、各 task のレビュー結果、全体 diff、全体テスト結果、decisions を渡す。
4. Codex には、すべての finding に根拠、影響、修正案、可能な修正例を出させる。
5. task 間 interface のずれを確認する。
6. 共有ファイル、共通型、主要フローの破綻を確認する。
7. 設計書とユースケースの主要要件が満たされているか確認する。
8. Claude は `integration-review-agent` と Codex の結果を統合する。
9. Integration Review Gate に従って判定する。
10. 明確な統合不整合は修正 task を作成し、実装 loop に戻す。
11. Integration Review Gate を満たすまで loop する。

停止条件:

- High がある場合は、対象 Task へ戻る。
- 統合修正が必要な場合は、追加 Task を作る。

## Phase 9: Final Report

出力内容:

- 完了したフェーズ
- 作成したプロジェクト内 `docs/` ファイル
- Obsidian へのコピー結果
- 実装した Task
- レビュー結果
- 残した decisions
- 実行したテスト
- 未解決事項

## Stop Rules

- Requirement Gate が 7 点未満なら設計に進まない。
- High 指摘を無視して次へ進まない。進む場合はユーザーの明示判断を `decisions.md` に残す。
- 自動で修正できる指摘では止まらず、修正して再レビューする。
- ユーザー判断が必要な停止条件を飛ばさない。
- Codex worker は専用 worktree/sandbox 内だけ実ファイルを編集する。main workspace は直接編集させない。
- Codex worker で実装する場合は、task 専用 worktree/sandbox 内だけ編集させる。
- `git add`、`git commit`、`git push` はユーザーの明示許可なしに実行しない。
