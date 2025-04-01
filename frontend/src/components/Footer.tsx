import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>本当の口コミ</h5>
            <p className="text-muted">
              金融機関に関する正直な評価とレビューを共有するプラットフォーム
            </p>
          </div>
          <div className="col-md-3">
            <h5>リンク</h5>
            <ul className="list-unstyled">
              <li><Link href="/" className="text-decoration-none">ホーム</Link></li>
              <li><Link href="/institutions" className="text-decoration-none">金融機関</Link></li>
              <li><Link href="/about" className="text-decoration-none">サイトについて</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>ユーザー</h5>
            <ul className="list-unstyled">
              <li><Link href="/login" className="text-decoration-none">ログイン</Link></li>
              <li><Link href="/register" className="text-decoration-none">新規登録</Link></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h5>法的情報</h5>
            <ul className="list-unstyled">
              <li><Link href="/privacy" className="text-decoration-none">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="text-decoration-none">利用規約</Link></li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center text-muted">
          <small>&copy; {new Date().getFullYear()} 本当の口コミ. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 