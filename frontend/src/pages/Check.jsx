import SecurityScanner from '../components/SecurityScanner';

export default function Check() {
  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <SecurityScanner defaultMode="single" />
    </section>
  );
}
