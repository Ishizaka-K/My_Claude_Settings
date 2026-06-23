---
paths:
  - "**/*"
---

# Implementation Policy

このルールは、すべての Skill、Agent、workflow より優先する。

## Authority

- ユーザーが Claude を実装主体として明示しない限り、プロダクトコード、テスト、migration、build・アプリ・CI/CD 設定は Codex worker だけが編集する。
- 「実装して」「修正して」「バグを直して」だけでは Claude への実装許可とみなさない。
- Claude への明示許可は、指定された依頼範囲だけに適用し、別taskへ引き継がない。
- Codex が失敗しても Claude は実装を代行しない。

## Claude Responsibilities

- Goal、Context、Constraints、Verification、Stop Conditions を明確にする。
- `docs/` 配下の設計、UI設計、タスク、レビュー、バグ文書を管理する。
- `.claude/` とハーネス用script・promptを整備する。
- Codex worker、reviewer、integration-workerを起動・監視する。
- diff、テスト結果、レビュー結果を整理し、修正指示をCodex workerへ返す。
- ユーザー判断が必要な場合だけ停止して確認する。

## Codex Responsibilities

- task・bug専用worktree/sandbox内で実装し、Verificationを実行する。
- Stop Conditionsを満たすまで実装と検証を繰り返す。
- レビュー通過後、integration-workerが承認済み差分をmain workspaceへ反映する。
- 変更ファイル、検証結果、残リスクを報告する。

## Prohibited Claude Actions

- 実装コードやテストを直接編集する。
- Codexのpatch案やレビュー修正を自分でコードへ転記する。
- main workspaceへのコード反映や競合解消を手作業で行う。
- Codexの失敗後に実装を引き継ぐ。

Codexが停止した場合、Claudeは原因、試したこと、必要な許可または環境変更を報告する。
