# ベースとなる環境を選択
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# プロジェクトの設計図をコピー
COPY package*.json ./

# 必要な部品をインストール
RUN npm install

# プロジェクトの全ファイルをコピー
COPY . .

# 外部に公開するポート番号を指定
EXPOSE 8080

# サーバーを起動するコマンド
CMD [ "npm", "start" ]
