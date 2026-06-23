# Goal

`docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md` に記載された不具合を、完了条件を満たすまで修正してください。

# Context

このプロンプトの後に、バグ文書、関連設計書、対象ファイル、再現テスト、ログなどが添付されます。

# Constraints

- bug 専用 worktree/sandbox 内でのみ編集してください。
- main workspace を直接編集しないでください。
- 原因文書の `Fix Strategy` と既存アーキテクチャに従ってください。
- unrelated なリファクタリング、整形、リネームをしないでください。
- `git add`、`git commit`、`git push` を実行しないでください。
- sandbox や permission によりコマンドが失敗した場合、承認待ちにせず失敗内容を報告してください。

# Verification

- 元の不具合が再現しない。
- 再現テストまたは回帰テストが通る。
- 関連テスト、lint、typecheck が通る。

# Stop Conditions

- 不具合が再現せず、Verification をすべて満たしたら完了する。
- 仕様判断、データ修復、migration、互換性破壊が必要なら停止して質問する。
- sandbox、permission、外部依存により続行できない場合は、承認待ちにせず停止して報告する。
- 最終報告には次を含める。
- 変更内容と検証結果が報告される。
- main workspace に統合可能な diff が残る。

# Output format

```md
## Summary

## Root Cause Addressed

## Changed Files

## Verification

## Remaining Risks

## Questions
```

レポートの後、最終行に次のいずれかを必ず1つだけ出力してください。

```text
CODEX_RESULT: COMPLETE
CODEX_RESULT: BLOCKED
CODEX_RESULT: FAILED
```

- `COMPLETE`: 不具合が再現せず、Verificationを満たした。
- `BLOCKED`: ユーザー判断、permission、外部依存などで続行できない。
- `FAILED`: 修正または検証に失敗し、bug範囲内で回復できない。
