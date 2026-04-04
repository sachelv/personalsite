export default function AboutPage() {
  return (
    <div>
      <p className="mb-3" style={{ maxWidth: "600px" }}>
        I&rsquo;m still not quite sure what I&rsquo;m about, but I'm figuring out more every day. Thus far, I&rsquo;ve gathered that I enjoy being around people I
        trust and admire, I&rsquo;m often delusional, and I want to do great
        things.
      </p>

      <hr className="mb-3 border-t border-gray-400" />

      <h2
        className="text-sm font-bold mb-2"
        style={{ color: "var(--heading-accent)" }}
      >
        life chronology
      </h2>

      <Chronology />
    </div>
  );
}

type Bullet = string | { text: string; sub: string[] };

const chronology: { years: string; bullets: Bullet[] }[] = [
  {
    years: "2007-2017, childhood",
    bullets: [
      {
        text: "Born and raised in Las Vegas",
        sub: ["Parents immigrated there in 2002, for my dad's erosion research",
          "Cool place to grow up, planning to write something about how it affected me"
        ],
      },
      "Mostly eating dirt and watching PBS kids"
    ],
  },
  {
    years: "2017–2022, puberty",
    bullets: [
      "Did a bit of comp math, played a lot of fortnite/valorant, learned societal norms"
    ],
  },
  {
    years: "2022–2024, started doing stuff",
    bullets: [
      {
        text: "Spent a summer at Penn M&TSI after sophomore year. I regard this as a turning point in my life.",
        sub: [
          "Met amazing, ambitious people from around the world and realized I could be among them",
          "Met a kid doing matsci stuff, which I thought was cooler than all the cs stuff everyone else was doing"
        ],
      },
      "Started doing materials research with Clemens Heske at UNLV and Miriam Rafailovich at Stony Brook",
      "Won some science fairs and pitch comps, got really into tennis and climbing, joined mariachi and learned violin",
      {
        text: "Got into college had to pick between Stanford, Penn M&T, and a full-ride to Vanderbilt",
        sub: [
          "Picked Stanford, which I saw as a bet on myself. I'm trying to make sure I didn't bet wrong."
        ]
      }
    ],
  },
  {
    years: "freshman year",
    bullets: [
      "Knew I wanted to do startups, but decided to stick with materials and energy and work on hard things",
      "Met lots of awesome people, learned poker, many sidequests, got elected class president",
      "Thought I wanted to spin out wet lab research, planned to major in materials"
    ],
  },
  {
    years: "sophomore year",
    bullets: [
      "Spent fall at a fusion startup, but decided AI for materials is the most interesting thing for me to work on",
      "Came back and started studying physics and focusing on ml research",
      "Realized I've never learned to work as hard as my goals require. Actively trying to push myself harder.",
      "to be continued...",
    ],
  },
];

function Chronology() {
  return (
    <div className="flex flex-col gap-2.5">
      {chronology.map((entry) => (
        <div key={entry.years}>
          <p className="font-bold mb-0.5">{entry.years}</p>
          <ul className="list-none p-0 m-0 flex flex-col">
            {entry.bullets.map((bullet, i) => {
              const text = typeof bullet === "string" ? bullet : bullet.text;
              const sub = typeof bullet === "string" ? null : bullet.sub;
              return (
                <li key={i}>
                  <span className="md:whitespace-nowrap">- {text}</span>
                  {sub && (
                    <ul className="list-none p-0 m-0 pl-6 flex flex-col">
                      {sub.map((s, j) => (
                        <li key={j} className="md:whitespace-nowrap">- {s}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
