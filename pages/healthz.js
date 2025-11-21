export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, version: "1.0" }));
  return { props: {} };
}

export default function Page() {
  return null;
}
