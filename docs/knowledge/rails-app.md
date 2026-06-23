# Ruby on Rails アプリ開発の普遍知識

## 基本方針

Rails は convention over configuration に価値がある。まず Rails の標準構成に乗り、必要になった時だけ明確な責務を持つ層を追加する。

## Rails らしい構成

- Controller はリクエストを受け、認可、入力整理、レスポンス選択に集中する。
- Model は永続化対象のルール、関連、バリデーションを扱う。
- View は表示に集中し、複雑な判断を持ちすぎない。
- 複雑なユースケースは service object、form object、query object などに切り出す。
- ただし、早すぎる service object 化で Rails の標準的な読みやすさを壊さない。

## Active Record

- DB 制約と model validation の両方を適切に使う。
- N+1 クエリに注意し、必要に応じて eager loading する。
- callback は強力だが見えにくい副作用になるため、重要な業務処理を詰め込みすぎない。
- scope は合成しやすく、意図が明確な単位にする。
- migration は後戻り、データ量、ロック時間を考慮する。

## Controller と Routing

- RESTful な resource 設計を優先する。
- 1つの action に複数の責務を詰め込まない。
- Strong Parameters で許可する入力を明示する。
- 認証と認可を分けて考える。

## View

- partial は重複削減だけでなく、意味のある UI 単位で切る。
- helper に複雑な業務判断を入れすぎない。
- フォームでは validation error、再表示、アクセシビリティを意識する。

## セキュリティ

- SQL は Active Record の安全な API を優先する。
- XSS、CSRF、open redirect、mass assignment を意識する。
- 秘密情報は credentials や環境変数で扱い、リポジトリに置かない。
- 認可漏れは重大な欠陥として扱う。

## テスト

- Model spec/test は validation、関連、重要なドメインルールを確認する。
- Request spec/test は認証、認可、主要レスポンスを確認する。
- System test は重要なユーザーフローに絞る。
- factory は便利だが、暗黙の関連や過剰なデータ生成でテストを重くしない。

## 参照

- Ruby on Rails Guides: https://guides.rubyonrails.org/
- Rails Security Guide: https://guides.rubyonrails.org/security.html
- Rails Testing Guide: https://guides.rubyonrails.org/testing.html

