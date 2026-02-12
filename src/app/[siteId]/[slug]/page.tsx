import { PortableText, type SanityDocument } from "next-sanity";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/client";
import Link from "next/link";

const SITE_POST_QUERY = `*[
  _type == "sitePost"
  && site->siteId == $siteId
  && defined(masterPost)
] {
  _id,
  inheritanceEnabled,
  overriddenFields,
  masterPost->{_id, title, slug, publishedAt, image, body},
  title,
  slug,
  publishedAt,
  image,
  body,
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
  "effectiveImage": select(
    inheritanceEnabled == false => image,
    "image" in overriddenFields => image,
    masterPost->image
  ),
  "effectiveBody": select(
    inheritanceEnabled == false => body,
    "body" in overriddenFields => body,
    masterPost->body
  ),
}[effectiveSlug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
    projectId && dataset
        ? createImageUrlBuilder({ projectId, dataset }).image(source)
        : null;

const options = { next: { revalidate: 5 } };

export default async function SitePostPage({
    params,
}: {
    params: Promise<{ siteId: string; slug: string }>;
}) {
    const { siteId, slug } = await params;
    const post = await client.fetch<SanityDocument>(
        SITE_POST_QUERY,
        { siteId, slug },
        options,
    );

    if (!post) {
        return (
            <main className="container mx-auto min-h-screen max-w-3xl p-8">
                <Link href={`/${siteId}`} className="hover:underline">
                    &larr; Back to {siteId.toUpperCase()} posts
                </Link>
                <h1 className="text-4xl font-bold mt-4">Post not found</h1>
            </main>
        );
    }

    const postImageUrl = post.effectiveImage
        ? urlFor(post.effectiveImage)?.width(550).height(310).url()
        : null;

    return (
        <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
            <Link href={`/${siteId}`} className="hover:underline">
                &larr; Back to {siteId.toUpperCase()} posts
            </Link>
            {postImageUrl && (
                <img
                    src={postImageUrl}
                    alt={post.effectiveTitle}
                    className="aspect-video rounded-xl"
                    width="550"
                    height="310"
                />
            )}
            <h1 className="text-4xl font-bold mb-8">{post.effectiveTitle}</h1>
            <div className="prose">
                <p>
                    Published:{" "}
                    {post.effectivePublishedAt &&
                        new Date(
                            post.effectivePublishedAt,
                        ).toLocaleDateString()}
                </p>
                {Array.isArray(post.effectiveBody) && (
                    <PortableText value={post.effectiveBody} />
                )}
            </div>
        </main>
    );
}
