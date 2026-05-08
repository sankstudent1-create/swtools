export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.swinfosystems.online";
  return (
    <>
      <title>SW Tools</title>
      <meta
        name="description"
        content="SW Tools provides browser-based utilities for image resizing, compression, signature formatting, PDF generation, and scan cleanup."
      />
      <meta
        name="keywords"
        content="image tools, signature formatter, image resizer, image compressor, pdf maker, scan cleaner, watermark tool"
      />
      <link rel="canonical" href={siteUrl} />
    </>
  );
}
