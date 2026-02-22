
import { useEffect, useState } from "react";
import "./index.css";

/* ---------------- NODES ---------------- */

const nodes = [
  /* -------- Column 1 - Property Intake -------- */
  { id: "address", label: "Property Address", x: 60, y: 80 },

  /* -------- Column 2 - Imagery Pipeline -------- */
  { id: "imagery", label: "Imagery API", x: 360, y: 80 },
  { id: "frontRoof", label: "Front & Roof Images", x: 360, y: 160 },
  { id: "objectDetect", label: "Object Detection", x: 360, y: 240 },
  { id: "vulnA", label: "Image-Based Vulnerability", x: 360, y: 320 },

  /* -------- Location Pipeline (Maintain Same 80px Rhythm) -------- */
  { id: "threat", label: "Threat Zones", x: 360, y: 400 },
  { id: "proximity", label: "Proximity Analysis", x: 360, y: 480 },
  { id: "vulnB", label: "Location-Based Vulnerability", x: 360, y: 560 },

  /* -------- Underwriting Inputs (Top-Aligned + Horizontal Spread) -------- */
  { id: "broker", label: "Broker Data", x: 600, y: 80 },
  { id: "submission", label: "Submission Details", x: 780, y: 80 },
  { id: "exclusion", label: "Property Exclusion", x: 960, y: 80 },

  /* -------- Risk Engine -------- */
  { id: "riskScore", label: "Property Risk Score", x: 760, y: 240 },
  { id: "propensityScore", label: "Underwriting Propensity Score", x: 760, y: 340 },
  { id: "propensityLevel", label: "Propensity Level", x: 760, y: 440 },

  /* -------- Final Outputs -------- */
  { id: "finalVuln", label: "Final Vulnerability", x: 1150, y: 240 },
  { id: "finalRisk", label: "Final Risk Score", x: 1150, y: 340 },
  { id: "finalPropensity", label: "Final Propensity", x: 1150, y: 440 },
];

/* ---------------- EDGES ---------------- */

const edges = [
  { id: "a-i", from: "address", to: "imagery" },

  { id: "i-fr", from: "imagery", to: "frontRoof" },
  { id: "fr-od", from: "frontRoof", to: "objectDetect" },
  { id: "od-va", from: "objectDetect", to: "vulnA" },

  { id: "i-th", from: "imagery", to: "threat" },
  { id: "th-pr", from: "threat", to: "proximity" },
  { id: "pr-vb", from: "proximity", to: "vulnB" },

  { id: "br-rs", from: "broker", to: "riskScore" },
  { id: "su-rs", from: "submission", to: "riskScore" },
  { id: "ex-rs", from: "exclusion", to: "riskScore" },

  { id: "va-rs", from: "vulnA", to: "riskScore" },
  { id: "vb-rs", from: "vulnB", to: "riskScore" },

  { id: "rs-ps", from: "riskScore", to: "propensityScore" },
  { id: "ps-pl", from: "propensityScore", to: "propensityLevel" },

  { id: "rs-fr", from: "riskScore", to: "finalRisk" },
  { id: "va-fv", from: "vulnA", to: "finalVuln" },
  { id: "vb-fv", from: "vulnB", to: "finalVuln" },
  { id: "pl-fp", from: "propensityLevel", to: "finalPropensity" },
];

/* ---------------- STEPS ---------------- */

const steps = [
  { text: "Receiving property address...", show: ["address"] },
  { text: "Fetching geospatial imagery...", show: ["imagery"], edges: ["a-i"] },

  { text: "Processing property visuals...", show: ["frontRoof"], edges: ["i-fr"] },
  { text: "Detecting key structural features...", show: ["objectDetect"], edges: ["fr-od"] },
  { text: "Calculating image-based vulnerability...", show: ["vulnA"], edges: ["od-va"] },

  { text: "Analyzing proximity to threat zones...", show: ["threat"], edges: ["i-th"] },
  { text: "Performing proximity analysis...", show: ["proximity"], edges: ["th-pr"] },
  { text: "Calculating location-based vulnerability...", show: ["vulnB"], edges: ["pr-vb"] },

  { text: "Loading broker performance data...", show: ["broker"] },
  { text: "Processing submission details...", show: ["submission"] },
  { text: "Evaluating property exclusions...", show: ["exclusion"] },

  { text: "Computing property risk score...", show: ["riskScore"], edges: ["br-rs","su-rs","ex-rs","va-rs","vb-rs"] },
  { text: "Evaluating underwriting propensity...", show: ["propensityScore"], edges: ["rs-ps"] },
  { text: "Determining propensity level...", show: ["propensityLevel"], edges: ["ps-pl"] },

  { text: "Finalizing risk outputs...", show: ["finalRisk","finalVuln","finalPropensity"], edges: ["rs-fr","va-fv","vb-fv","pl-fp"] },
];

