import { Link, createFileRoute } from "@tanstack/react-router";
import { Container, Disclaimer, buttonClass } from "@/abroadyield/components/ui";
import { seedBlog } from "@/abroadyield/data/config";
import { formatDate } from "@/abroadyield/engine";
import { Markdown } from "@/abroadyield/lib/markdown";
import { useSiteData } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield/blog/$slug")({
  head: ({ params }) => {
    const post = seedBlog.find((p) => p.slug === params.slug);
    return {
      meta: [
        { title: `${post?.title ?? "Article"} — AbroadYield` },
        { name: "description", content: post?.excerpt ?? "" },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { blog } = useSiteData();
  const post = blog.find((p) => p.slug === slug && p.published);
  if (!post) {
    return (
      <Container className="py-20">
        <h1 className="text-3xl font-semibold">Article not found</h1>
        <Link to="/abroadyield/blog" className={buttonClass("primary", "mt-6")}>
          All articles
        </Link>
      </Container>
    );
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
  };
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link to="/abroadyield/blog" className="text-sm text-ay-slate underline underline-offset-2">
        All articles
      </Link>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-ay-slate">
        {formatDate(post.publishedAt)} · {post.author}
      </p>
      <article className="mt-8 text-lg">
        <Markdown source={post.body} />
      </article>
      <Disclaimer className="mt-10" />
      <Link to="/abroadyield/start" className={buttonClass("primary", "mt-8")}>
        Get my free ranking
      </Link>
    </Container>
  );
}
