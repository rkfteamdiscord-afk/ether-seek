import { Link, createFileRoute } from "@tanstack/react-router";
import { Container, SectionHeading } from "@/abroadyield/components/ui";
import { formatDate } from "@/abroadyield/engine";
import { useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — AbroadYield" },
      {
        name: "description",
        content: "Plain-English articles on buying property abroad as a US taxpayer.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { blog } = useSiteData();
  const posts = blog
    .filter((p) => p.published)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <SectionHeading level={1} eyebrow="Blog" title="Plain-English guides for US buyers abroad" />
      <ul className="mt-10 divide-y divide-ay-line">
        {posts.map((post) => (
          <li key={post.id} className="py-6">
            <p className="text-sm text-ay-slate">
              {formatDate(post.publishedAt)} · {post.author}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              <Link
                to="/abroadyield/blog/$slug"
                params={{ slug: post.slug }}
                className="hover:underline"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-ay-slate">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
