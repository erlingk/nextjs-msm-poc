import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const SITE_POSTS_QUERY = `*[
  _type == "sitePost"
  && site->siteId == $siteId
  && defined(masterPost)
] {
  _id,
  inheritanceEnabled,
  overriddenFields,
  masterPost->{title, slug, publishedAt},
  title,
  slug,
  publishedAt,
  "effectiveTitle": select(
    inheritanceEnabled == false => title,
    "title" in overriddenFields => title,
    masterPost->title
  ),
  "effectiveSlug": select(
    inheritanceEnabled == false => slug,
    "slug" in overriddenFields => slug,
    masterPost->slug
  ),
  "effectivePublishedAt": select(
    inheritanceEnabled == false => publishedAt,
    "publishedAt" in overriddenFields => publishedAt,
    masterPost->publishedAt
  ),
} | order(effectivePublishedAt desc)[0...12]`;

const options = { next: { revalidate: 5 } };

export default async function SitePostsPage({
    params,
}: {
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;
    const posts = await client.fetch<SanityDocument[]>(
        SITE_POSTS_QUERY,
        { siteId },
        options,
    );

    return (
        <main className="container mx-auto min-h-screen max-w-3xl p-8">
            <Link href="/" className="hover:underline">
                &larr; Back to sites
            </Link>
            <h1 className="text-4xl font-bold mb-8 mt-4">
                {siteId.toUpperCase()} Posts
            </h1>
            {posts.length === 0 ? (
                <p className="text-gray-500">No posts found for this site.</p>
            ) : (
                <ul className="flex flex-col gap-y-4">
                    {posts.map((post) => (
                        <li className="hover:underline" key={post._id}>
                            <Link
                                href={`/${siteId}/${post.effectiveSlug?.current}`}
                            >
                                <h2 className="text-xl font-semibold">
                                    {post.effectiveTitle}
                                </h2>
                                <p>
                                    {post.effectivePublishedAt &&
                                        new Date(
                                            post.effectivePublishedAt,
                                        ).toLocaleDateString()}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
