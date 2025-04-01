import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="hero-section py-5 text-center text-white">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">本当の口コミ</h1>
          <div className="col-lg-8 mx-auto">
            <p className="lead mb-4">金融機関に関する正直な評価とレビューを共有するプラットフォーム</p>
            <p className="mb-4">銀行、証券会社、保険会社など様々な金融機関の口コミを検索して、あなたに合った金融サービスを見つけましょう。</p>
            <Link href="/institutions" className="btn btn-light btn-lg px-5 rounded-pill">
              口コミを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <i className="bi bi-search fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">金融機関を検索</h5>
                  <p className="card-text text-muted mb-4">様々な金融機関の情報とレビューを探索できます。</p>
                  <Link href="/search" className="btn btn-outline-primary rounded-pill px-4">
                    検索する
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <i className="bi bi-pencil-square fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">口コミを投稿</h5>
                  <p className="card-text text-muted mb-4">あなたの経験を共有して、他の人の意思決定を助けましょう。</p>
                  <Link href="/login" className="btn btn-outline-primary rounded-pill px-4">
                    ログイン
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <i className="bi bi-graph-up-arrow fs-1 text-primary"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">最新のトレンド</h5>
                  <p className="card-text text-muted mb-4">高評価の金融機関や最新の口コミをチェックできます。</p>
                  <Link href="/trends" className="btn btn-outline-primary rounded-pill px-4">
                    トレンドを見る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
