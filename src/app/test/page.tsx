'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPIs() {
      try {
        // Test database connection
        const dbRes = await fetch('/api/v1/test-db');
        const dbData = await dbRes.json();

        // Get users
        const usersRes = await fetch('/api/v1/users');
        const usersData = await usersRes.json();

        // Get portfolios
        const portfoliosRes = await fetch('/api/v1/portfolios');
        const portfoliosData = await portfoliosRes.json();

        setData({
          db: dbData,
          users: usersData,
          portfolios: portfoliosData,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    testAPIs();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">API Test Page</h1>

      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data?.db, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data?.users, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Portfolios</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data?.portfolios, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
