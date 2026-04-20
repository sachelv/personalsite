import Link from "next/link";

export default function WritingPage() {
  return (
    <div>
      <h1 className="text-base font-bold mb-3">writing</h1>
      <ul className="list-disc pl-5 m-0 flex flex-col gap-1">
        <li>
          <Link href="/writing/characterization">
            You Can't Escape a Maze by Running Really Fast (AI for Materials Perspective Piece)
          </Link>
        </li>
        <li>
          <Link href="/writing/personal-statement">
            College Personal Statement (first thing I tried really hard to write)
          </Link>
        </li>
      </ul>
    </div>
    
  );
}
