nodgyazo (gazo for node.js)
===========================

# 概要
gyazoのクローンサーバ
アップロードのみではなく、アップロードした後のデータをなるべく使いまわしたいなどなど。

# 本家との変更点
* テキストエンコードされたものをアップロードする仕様 -> mimetypeに合わせてそのままアップロードに変更
* リモート側のアドレスから、内部的に格納先を変更
* 年月日によるフォルダの分け
* redisによる内部データの管理
* thumbnail画像の処理を追加
* サーバ側に一覧表示機能を追加

# 仕様変更
/gyazoup post送信を行う。
アップロードフォームは次のような感じにする。

    <form action="/upload" method='post', enctype='multipart/form-data'>
      <input type='file' name='imagedata'>
      <input type='submit' value='Upload'>
    </form>


# 事前準備
幾つか外部ソフトが必要なのでインストールしておく

外部パッケージ
パッケージマネージャを利用してインストールしておく (debianの場合)

    $> sudo apt-get install graphicsmagick or ( imagemagick 無い場合)

外部ストレージ
ストレージにredisを利用しているので、実行マシンと同じ場所で動作させる。

    $> sudo apt-get install redis-server

現時点ではローカルサーバでのみ動作

テスト実行環境としてvagrantfileを用意しているのでそれを参照のこと


# セットアップ

git clone

    $> git clone git@github.com:youske/nodegyazo.git

初期設定node.jsのパッケージをインストール

    $> cd nodegyazo
    $> npm install -d && bower update


# 実行稼働のさせ方
開発環境

    $>nodejs app.js

# サービスとして運用させる
プロセスファイルを利用した起動

    $> pm2 start process.json

マルチプロセスに対応させる場合はprocess.jsonを変更する

# その他

## 内部的にデータを消す
一度取り込まれた画像は当システムでは削除しない
redisにて登録された画像情報はappconfigで設定される期間存続する。
削除画像を消す場合は別の仕組みで消すことを推奨する。


## graphicsmagick から imagemagickに変更する
画像処理はimagemagickを利用する。
graphicsmagickは導入しているケースが少ないため
model/picture.jsで設定されているので変更すること


## bowerにてjavascriptライブラリがエラーを起こす場合
git configを使って以下の設定を追加

> In case you might encounter the same issue...It turns out my machine behind firewall, that won't able to access git://github.com/jquery/jquery.git
Link: Unable to Connect to GitHub.com For Cloning
The solution without changing the firewall:

    git config --global url."https://".insteadOf git://
