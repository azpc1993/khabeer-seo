import { groq } from 'next-sanity';

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  excerpt,
  publishedAt
}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  mainImage,
  "authorName": author->name,
  "authorImage": author->image,
  "categories": categories[]->title,
  publishedAt,
  excerpt,
  body
}`;

export const postPathsQuery = groq`*[_type == "post" && defined(slug.current)][]{
  "slug": slug.current
}`;
