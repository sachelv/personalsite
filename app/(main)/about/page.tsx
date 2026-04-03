export default function AboutPage() {
  return (
    <div>
      <h2
        className="text-sm font-bold mb-4"
        style={{ color: "var(--heading-accent)" }}
      >
        life chronology
      </h2>

      <Chronology />
    </div>
  );
}

const chronology = [
  {
    years: "2000–2010",
    bullets: [
      "born and raised somewhere cool, which is the coolest place in the world",
      "spent most of childhood being curious about everything",
    ],
  },
  {
    years: "2010–2018",
    bullets: [
      "moved around and attended various schools",
      "got really into [hobby] and competed at a regional level",
      "did some things that seemed important at the time, like writing a [project] and building a [thing]",
      "played video games (maybe best not to pry)",
    ],
  },
  {
    years: "2018–2022",
    bullets: [
      "went to university and studied [subject]",
      "joined a [club/team] and made lifelong friends",
      "started a side project that turned into something real",
      "moved cities, pivoted interests, figured some stuff out",
    ],
  },
  {
    years: "2022–present",
    bullets: [
      "working on [current thing] — still figuring out what it wants to be",
      "reading, cooking, and touching grass when possible",
    ],
  },
];

function Chronology() {
  return (
    <div className="flex flex-col gap-5">
      {chronology.map((entry) => (
        <div key={entry.years}>
          <p className="font-bold mb-0.5">{entry.years}</p>
          <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
            {entry.bullets.map((bullet, i) => (
              <li key={i}>- {bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
