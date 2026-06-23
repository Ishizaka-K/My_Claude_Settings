# Goal

レビュー済みの task 実装を main workspace に反映してください。

# Context

このプロンプトの後に、承認済み diff、Task、設計書、レビュー結果、対象ファイルが添付されます。

# Constraints

- 承認済み diff とレビュー修正の範囲だけを反映してください。
- unrelated な編集、整形、リネーム、リファクタリングをしないでください。
- ユーザーの既存変更を上書き、削除、巻き戻ししないでください。
- conflict がある場合は推測で解決せず停止してください。
- `git add`、`git commit`、`git push` を実行しないでください。

# Verification

- main workspace の diff が承認済み内容と一致する。
- 対象 task の高速な関連テストが通る。
- unrelated な差分が増えていない。

# Stop Conditions

- 承認済み変更の反映と Verification が完了したら停止する。
- conflict、既存変更との競合、scope 外変更が必要なら停止して報告する。
- permission や sandbox で続行できない場合は承認待ちにせず停止して報告する。

# Output format

```md
## Integrated Changes

## Verification

## Conflicts

## Remaining Issues
```

レポートの後、最終行に次のいずれかを必ず1つだけ出力してください。

```text
CODEX_RESULT: COMPLETE
CODEX_RESULT: BLOCKED
CODEX_RESULT: FAILED
```

- `COMPLETE`: 承認済み変更の反映とVerificationを完了した。
- `BLOCKED`: conflict、既存変更、permissionなどにより続行できない。
- `FAILED`: 統合または検証に失敗し、許可範囲内で回復できない。
