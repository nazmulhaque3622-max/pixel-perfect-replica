import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * The deliverable of this project is the standalone HTML/CSS/JS template in
 * /public/restaurant/ (built to the client's spec: no frameworks, later
 * converted to Laravel Blade). The app route simply forwards visitors to it.
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ember & Oak — Premium Restaurant Self-Ordering Interface" },
      {
        name: "description",
        content:
          "Standalone HTML/CSS/JS premium restaurant self-ordering menu template, ready for Laravel Blade integration.",
      },
      { property: "og:title", content: "Ember & Oak — Premium Restaurant Self-Ordering Interface" },
      {
        property: "og:description",
        content:
          "Browse the menu, filter by category, and add dishes to your cart in this premium self-ordering template.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/restaurant/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Opening the Ember &amp; Oak ordering interface…</p>
    </div>
  );
}
