'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

export default function ApprovalPending() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; isApproved: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '認証エラー');
        }

        setUser(data.data);

        // 承認済みの場合はトップページにリダイレクト
        if (data.data.isApproved) {
          router.push('/');
        }
      } catch (err) {
        console.error('認証エラー:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.loading}>読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>承認待ち</h1>
        <div className={styles.message}>
          <p>こんにちは、{user?.name}さん</p>
          <p>現在、アカウントの承認を待っています。</p>
          <p>管理者が確認後、口コミの投稿が可能になります。</p>
          <p>承認までしばらくお待ちください。</p>
        </div>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            トップページに戻る
          </Link>
          <button
            onClick={() => router.push('/auth/logout')}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
} 