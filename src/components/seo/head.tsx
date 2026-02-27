import { Helmet } from 'react-helmet-async';

import { siteConfig } from '@/config/site';

type HeadProps = {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
};

export function Head({
  title,
  description = siteConfig.description,
  image,
  type = 'website',
}: HeadProps) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
