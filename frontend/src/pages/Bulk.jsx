import SecurityScanner from '../components/SecurityScanner';

export default function Bulk() {
  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <SecurityScanner defaultMode="bulk" />
    </section>
  );
}
