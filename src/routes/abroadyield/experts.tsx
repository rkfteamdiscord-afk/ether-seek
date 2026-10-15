import { createFileRoute } from "@tanstack/react-router";
import { ExpertForm } from "@/abroadyield/components/ExpertForm";
import { Card, Container, Disclaimer, SectionHeading } from "@/abroadyield/components/ui";

export const Route = createFileRoute("/abroadyield/experts")({
  head: () => ({
    meta: [
      { title: "Talk to a vetted expert — AbroadYield" },
      {
        name: "description",
        content:
          "Get introduced to a vetted US expat tax firm, international mortgage broker, local real estate agent or attorney.",
      },
    ],
  }),
  component: ExpertsPage,
});

function ExpertsPage() {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <SectionHeading
        level={1}
        eyebrow="Expert network"
        title="Talk to a vetted expert"
        intro="Tell us what you need and we'll introduce you to one partner who covers your country. Free for you, and only with your explicit consent."
      />
      <Card className="mt-8">
        <ExpertForm />
      </Card>
      <Disclaimer className="mt-8" />
    </Container>
  );
}
