import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  const careerSyncSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CareerSync",
    alternateName: "Career Sync",
    url: "https://career-sync.jpdeocampo.com/",
    applicationCategory: "Job Tracker",
    description:
      "CareerSync is your one-stop platform to track job applications, manage your career journey, and stay organized.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Metro Manila",
      addressRegion: "NCR",
      addressCountry: "PH",
    },
    sameAs: [
      "https://github.com/JPDeOcampo/",
      "https://www.linkedin.com/in/jonathandeocampo/",
      "https://www.instagram.com/jpdeocampo_17/",
    ],
  };
  return (
    <Html lang="en">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(careerSyncSchema) }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
