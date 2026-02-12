import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";

const SITES_QUERY = `*[_type == "site"] | order(title asc) { _id, title, siteId }`;

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 5 } };

export default async function IndexPage() {
    const [sites, posts] = await Promise.all([
        client.fetch<SanityDocument[]>(SITES_QUERY, {}, options),
        client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options),
    ]);

    return (
        <main className="container mx-auto min-h-screen max-w-3xl p-8">
            <h1 className="text-4xl font-bold mb-8">MSM POC</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Sites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sites.map((site) => (
                        <Link
                            key={site._id}
                            href={`/${site.siteId}`}
                            className="block p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="text-lg font-semibold">
                                {site.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                /{site.siteId}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">
                    Master Posts
                </h2>
                <ul className="flex flex-col gap-y-4">
                    {posts.map((post) => (
                        <li className="hover:underline" key={post._id}>
                            <Link href={`/${post.slug.current}`}>
                                <h3 className="text-xl font-semibold">
                                    {post.title}
                                </h3>
                                <p>
                                    {new Date(
                                        post.publishedAt,
                                    ).toLocaleDateString()}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
