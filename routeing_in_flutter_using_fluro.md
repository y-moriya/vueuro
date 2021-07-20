# Routing in Flutter using Fluro

あるページから別のページへのルーティングやナビゲートは、どんなアプリケーションにも不可欠です。私がFlutterやその他のフレームワークを初めて学んだとき、いつもあるルーティング機構から別の機構への移行という問題に直面していました。すべてのルーティングソリューションが`<a href="">`タグのようにシンプルであればいいのですが。

とはいえ、Flutterに内蔵されているルーティング機構に関しては、長いチュートリアルを受け、プロジェクトで何度も使用しているうちに、かなり簡単に理解できるようになっていましたが、Fluroが登場して驚きました。フロントエンドのウェブ開発に携わってきた人であれば、Fluroのルーティングの扱い方に違和感を覚えることはないでしょう。

このルーティング技術はかなりシンプルに理解できるのですが、GitHubの公式プロジェクトページでさえ、どこにも妥当なドキュメントがなかったので、このチュートリアルを書いているわけです。あなたのお役に立てれば幸いです。

_とにかく、口は災いの元。早速、コードを見てみましょう。_

* * *

## 私たちは何を作るのか？

何かを学び始めるためには、自分が何を作ろうとしているのかを知ることが大切です。これはモチベーションアップに役立つかもしれませんし、通りすがりの問題の解決策を見つけるための人でも、これは自分に役立つものだと思って飛びつくことができるでしょう。

**さて、こちらが今日作るアプリです。**

