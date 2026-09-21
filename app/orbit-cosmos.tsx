// Animated "connected by curiosity" system for the homepage orbit card:
// a pulsing PAICONS core, three tilted orbits with named satellites
// (LEARN / CONNECT / BUILD) that leave comet trails, a radar sweep and a
// twinkling star field. Pure SVG + CSS, so it renders on the server and
// costs no JavaScript.

const CX = 260;
const CY = 260;
const RX = 236;
const RY = 118;
// A closed ellipse centred on the SVG centre, drawn as two arcs so
// <animateMotion> can travel it.
const ORBIT = `M ${CX - RX} ${CY} a ${RX} ${RY} 0 1 0 ${RX * 2} 0 a ${RX} ${RY} 0 1 0 ${-RX * 2} 0`;

const orbits = [
  { angle: -33, dur: 11, dir: 1, label: "LEARN", begin: -2 },
  { angle: 28, dur: 15, dir: -1, label: "CONNECT", begin: -6 },
  { angle: 89, dur: 19, dir: 1, label: "BUILD", begin: -9 },
] as const;

const stars = [
  [46, 70], [112, 30], [188, 88], [330, 36], [420, 74], [488, 40],
  [36, 210], [478, 190], [60, 350], [462, 330], [96, 470], [206, 498],
  [318, 486], [408, 452], [494, 470], [150, 150], [372, 150],
];

export function Cosmos() {
  return (
    <svg
      className="cosmos-svg"
      viewBox="0 0 520 520"
      role="presentation"
      focusable="false"
    >
      <defs>
        <radialGradient id="cosmos-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f2ffd9" />
          <stop offset="0.45" stopColor="#c9ff7d" />
          <stop offset="1" stopColor="#b9f464" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="cosmos-sweep"
          gradientUnits="userSpaceOnUse"
          x1={CX}
          y1="20"
          x2="414"
          y2="76"
        >
          <stop offset="0" stopColor="#b9f464" stopOpacity="0" />
          <stop offset="1" stopColor="#b9f464" stopOpacity="0.26" />
        </linearGradient>
        <filter id="cosmos-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {stars.map(([x, y], i) => (
        <circle
          key={i}
          className="cosmos-star"
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.8 : 1.2}
          style={{ animationDelay: `${(i % 7) * -0.6}s` }}
        />
      ))}

      <g className="cosmos-sweep">
        <path d={`M ${CX} ${CY} L ${CX} 20 A 240 240 0 0 1 414 76 Z`} fill="url(#cosmos-sweep)" />
      </g>

      {orbits.map((o) => (
        <g key={o.label} transform={`rotate(${o.angle} ${CX} ${CY})`}>
          <path d={ORBIT} className="cosmos-orbit" />
          <path d={ORBIT} className="cosmos-orbit-flow" />
          {/* comet trail: same path, lagging behind the leader */}
          {[
            { r: 5, o: 0.55, lag: 0.22 },
            { r: 4, o: 0.32, lag: 0.44 },
            { r: 3, o: 0.16, lag: 0.66 },
          ].map((t) => (
            <circle key={t.lag} className="cosmos-sat" r={t.r} fill="#b9f464" opacity={t.o}>
              <animateMotion
                dur={`${o.dur}s`}
                begin={`${o.begin + t.lag}s`}
                repeatCount="indefinite"
                path={ORBIT}
                keyPoints={o.dir === 1 ? "0;1" : "1;0"}
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          ))}
          <g className="cosmos-sat" filter="url(#cosmos-glow)">
            <circle r="6.5" fill="#e9ffc4" />
            <text className="cosmos-tag" x="12" y="-11" transform={`rotate(${-o.angle})`}>
              {o.label}
            </text>
            <animateMotion
              dur={`${o.dur}s`}
              begin={`${o.begin}s`}
              repeatCount="indefinite"
              path={ORBIT}
              keyPoints={o.dir === 1 ? "0;1" : "1;0"}
              keyTimes="0;1"
              calcMode="linear"
            />
          </g>
        </g>
      ))}

      <circle className="cosmos-ping" cx={CX} cy={CY} r="70" />
      <circle className="cosmos-ping cosmos-ping-2" cx={CX} cy={CY} r="70" />
      <circle className="cosmos-core" cx={CX} cy={CY} r="66" fill="url(#cosmos-core)" />
      <text className="cosmos-brand" x={CX} y={CY + 5} textAnchor="middle">
        PAICONS
      </text>
    </svg>
  );
}
