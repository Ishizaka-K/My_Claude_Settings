# Python アプリ開発の普遍知識

## 基本方針

Python では、読みやすさ、明示性、テスト容易性を重視する。スクリプトから始めても、成長する可能性がある処理はモジュール、設定、I/O、ドメインロジックを分ける。

## プロジェクト構成

アプリやライブラリとして育てる場合は、次のような構成を検討する。

```text
project/
├── pyproject.toml
├── README.md
├── src/
│   └── package_name/
│       ├── __init__.py
│       ├── main.py
│       ├── domain/
│       ├── services/
│       └── adapters/
└── tests/
```

小さな個人スクリプトでは flat layout でもよいが、配布、テスト、CLI 化、依存管理を考えるなら `src/` layout が安全なことが多い。

## コード設計

- I/O と純粋な計算を分ける。
- 設定値は環境変数、設定ファイル、引数から読み込み、コードに埋め込まない。
- 関数は入力と出力を明確にする。
- 型ヒントを使い、複雑なデータは dataclass や Pydantic などで構造化する。
- 例外は握りつぶさず、呼び出し側が判断できる情報を残す。

## CLI とアプリ

- CLI entry point は薄くし、実処理は import 可能な関数に置く。
- `if __name__ == "__main__":` は起動用に限定する。
- 標準出力、ログ、戻り値の責務を分ける。
- バッチ処理では再実行性、冪等性、途中失敗時の復旧を設計する。

## 依存管理

- 依存関係は `pyproject.toml` などに集約する。
- 実行環境と開発環境の依存を分ける。
- 外部ライブラリを増やす時は、保守性、ライセンス、代替可能性を確認する。

## テスト

- ドメインロジックは単体テストする。
- ファイル、ネットワーク、時刻、乱数は差し替え可能にする。
- fixture は読みやすく、テストごとの意図が分かる粒度にする。
- エラー系、空入力、境界値を必ず確認する。

## 参照

- Python modules: https://docs.python.org/3/tutorial/modules.html
- Python unittest: https://docs.python.org/3/library/unittest.html
- Python Packaging User Guide, src layout: https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/

