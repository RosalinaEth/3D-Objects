import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hello World!"));

interface Score {
  Water: number;
  Air: number;
  Earth: number;
  Fire: number;
}

const quizData = [
  {
    question: "What's your ideal environment?",
    options: [
      { label: "Ocean", type: "Water" },
      { label: "Sky", type: "Air" },
      { label: "Forest", type: "Earth" },
      { label: "Volcano", type: "Fire" }
    ]
  },
  {
    question: "Pick a trait:",
    options: [
      { label: "Calm", type: "Water" },
      { label: "Free", type: "Air" },
      { label: "Grounded", type: "Earth" },
      { label: "Passionate", type: "Fire" }
    ]
  }
];

app.get("/", (c) => {
  return c.json({
    version: "vNext",
    image: "https://res.cloudinary.com/dzdas1gyp/image/upload/v1750974302/og-clean_h21k6u.jpg",
    post_url: "/submit",
    buttons: [
      { label: "Start quiz", action: "post", post_data: { step: 0, score: {} } }
    ]
  });
});

app.post("/submit", async (c) => {
  const body = await c.req.json();
  const step = Number(body.step) || 0;
  const answer = body.answer as keyof Score | null;
  const score: Score = body.score || { Water: 0, Air: 0, Earth: 0, Fire: 0 };

  if (answer) {
    score[answer] = (score[answer] || 0) + 1;
  }

  if (step >= quizData.length) {
    const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];

    return c.json({
      version: "vNext",
      image: `https://soul-element.vercel.app/images/${top.toLowerCase()}-farcaster-hyouka.jpg`,
      buttons: [
        {
          label: "Share result",
          action: "link",
          target: `https://farcaster.xyz/~/compose?text=I+got+${top}+in+the+Soul+Element+Quiz!+Try+it:+&embeds=https://soul-element.vercel.app`
        },
        {
          label: "Try again",
          action: "link",
          target: "https://soul-element.vercel.app"
        }
      ]
    });
  }

  const current = quizData[step];

  return c.json({
    version: "vNext",
    title: current.question,
    post_url: "/submit",
    buttons: current.options.map((opt) => ({
      label: opt.label,
      action: "post",
      post_data: {
        step: step + 1,
        score,
        answer: opt.type
      }
    }))
  });
});

export default app;

console.log("🟢 Server is running on localhost...");
