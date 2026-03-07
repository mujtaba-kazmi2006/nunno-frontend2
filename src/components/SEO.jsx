import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, path, schemaType = "WebSite" }) {
    const siteTitle = "Nunno Labs";
    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} — Educational AI for Market Analysis`;
    const siteDescription = description || "Nunno is an educational AI platform for market analysis, technical intelligence, and financial literacy. All insights are for learning purposes only — not financial advice.";
    const url = `https://nunno.cloud${path || ''}`;

    // Dynamic Schema selection
    const getSchema = () => {
        const baseSchema = {
            "@context": "https://schema.org",
            "@type": schemaType,
            "name": fullTitle,
            "description": siteDescription,
            "url": url
        };

        if (schemaType === "Course") {
            return {
                ...baseSchema,
                "provider": {
                    "@type": "Organization",
                    "name": "Nunno Labs",
                    "sameAs": "https://nunno.cloud"
                }
            };
        }

        if (schemaType === "SoftwareApplication") {
            return {
                ...baseSchema,
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Web"
            };
        }

        return baseSchema;
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={siteDescription} />
            <link rel="canonical" href={url} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={siteDescription} />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={siteDescription} />

            <script type="application/ld+json">
                {JSON.stringify(getSchema())}
            </script>
        </Helmet>
    );
}
