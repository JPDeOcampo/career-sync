import Head from "next/head";

interface HelmetMetaProps {
  title?: string;
  description?: string;
  image?: string;
}

const HelmetMeta = ({
  title = "CareerSync",
  description = "CareerSync is your one-stop platform to track job applications, manage your career journey, and stay organized.",
  image = `/icons/og-preview.png`,
}: HelmetMetaProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="icon"
        type="image/png"
        href="/favicon/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${image}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${image}`} />
    </Head>
  );
};

export default HelmetMeta;
