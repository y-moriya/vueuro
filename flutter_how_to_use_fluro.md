# How to use Fluro with Flutter - Custom Routing/Transitions

[link](https://developer.school/how-to-use-fluro-routing-with-flutter/)

![img](https://developer.school/content/images/size/w1000/2020/11/ds_fluro.png)

ルーティングは、アプリケーションの最も重要な部分の一つです。見落としがちですが、特に Flutter Web の安定版のリリースが近づくにつれ、URL バーは現在のアプリケーションの状態を表すべきだと思うようになりました。

ページを更新すると、現在のコンテキストが失われ、別の場所に移動してしまうような SPA を構築したり、使用したりしたことはありますか？私はあります。それは、ユーザーがあるページに直接移動したいと思っているかもしれないという事実を尊重していなかったからです（お気に入りからでも、直接でも）。

これはディープリンクと呼ばれるもので、このように考えると納得がいきます。

お問い合わせの詳細ページに直接アクセスできるようにしてほしい。

`https://developer.school/contacts/1`

つまり、パラメータとして現在の id を収集し、id が 1 の Contact をユーザーに提供する必要があります。

私たちのプロジェクトへようこそ! 今回は、Flutter と Fluro を使って、この連絡先リストアプリケーションを作ります。

## Project Setup

お使いのマシンに Flutter が正しくインストールされていることを確認し、ターミナルを開きます。以下を実行してください。

```bash
$ flutter create ds_fluro_contact_list
$ cd ds_fluro_contact_list
$ code . (or open this in your favourite editor)
```

### Pubspec.yaml

次は、pubspec.yaml を fluro パッケージで更新する必要があります。

```yaml
dependencies:
  flutter:
    sdk: flutter

  fluro: ^1.7.7

dev_dependencies:
  flutter_test:
    sdk: flutter
```

### Enable Flutter Web

もしあなたが私のように Flutter Web を使いたいと思っているなら、Flutter Web を有効にする必要があるかもしれません。そのためには、ベータチャンネルに参加して、--enable-web コマンドを実行する必要があります。

訳注：Flutter Web は正式に導入されているため、この手順は不要。

```bash
$ flutter channel beta
$ flutter upgrade
$ flutter config --enable-web
```

Flutter を使った Web アプリケーションの構築については、[こちら](https://flutter.dev/docs/get-started/web)で詳しく説明しています。

![img](https://developer.school/content/images/size/w1000/2020/11/image-24.png)

これで Flutter Web が有効になったので、VS Code のデバイスリストから Chrome を選択して、アプリケーションを Chrome で実行します。

最後に、デバッグプロセスを開始すると、自動的にプロジェクトの入った Chrome が開かれます。

注：VS Code を使用せず、ターミナルを使用している場合は、flutter run -d chrome を実行してください。

## Building the Contact Application

Fluro を調査するための準備が整いました! まず、ContactListPage / ContactDetailPage を Fluro なしで構築し（標準的な Navigator.of(context).push(Page.route())を使用）、それをページルートに変換します。

なぜ最初にこれを行うのか？それは、Master > Detail 画面を構築し、2 つのアプローチを直接比較することができるからです。

ここには、私たちが作るものがあります。

![img](https://developer.school/content/images/size/w1000/2020/11/image-25.png)

### Contact Model

まず、Contact モデルにいくつかのプロパティを定義してみましょう。

```Dart
@immutable
class Contact {
  final String id;
  final String name;

  const Contact({
    @required this.id,
    @required this.name,
  });
}
```

freezed を使ってパワフルなクラスを作る方法を知りたいですか？[そんな時は私の記事をご覧ください。](https://developer.school/how-to-use-freezed-with-flutter/)

次は、アプリケーション全体で使用できるように、定数の連絡先のリストを作成します。

```Dart
final List<Contact> contactList = [
  Contact(id: "1", name: "Paul"),
  Contact(id: "2", name: "Eric"),
  Contact(id: "3", name: "Alex"),
  Contact(id: "4", name: "Sarah"),
  Contact(id: "5", name: "Ivory"),
];
```

### ContactService

表示される連絡先のリストを取得するためには、以下のいずれかの ContactService を使用します。

a. 50%の確率でエラーが発生します（random.nextBool()を使用）。
b. 2 秒後に Contact または `List<Contact>`を返します。

これは、実際の API をモデル化し、UI での表示に満足できる程度の頻度でエラーを投げるためです。

```Dart
class ContactService {
  Future<List<Contact>> getContacts() async {
    try {
      await _shouldError("Can't get contact list.");
      return contactList;
    } catch (e) {
      return Future.error(e.toString());
    }
  }

  Future<Contact> getContactById(String id) async {
    try {
      await _shouldError("Cannot find contact with the ID of $id.");

      return contactList.firstWhere((Contact contact) => contact.id == id);
    } catch (e) {
      return Future.error(e.toString());
    }
  }

  Future<void> _shouldError(String errorMessage) async {
    Random random = Random();
    final shouldError = random.nextBool();

    if (shouldError) {
      return await Future.delayed(
        Duration(seconds: 2),
        () => throw Exception(errorMessage),
      );
    }

    return Future.delayed(Duration(seconds: 2));
  }
}
```

何度かテストした後で、shouldError を false に設定したり、完全に省略したりすることはご自由にどうぞ。

### ContactListPage

ContactListPage では、ユーザーに連絡先のリストを表示します。ここでは FutureBuilder を使用しており、ユーザーは以下の場合に FutureBuilder を更新することができます。

a. Future は Exception を返します。setState(() {})を呼び出して、この再構築をトリガーします。
b. Pull to Refresh ドロップダウンを使って、リストを更新します。

```Dart
class ContactListPage extends StatefulWidget {
  static Route<ContactListPage> route() =>
      MaterialPageRoute(builder: (context) => ContactListPage());

  @override
  _ContactListPageState createState() => _ContactListPageState();
}

class _ContactListPageState extends State<ContactListPage> {
  final ContactService _contactService = ContactService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Contact List"),
      ),
      body: FutureBuilder(
        future: _contactService.getContacts(),
        builder: (BuildContext context, AsyncSnapshot<List<Contact>> snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(snapshot.error),
                  TextButton(
                    onPressed: _refreshList,
                    child: const Text("Try Again"),
                  )
                ],
              ),
            );
          }

          if (snapshot.hasData) {
            final _contactList = snapshot.data;
            return RefreshIndicator(
              onRefresh: _refreshList,
              child: ListView.builder(
                itemCount: _contactList.length,
                itemBuilder: (BuildContext context, int index) {
                  final _contact = _contactList[index];

                  return ListTile(
                    title: Text(_contact.name),
                    subtitle: Text(_contact.id),
                    onTap: () => Navigator.of(context)
                        .push(ContactDetailPage.route(_contact)),
                  );
                },
              ),
            );
          }

          return Center(
            child: const Text("No Contacts Found"),
          );
        },
      ),
    );
  }

  Future<void> _refreshList() async {
    print("Reloading...");
    setState(() {});
  }
}
```

以下は、コンタクトリストの API コールにエラーが発生した場合の例です。

![img](https://developer.school/content/images/size/w1000/2020/11/image-27.png)

これで ContactListPage ができたので、main.dart ファイルのホームにしてみましょう。

```Dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fluro Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      debugShowCheckedModeBanner: false,
      home: ContactListPage(),
    );
  }
}
```

### ContactDetailPage

ContactDetailPage では、選択した Contact に関する情報を見ることができます。定義した route(Contact contact)関数を介してコンタクトを渡しています。

```Dart
static Route<ContactDetailPage> route(Contact contact) => MaterialPageRoute(
      builder: (context) => ContactDetailPage(contact),
    );
```

これを ContactDetailPage のコンストラクタに渡すことで、\_contact 変数を初期化し、build メソッドで使用することができます。

```Dart
final Contact _contact;
const ContactDetailPage(Contact contact) : _contact = contact;
```

ContactDetailPage の全体がこちらです。

```Dart
class ContactDetailPage extends StatelessWidget {
  static Route<ContactDetailPage> route(Contact contact) => MaterialPageRoute(
        builder: (context) => ContactDetailPage(contact),
      );

  final Contact _contact;
  const ContactDetailPage(Contact contact) : _contact = contact;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Contact Detail"),
      ),
      body: ListView(
        children: [
          ListTile(
            title: Text(_contact.name),
            subtitle: Text(_contact.id),
          ),
        ],
      ),
    );
  }
}
```

ユーザーインターフェイスを経由せずに ContactDetail ページに直接アクセスする方法がないので、Contact を直接このページに渡すことができます。次の例では、「データベース」から Contact を取得するための ID を渡すように変更してみましょう。

### Using Fluro

Navigator の標準的な方法で Master ＞ Detail view を作成する方法を確立しましたが、それを fluro に移行してみましょう。連絡先にディープリンクを張り、検索エンジンで検索できるようにします。

#### AppRouter

先に AppRouter クラスを作成して、FluroRouter やその他のルート固有の情報を格納しましょう。

```Dart
@immutable
class AppRouter {
  static FluroRouter router = FluroRouter.appRouter;

  final List<AppRoute> _routes;
  final Handler _notFoundHandler;

  List<AppRoute> get routes => _routes;

  const AppRouter({
    @required List<AppRoute> routes,
    @required Handler notFoundHandler,
  })  : _routes = routes,
        _notFoundHandler = notFoundHandler;

  void setupRoutes() {
    router.notFoundHandler = _notFoundHandler;
    routes.forEach(
      (AppRoute route) => router.define(route.route, handler: route.handler),
    );
  }
}
```

#### AppRoutes

次に、AppRoute インスタンスを定義する必要があり、AppRoutes クラスで囲みました。各 AppRoute には、route と handler に加えて、カスタムトランジションを可能にする様々なオプションのパラメータが必要です。

```Dart
class AppRoutes {
  static final routeNotFoundHandler = Handler(
      handlerFunc: (BuildContext context, Map<String, List<String>> params) {
    debugPrint("Route not found.");

    return RouteNotFoundPage();
  });

  static final rootRoute = AppRoute(
    '/',
    Handler(
      handlerFunc: (context, parameters) => HomePage(),
    ),
  );

  static final contactListRoute = AppRoute(
    '/contacts',
    Handler(
      handlerFunc: (context, parameters) => ContactListPage(),
    ),
  );

  static final contactDetailRoute = AppRoute(
    '/contacts/:id',
    Handler(
        handlerFunc: (BuildContext context, Map<String, List<String>> params) {
      final String contactId = params["id"][0];

      return ContactDetailPage(contactId);
    }),
  );

  /// Primitive function to get one param detail route (i.e. id).
  static String getDetailRoute(String parentRoute, String id) {
    return "$parentRoute/$id";
  }

  static final List<AppRoute> routes = [
    rootRoute,
    contactListRoute,
    contactDetailRoute,
  ];
}
```

このクラスを読んでみると、比較的簡単に説明できることがわかるでしょう。ルートにハンドラを定義することで、ルートが解決される前にコードを実行することができます。 contactDetailRoute で見られるように、これを使って contactId を取得し、ContactDetailPage に渡しています。

また、Contact を副次的なルートに渡すのではなく、データベースから Contact を照会できるように String に移行していることにもお気づきでしょう。

これは重要なことで、contacts/3 に直接移動した場合、Contact は現在どのコンテキストにも存在していないので、偽のデータベースに Contact を問い合わせることができます。

### HomePage

![img](https://developer.school/content/images/size/w1000/2020/11/image-28.png)

アプリケーションのルートを HomePage ウィジェットに設定しました。

これは、/contacts ページへのリンクを含む、シンプルな StatelessWidget です。

```Dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Home Page",
              style: Theme.of(context).textTheme.headline6,
            ),
            SizedBox(
              height: 6,
            ),
            Text(
              "Fluro routing examples",
              style: Theme.of(context).textTheme.bodyText2,
            ),
            SizedBox(
              height: 10,
            ),
            TextButton(
              onPressed: () => AppRouter.router.navigateTo(
                context,
                AppRoutes.contactListRoute.route,
              ),
              child: const Text("Contact List"),
            )
          ],
        ),
      ),
    );
  }
}
```

### RouteNotFoundPage

![img](https://developer.school/content/images/size/w1000/2020/11/image-29.png)

AppRouter().setupRoutes()関数内で割り当てられている routeNotFoundHandler に示されているように、定義されたルートと一致しないルートがある場合、"Not Found"というページを設定することができます。

```Dart
class RouteNotFoundPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Route not found"),
            TextButton(
              onPressed: () => AppRouter.router.navigateTo(
                context,
                AppRoutes.contactListRoute.route,
                replace: true,
                clearStack: true,
                transition: TransitionType.none,
              ),
              child: const Text("Go Home"),
            )
          ],
        ),
      ),
    );
  }
}
```

### Initialising Fluro

これで AppRouter と AppRoutes ができたので、先に main.dart 内の MyApp ウィジェットを StatefulWidget に変更します。これは、initState()の中で setupRoutes 関数を呼び出すためです。

```Dart
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();

    AppRouter appRouter = AppRouter(
      routes: AppRoutes.routes,
      notFoundHandler: AppRoutes.routeNotFoundHandler,
    );

    appRouter.setupRoutes();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fluro Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      onGenerateRoute: AppRouter.router.generator,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

また、MaterialApp から home を削除し、代わりに AppRouter.router.generator を指す onGenerateRoute に変更しています。

### Navigation

Navigator.of(context).push(Page.route())の代わりに、AppRouter.router.navigateTo(context, route)を使うことができるようになりました。これを更新する必要がある最初のエリアの 1 つは、ContactListPage の内部です。

ListView.builder を更新して、Contact の代わりに String を渡すようにしました。

```Dart
ListView.builder(
  itemCount: _contactList.length,
  itemBuilder: (BuildContext context, int index) {
    final _contact = _contactList[index];

    return ListTile(
      title: Text(_contact.name),
      subtitle: Text(_contact.id),
      onTap: () => AppRouter.router.navigateTo(
        context,
        AppRoutes.getDetailRoute(
          AppRoutes.contactListRoute.route,
          _contact.id,
        ),
      ),
    );
  },
),
```

ここではデモのために AppRoutes.getDetailRoute を使用していますが、同様に簡単に行うことができます。

```Dart
AppRouter.router.navigateTo(
  context,
  "contacts/${_contact.id}",
);
```

### ContactDetailPage Updates

これは、ContactDetail ページを更新して、ID から Contact を取得するようにしないと、まだうまくいきません。

最初は、これは少し冗長だと感じるかもしれません。ローカルにある可能性があるときに、データベースに連絡先を常に尋ねる必要はないからです。 その場合は、ネットワークに問い合わせる前に、ローカルアプリの状態を確認する必要があります。

いずれにしても、ユーザーが初めて詳細表示に移動したときのことを考えると、ローカルな状態に完全に依存することはできません。

ContactDetailPage を StatefulWidget に更新し、FutureBuilder を使用して getContactById(widget.\_contactId)を呼び出します。

```Dart
class ContactDetailPage extends StatefulWidget {
  final String _contactId;
  const ContactDetailPage(String contactId) : _contactId = contactId;

  @override
  _ContactDetailPageState createState() => _ContactDetailPageState();
}

class _ContactDetailPageState extends State<ContactDetailPage> {
  final ContactService _contactService = ContactService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Contact Detail"),
        leading: Navigator.of(context).canPop()
            ? IconButton(
                icon: Icon(Icons.chevron_left),
                onPressed: () => AppRouter.router.pop(context),
              )
            : IconButton(
                icon: Icon(Icons.home),
                onPressed: () => AppRouter.router.navigateTo(
                  context,
                  AppRoutes.contactListRoute.route,
                  replace: true,
                  clearStack: true,
                ),
              ),
      ),
      body: FutureBuilder(
        future: _contactService.getContactById(widget._contactId),
        builder: (BuildContext context, AsyncSnapshot<Contact> snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(snapshot.error),
                  TextButton(
                    onPressed: _refreshList,
                    child: const Text("Try Again"),
                  )
                ],
              ),
            );
          }

          if (snapshot.hasData) {
            final _contact = snapshot.data;
            return ListTile(
              title: Text(_contact.name),
              subtitle: Text(_contact.id),
            );
          }

          return Center(
            child: const Text("Couldn't find contact."),
          );
        },
      ),
    );
  }

  Future<void> _refreshList() async {
    print("Reloading...");
    setState(() {});
  }
}
```

アップデートされた ContactDetailPage についての注意点です。

1.ナビゲーションスタックにルートがない時の導線を変更しました。これが意図されたものかどうかはわかりませんが ContactDetail ページから戻ることができないことがあるので、Navigator.canPop()で簡単なチェックをすることで、戻るボタンやホームボタンを表示することができます。

2.ホームルートに replace: true と clearStack: true を追加しました。これは、プログラムでルートを置き換え、ナビゲーションスタックをクリアする方法の例です。

### Navigating Through our App

アプリケーションを HomePage から順に見ていくと、次のようになります。

1. `http://localhost:50418/#/` - HomePage
2. `http://localhost:50418/#/contacts` -Contacts List Page
3. `http://localhost:50418/#/contacts/1` - Contacts Detail Page - ID 1
4. `http://localhost:50418/#/contacts/3` - Contacts Detail Page - ID 3
5. `http://localhost:50418/#/asdf` - Route Not Found Page

### Transitions

Fluro でナビゲーションができるようになったので、ルートごとにトランジションを選択して、体験をカスタマイズすることができます。それでは、navigateTo の呼び出しごとに様々なトランジションを選択して楽しんでみましょう。

### HomePage_

ユーザーを ContactList に送る HomePage の TextButton を TransitionType.cupertino の TransitionType で更新します。

```Dart
TextButton(
  onPressed: () => AppRouter.router.navigateTo(
    context,
    AppRoutes.contactListRoute.route,
    transition: TransitionType.cupertino,
  ),
  child: const Text("Contact List"),
)
```

#### CntactListPage

次に、ContactListPage 内の ListTile を更新し、TransitionType.fadeIn を使用します。

```Dart
return ListTile(
  title: Text(_contact.name),
  subtitle: Text(_contact.id),
  onTap: () => AppRouter.router.navigateTo(
    context,
    AppRoutes.getDetailRoute(
      AppRoutes.contactListRoute.route,
      _contact.id,
    ),
    transition: TransitionType.fadeIn,
  ),
);
```

### Custom Transitions

また、TransitionType を custom に設定し、transitionBuilder を用意することで、カスタムトランジションを使用することができます。ここでは、画面の中央からページが伸びていく例を紹介します。

```Dart
return ListTile(
  title: Text(_contact.name),
  subtitle: Text(_contact.id),
  onTap: () => AppRouter.router.navigateTo(
    context,
    AppRoutes.getDetailRoute(
      AppRoutes.contactListRoute.route,
      _contact.id,
    ),
    transition: TransitionType.custom,
    transitionBuilder:
        (context, animation, secondaryAnimation, child) =>
            ScaleTransition(
      scale: animation,
      child: child,
      alignment: Alignment.center,
    ),
  ),
);
```

Google が提供する animations パッケージのカスタムトランジションを使用することもできます。試してみたい方は、pubspec.yaml に以下の内容を追加してください。

```yaml
dependencies:
  flutter:
    sdk: flutter

  fluro: ^1.7.7
  animations: ^1.1.2
```

そして、SharedAxisTransition を使用するように transitionsBuilder を更新します。

```Dart
return ListTile(
  title: Text(_contact.name),
  subtitle: Text(_contact.id),
  onTap: () => AppRouter.router.navigateTo(
    context,
    AppRoutes.getDetailRoute(
      AppRoutes.contactListRoute.route,
      _contact.id,
    ),
    transition: TransitionType.custom,
    transitionBuilder:
        (context, animation, secondaryAnimation, child) =>
            SharedAxisTransition(
      animation: animation,
      secondaryAnimation: secondaryAnimation,
      transitionType: SharedAxisTransitionType.scaled,
      child: child,
    ),
  ),
```

## Summary

今回は、Navigator.push を使った小さな Master > Detail アプリケーションを、ルートベースに変更する方法を見てみました。その過程で、Fluro に組み込まれている様々なトランジションを調べ、独自のトランジションを作成し、アニメーションパッケージを使って少しスパイスを加えてみました。

You can find the code for this article here: `https://github.com/PaulHalliday/ds_fluro_contact_list`

I hope this has been worthwhile. If you'd like to read more about Fluro, I'd recommend checking the documentation: `https://pub.dev/packages/fluro`

Let me know in the comments if I've missed anything that you'd like to see.
