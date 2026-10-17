import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { buttonClass } from "./ui";

/**
 * Floating glass action dock for phones. It slides up once the hero's call to action has
 * scrolled out of view, and back down when it returns, so there is always one primary action.
 */
export function MobileDock({ watch }: { watch: RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = watch.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry?.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [watch]);
  return (
    <div
      className="ay-dock ay-glass ay-no-print flex items-center gap-2 sm:hidden"
      data-visible={visible}
      aria-hidden={!visible}
    >
      <p className="flex-1 pl-3 text-sm leading-tight font-semibold">
        Your free ranking
        <span className="block font-normal opacity-75">3 minutes · no card</span>
      </p>
      <Link
        to="/abroadyield/start"
        tabIndex={visible ? 0 : -1}
        className={buttonClass("primary", "min-h-11 px-5")}
      >
        Start <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
