import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="container my-5">
        <div className="jumbotron bg-light p-5 rounded">
          <h1 className="display-4">本当の口コミ</h1>
          <p className="lead">金融機関に関する正直な評価とレビューを共有するプラットフォーム</p>
          <hr className="my-4" />
          <p>銀行、証券会社、保険会社など様々な金融機関の口コミを検索して、あなたに合った金融サービスを見つけましょう。</p>
          <Link href="/institutions" className="btn btn-primary btn-lg">口コミを見る</Link>
        </div>
        
        <div className="row mt-5">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">金融機関を検索</h5>
                <p className="card-text">様々な金融機関の情報とレビューを探索できます。</p>
                <Link href="/search" className="btn btn-outline-primary">検索する</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">口コミを投稿</h5>
                <p className="card-text">あなたの経験を共有して、他の人の意思決定を助けましょう。</p>
                <Link href="/login" className="btn btn-outline-primary">ログイン</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">最新のトレンド</h5>
                <p className="card-text">高評価の金融機関や最新の口コミをチェックできます。</p>
                <Link href="/trends" className="btn btn-outline-primary">トレンドを見る</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
