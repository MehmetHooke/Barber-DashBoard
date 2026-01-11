import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Slide = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  badge?: string;
};

type Props = {
  slides: Slide[];
  autoMs?: number;
  className?: string;
};

export default function UserHeroCarousel({ slides, autoMs = 5000, className }: Props) {
  const [index, setIndex] = React.useState(0);

  const hasSlides = slides && slides.length > 0;

  const goPrev = React.useCallback(() => {
    if (!hasSlides) return;
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [hasSlides, slides.length]);

  const goNext = React.useCallback(() => {
    if (!hasSlides) return;
    setIndex((prev) => (prev + 1) % slides.length);
  }, [hasSlides, slides.length]);

  React.useEffect(() => {
    if (!hasSlides) return;
    const t = window.setTimeout(() => goNext(), autoMs);
    return () => window.clearTimeout(t);
  }, [index, autoMs, goNext, hasSlides]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  if (!hasSlides) return null;

  const current = slides[index];

  return (
    <Card className={`w-full overflow-hidden border-border bg-card ${className ?? ""}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Hızlı Randevu</CardTitle>
            <CardDescription className="text-muted-foreground">
              Yeni randevu almak için öne çıkan seçenekler.
            </CardDescription>
          </div>

          <Badge variant="secondary">
            {index + 1}/{slides.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          {/* image stage */}
          <div className="relative h-56 w-full sm:h-64 md:h-72 lg:h-80">
            {/* images */}
            <div className="absolute inset-0">
              {slides.map((slide, i) => (
                <img
                  key={slide.id}
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className={[
                    "absolute inset-0 h-full w-full object-cover",
                    "transition-opacity duration-700 ease-in-out",
                    i === index ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* text + dots */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="space-y-1">
                {current.badge ? (
                  <Badge variant="secondary" className="bg-background/20 text-foreground">
                    {current.badge}
                  </Badge>
                ) : null}
                {current.title ? (
                  <div className="text-lg font-semibold text-white">{current.title}</div>
                ) : null}
                {current.subtitle ? (
                  <div className="text-sm text-white/80">{current.subtitle}</div>
                ) : null}
              </div>

              {/* dots */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={[
                      "h-2 w-2 rounded-full transition",
                      i === index ? "bg-white" : "bg-white/40 hover:bg-white/60",
                    ].join(" ")}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* nav buttons */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
