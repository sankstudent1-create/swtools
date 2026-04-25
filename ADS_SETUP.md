# Ads Setup (AdSense)

Use these environment variables in your deployment platform (for example Vercel):

- NEXT_PUBLIC_ADS_ENABLED = true | false
- NEXT_PUBLIC_ADSENSE_CLIENT = ca-pub-xxxxxxxxxxxxxxxx
- NEXT_PUBLIC_AD_SLOT_GLOBAL_TOP = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_GLOBAL_BOTTOM = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_TOOLS_TOP = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_TOOLS_BOTTOM = <numeric-slot-id>

## Ads ON / OFF

- Turn ads ON: set `NEXT_PUBLIC_ADS_ENABLED=true`
- Turn ads OFF: set `NEXT_PUBLIC_ADS_ENABLED=false`
- After changing this flag, redeploy the project.

## Where these slots render

- global-top: site-wide top banner
- global-bottom: site-wide bottom banner
- tools-top: top banner for all /tools routes
- tools-bottom: bottom inline banner for all /tools routes

## Notes

- Use real AdSense slot IDs from your ad units. Do not use text placeholders.
- Ads only render when `NEXT_PUBLIC_ADS_ENABLED=true` and both `NEXT_PUBLIC_ADSENSE_CLIENT` plus the matching slot variable are set.
- If enabled but slot variables are missing, the UI shows a reserved placeholder block.

## SEO and Crawling Checklist

- Ensure `NEXT_PUBLIC_SITE_URL` is set to your production domain.
- Keep `robots.txt` and `sitemap.xml` publicly accessible.
- Verify Google ownership file is available at `/googlec504a98589d31ca6.html`.
- Submit `/sitemap.xml` in Google Search Console.
- Request indexing for `/`, `/tools`, and your top tool pages.
