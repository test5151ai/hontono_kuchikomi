'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link href="/" className="navbar-brand">本当の口コミ</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                href="/" 
                className={`nav-link ${pathname === '/' ? 'active' : ''}`}
              >
                ホーム
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/institutions" 
                className={`nav-link ${pathname.startsWith('/institutions') ? 'active' : ''}`}
              >
                金融機関
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/about" 
                className={`nav-link ${pathname === '/about' ? 'active' : ''}`}
              >
                サイトについて
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                href="/auth/login" 
                className={`nav-link ${pathname === '/auth/login' ? 'active' : ''}`}
              >
                ログイン
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/auth/register" 
                className={`nav-link ${pathname === '/auth/register' ? 'active' : ''}`}
              >
                新規登録
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 