import Link from "next/link";
import { ProFloLogo } from "./components/ProFloLogo";

export default function Home() {
  return (
    <main className="adminHome">
      <ProFloLogo size={48} showText />
      <p className="adminHome__tagline">Smart checkout. Smooth flow.</p>
      <h1 className="adminHome__title">Operations HQ</h1>
      <p className="adminHome__text">
        Catalogue, inventory, counter tokens, receipts, and store KPIs—one console for your ProFlo deployment.
      </p>
      <Link href="/admin" className="adminHome__link">
        Sign in to admin
      </Link>
    </main>
  );
}