/* ---------------- HELPERS ---------------- */

function getNode(id) {
  return nodes.find(n => n.id === id);
}

function generateCurve(from, to) {
  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 50;

  const fromCenterX = from.x + NODE_WIDTH / 2;
  const fromCenterY = from.y + NODE_HEIGHT / 2;

  const toCenterX = to.x + NODE_WIDTH / 2;
  const toCenterY = to.y + NODE_HEIGHT / 2;

  let startX, startY, endX, endY;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  // Decide anchor direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Mostly horizontal connection
    if (dx > 0) {
      // left → right
      startX = from.x + NODE_WIDTH;
      startY = fromCenterY;
      endX = to.x;
      endY = toCenterY;
    } else {
      // right → left
      startX = from.x;
      startY = fromCenterY;
      endX = to.x + NODE_WIDTH;
      endY = toCenterY;
    }
  } else {
    // Mostly vertical connection
    if (dy > 0) {
      // top → bottom
      startX = fromCenterX;
      startY = from.y + NODE_HEIGHT;
      endX = toCenterX;
      endY = to.y;
    } else {
      // bottom → top
      startX = fromCenterX;
      startY = from.y;
      endX = toCenterX;
      endY = to.y + NODE_HEIGHT;
    }
  }

  const controlOffset = 80;

  const controlX1 = startX + (dx * 0.3);
  const controlY1 = startY + (dy * 0.3);

  const controlX2 = endX - (dx * 0.3);
  const controlY2 = endY - (dy * 0.3);

  return `M ${startX} ${startY}
          C ${controlX1} ${controlY1},
            ${controlX2} ${controlY2},
            ${endX} ${endY}`;
}

/* ---------------- COMPONENT ---------------- */

export default function App() {
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [edgeProgress, setEdgeProgress] = useState({});
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    runFlow();
  }, []);

  const typeText = (text) => {
    return new Promise(resolve => {
      let i = 0;
      setDisplayText("");
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) {
          clearInterval(interval);
          setTimeout(resolve, 600);
        }
      }, 20);
    });
  };

  const animateEdge = (id) => {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        setEdgeProgress(prev => ({ ...prev, [id]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 15);
    });
  };

  const runFlow = async () => {
    for (let step of steps) {
      await typeText(step.text);

      if (step.show) {
        setVisibleNodes(prev => [...prev, ...step.show]);
      }

      if (step.edges) {
        await Promise.all(step.edges.map(e => animateEdge(e)));
      }
    }
  };

  return (
    <div className="container">
      <div className="stream-text">{displayText}</div>

      <svg className="edges">
        {edges.map(edge => {
          if (!visibleNodes.includes(edge.from) || !visibleNodes.includes(edge.to)) return null;

          const from = getNode(edge.from);
          const to = getNode(edge.to);
          const progress = edgeProgress[edge.id] || 0;
          const path = generateCurve(from, to);

          return (
            <g key={edge.id}>
              <path d={path} className="path-base" />
              <path
                d={path}
                className="path-progress"
                style={{
                  strokeDasharray: 1600,
                  strokeDashoffset: 1600 - (1600 * progress) / 100,
                }}
              />
            </g>
          );
        })}
      </svg>

      {nodes.map(node =>
        visibleNodes.includes(node.id) && (
          <div
            key={node.id}
            className="node fade-in"
            style={{ left: node.x, top: node.y }}
          >
            {node.label}
          </div>
        )
      )}
    </div>
  );
}