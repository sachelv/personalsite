import Link from "next/link";

export default function WritingPage() {
  return (
    <div>
      <h1
        className="text-sm font-bold mb-4"
        style={{ color: "var(--heading-accent)" }}
      >
        writing
      </h1>
      <ul className="list-none p-0 m-0 flex flex-col gap-1">
        <li>
          <Link href="/writing/characteristic-flaws" className="text-xs">
            Characteristic flaws in autonomous materials discovery
          </Link>
        </li>
      </ul>
    </div>
  );
}
