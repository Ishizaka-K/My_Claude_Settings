---
name: rules-distill
description: skills、agents、docs から繰り返し出る原則を抽出し、rules に昇格する候補を作る。
---

# Rules Distill Skill

ハーネスを運用しながら、繰り返し現れる作業原則を rules に昇格する。

## 目的

- Skill に重複して書かれた普遍ルールを `.claude/rules/` に集約する。
- 特定技術の知識は `docs/knowledge/` に残す。
- 一回限りの判断は `docs/decisions/decisions-<run-id>.md` に残す。

## 手順

1. `.claude/skills/`、`.claude/agents/`、`docs/knowledge/` を確認する。
2. 複数ファイルに繰り返し出る原則を抽出する。
3. 既存 `.claude/rules/` にすでに含まれているか確認する。
4. 追加、修正、新規ファイル化、見送りを分類する。
5. ユーザーに候補を提示し、承認されたものだけ rules に反映する。

## 候補条件

rules に昇格してよい候補:

- 2つ以上の skill、agent、doc に現れる。
- 行動として書ける。
- 守らない場合のリスクが明確。
- 特定タスクだけでなく、今後も使う。

昇格しない候補:

- 特定技術だけの詳細。
- 一回限りの意思決定。
- すでに rules に十分書かれている内容。
- 好みの違いに近い内容。

## 出力

```md
# Rules Distillation Report

## Candidates

- <principle>
  - Evidence:
  - Risk:
  - Verdict: Append / Revise / New File / Already Covered / Too Specific
  - Target:
  - Draft:

## User Decision

- approve / modify / skip
```

## 重要

ユーザー承認なしに rules を変更しない。
