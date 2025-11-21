import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Stats() {
  const router = useRouter();
  const { code } = router.query;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (code) {
      fetch(`/api/links/${code}`)
        .then((r) => r.json())
        .then(setData);
    }
  }, [code]);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stats for {code}</h1>
      <p><b>URL:</b> {data.url}</p>
      <p><b>Clicks:</b> {data.clicks}</p>
      <p><b>Last Clicked:</b> {data.last_clicked || "Never"}</p>
    </div>
  );
}
