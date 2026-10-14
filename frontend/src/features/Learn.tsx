import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Leaf,
  HeartHandshake,
  Sprout,
} from "lucide-react";
import { api } from "../lib/api";
import { useApp } from "../lib/context";
import type { Article } from "../lib/types";
import { Brand, Footer, ErrorMessage } from "../components/UI";
export default function Learn() {
  const { slug } = useParams(),
    { user } = useApp(),
    [articles, setArticles] = useState<Article[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [filter, setFilter] = useState("All articles");
  function load() {
    setLoading(true);
    setError("");
    api<Article[]>("/articles")
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    api<Article[]>("/articles")
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const article = articles.find((a) => a.slug === slug),
    icons = [Leaf, Sprout, HeartHandshake, BookOpen];
  const body = (
    <>
      <ErrorMessage message={error} />
      {error && (
        <button className="button secondary" onClick={load}>
          Try again
        </button>
      )}
      {loading ? (
        <p role="status">Opening the library…</p>
      ) : slug ? (
        article ? (
          <article className="article">
            <Link to="/learn" className="inline-link">
              <ArrowLeft size={16} /> Back to the library
            </Link>
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.summary}</p>
            <div className="review-note">
              {article.review_status} · Sources checked{" "}
              {article.source_checked_at}
              <br />
              Educational summary. Not individual medical advice.
            </div>
            {article.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <section className="sources">
              <h2>Read from the source</h2>
              {article.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                  <ArrowUpRight size={16} />
                </a>
              ))}
              <p className="fine-print">
                The source organizations have not reviewed or endorsed Almanac.
              </p>
            </section>
          </article>
        ) : (
          <div className="empty-state">
            <h1>Article not found.</h1>
            <Link to="/learn">Return to the library</Link>
          </div>
        )
      ) : (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">UNDERSTANDING, ONE PAGE AT A TIME</p>
              <h1>A little knowledge.</h1>
              <p>Thoughtful reading for a more informed you.</p>
            </div>
            <BookOpen className="library-icon" size={42} strokeWidth={1} />
          </div>
          <div className="library-intro">
            <Leaf size={25} strokeWidth={1.2} />
            <p>
              There’s no single story of a cycle. Start with the basics, ask
              questions, and take what’s helpful into your next healthcare
              conversation.
            </p>
          </div>
          <div className="filters" aria-label="Filter articles">
            {[
              "All articles",
              "Menstrual health",
              "Family planning",
              "Getting support",
            ].map((f) => (
              <button
                key={f}
                aria-pressed={f === filter}
                className={f === filter ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="article-grid">
            {articles
              .filter(
                (a) =>
                  filter === "All articles" ||
                  a.category === filter.toUpperCase(),
              )
              .map((a) => {
                const Icon = icons[(a.id - 1) % icons.length];
                return (
                  <Link
                    to={`/learn/${a.slug}`}
                    className="article-card"
                    key={a.id}
                  >
                    <div className={`article-art art-${a.id % 4}`}>
                      <Icon size={72} strokeWidth={0.8} />
                      <span>THE ALMANAC LIBRARY</span>
                    </div>
                    <div>
                      <p className="eyebrow">{a.category}</p>
                      <h2>{a.title}</h2>
                      <p>{a.summary}</p>
                      <span className="article-link">
                        Read the article <ArrowRight size={17} />
                      </span>
                      <small>{a.review_status}</small>
                    </div>
                  </Link>
                );
              })}
          </div>
          <p className="library-disclaimer">
            Linked sources include the NHS and CDC. Summaries await qualified
            clinical review. This library does not diagnose conditions or
            prescribe contraception.
          </p>
        </>
      )}
    </>
  );
  return user ? (
    <>{body}</>
  ) : (
    <>
      <header className="public-header">
        <Brand />
        <nav>
          <Link to="/">Home</Link>
          <Link className="button primary" to="/register">
            Start your journal
          </Link>
        </nav>
      </header>
      <main id="main" className="public-library">
        {body}
      </main>
      <Footer />
    </>
  );
}