![img](https://miro.medium.com/max/640/1*XQyjzLxnr0rXn41icCgYfA.gif)

ご覧の通り、**シンプルな2ページアプリ**（ログイン画面とホーム画面）で、それぞれにフローティングアクションボタンがあり、他のページに移動することができます。

ログイン画面からホーム画面に移行する際には、ユーザー名などの追加情報が必要となるため、**ルートパラメータ**の一部として渡します。その方法をFluroで学んでいきましょう。

* * *

## さあ、コーディングを始めよう

Flutterは、誰でも簡単に手に入れて学ぶことができるフレームワークのひとつです。必要なのは、ちょっとした興味と根気だけです。

ここでは、あなたのPC/MacにFlutterがインストールされていて、少なくともAndroid SDKまたはXCode Librariesも一緒に持っていると仮定します。ゼロから始めたい方は、こちら[https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)のページをご覧になってください。

それでは、Flutterアプリの作成を始めましょう。私はターミナルを使うのが好きですが、どんなIDEでも使えます。

```bash
> flutter create fluro_tutorial
```

結果は以下のようになるはずです。すべてのチェックボックスが緑にチェックされていなくても気にしないでください。重要なのは最初のチェックボックスだけです。

![img](https://miro.medium.com/max/1050/1*lC5iAJ7vUKuT0xhuuYi5mg.png)

プロジェクトのディレクトリに入り、お好みのIDEで開いてみましょう。私はVS Codeを使っていますが、Android Studioでも問題ありません。

まず最初に、Fluroの最新バージョンを入手しましょう。このリンクにアクセスして、見出しの右隣にあるバージョン番号を取得してください： [https://pub.dev/packages/fluro](https://pub.dev/packages/fluro). このチュートリアルを書いている時点での最新バージョンは1.4.0なので、これを使います。

それでは、pubspec.yamlにアクセスして、依存関係にfluroパッケージを追加してください。バージョン番号の前の^（キャレット）記号は、新しいバージョンが来たらアップグレードできることを示しています。

```yaml
...
cupertino_icons: ^0.1.2
fluro: ^1.4.0
...
```

この行を追加した後、次のコマンドを実行すると、必要なパッケージがインターネットから取得されます。IDEをお持ちの方は、おそらくこのステップを実行してくれると思いますが、そうでない場合は、ターミナルでこのコマンドを実行してください。

```bash
> flutter packages get
```

lib/main.dartファイルにあったものを整理して、ページを表示する非常にシンプルなコンポーネントを入れてみましょう。

```dart
import 'package:flutter/material.dart';

import 'package:fluro_tutorial/pages/login.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fluro Tutorial',
      home: LoginPage(),
    );
  }
}
```

* * *

## さて、本題ですが……

分かっています、たくさんありました。もしあなたがFlutterの中級者であれば、わずか数ステップのために少し多すぎると感じたかもしれませんが、Flutterを初めて学ぶ人がこの記事をちらっと見たときのために、どのステップも手を抜きたくはありませんでした。

しかし、ここから先はストレートで、コードについての説明になります。
約束します。✌️

整理整頓が大切なので、「pages」というディレクトリの下に2つのファイルを作成しましょう。

### lib/pages/login.dart

```dart
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
      ),
      body: Center(
        child: Text('Please Login'),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.exit_to_app),
        onPressed: () {},
      ),
    );
  }
}
```

### lib/pages/home.dart

```dart
import 'package:flutter/material.dart';
class HomePage extends StatelessWidget {
  final String username;
  HomePage({this.username});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
      ),
      body: Center(
        child: Text('Welcome home, $username!'),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.settings_backup_restore),
        onPressed: () {},
      ),
    );
  }
}
```

今のところ、ホームページに移動する方法がありません。技術的には、LoginページのfloatingActionButtonをHomeページに移動させたいし、その逆も可能です。今からそれを実装してみましょう。

* * *

### ここまでのまとめ

1. 新しいFlutterプロジェクトを作成
2. pubspec.yamlにfluroパッケージを追加
3. シンプルなMaterialAppでmain.dartを更新
4. ログインページとホームページの2つのページ（ステートレス・ウィジェット）を作成

* * *

では、libフォルダ内にrouter.dartファイルを作成してみましょう。

### lib/router.dart

```dart
import 'package:flutter/material.dart';
import 'package:fluro/fluro.dart';
import 'package:fluro_tutorial/pages/home.dart';
import 'package:fluro_tutorial/pages/login.dart';
class FluroRouter {
  static Router router = Router();
  static Handler _loginHandler = Handler(handlerFunc: (BuildContext context, Map<String, dynamic> params) => LoginPage());
  static Handler _homeHandler = Handler(handlerFunc: (BuildContext context, Map<String, dynamic> params) => HomePage(username: params['username'][0]));
  static void setupRouter() {
    router.define(
      'login',
      handler: _loginHandler,
    );
    router.define(
      'home/:username',
      handler: _homeHandler,
    );
  }
}
```

FluroRouterクラスの最初の行では、FluroライブラリのRouter()の静的インスタンスを初期化しています。

```dart
static Router router = Router();
```

次にハンドラーですが、ここではルートにアクセスした際に、どのウィジェット/コンポーネントをロードしなければならないかを示す処理を行います。以前のフレームワークからの知識があれば、これらはコントローラと考えることができます。

```dart
// Handler for Login Page
static Handler _loginHandler = Handler(handlerFunc: (BuildContext context, Map<String, dynamic> params) => LoginPage());
// Handler for Home Page
static Handler _homeHandler = Handler(handlerFunc: (BuildContext context, Map<String, dynamic> params) => HomePage(username: params['username'][0]));
```

params['username'][0]は、ルートパスで送られてきたユーザー名を返し、HomePageに属性として送信されます。

次に、setupRouter()関数で、個々のルートとそのパスを定義します。また、パラメータがある場合は、ここで定義します。router.define()関数の詳細を見てみましょう。

```dart
router.define(
  'login', // This is the path 
  handler: _loginHandler, // This is it's corresponding handler
);
router.define(
  'home/:username', // username is a named parameter
  handler: _homeHandler,
);
```

では、main.dartファイルに戻り、MaterialAppを更新して、新しい超クールなRouterを使用していることを知らせましょう。

### lib/main.dart

```dart
import 'package:fluro_tutorial/router.dart';
import 'package:flutter/material.dart';
void main() {
  // Add this here to initialize the routes
  FluroRouter.setupRouter();
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fluro Tutorial',
      // Initial Page set to Login Page 
      initialRoute: 'login',
      // Use the generator provided by Fluro package
      onGenerateRoute: FluroRouter.router.generator
    );
  }
}
```

さて、あなたのページでは、Navigatorオブジェクトを使って、ページをスタック上にプッシュするだけでよいのです。では、それをやってみましょう。

### lib/pages/login.dart (2)

```dart
import 'package:flutter/material.dart';
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
      ),
      body: Center(
        child: Text('Please Login'),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.exit_to_app),
        onPressed: () {
          var username = 'AmruthPillai';
          Navigator.pushReplacementNamed(context, 'home/$username');
        },
      ),
    );
  }
}
```

Navigator.pushReplacementNamed()は、ユーザーが戻るボタンを押すだけでは前の画面に戻れないように、スタックを任意のルートに置換する関数です。万が一、画面を戻すような機能が必要な場合は、Navigator.pushNamed()を同じ属性で使用することができます。

Home Pageでは、パラメータを渡す必要がないので、pushReplacementNamed()を再度呼び出すだけの簡単な作業です。

### lib/pages/home.dart (2)

```dart
import 'package:flutter/material.dart';
class HomePage extends StatelessWidget {
  final String username;
  
  HomePage(this.username);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
      ),
      body: Center(
        child: Text('Welcome home, $username!'),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.settings_backup_restore),
        onPressed: () {
          Navigator.pushReplacementNamed(context, 'login');
        },
      ),
    );
  }
}
```

## そして、これで終わりです
