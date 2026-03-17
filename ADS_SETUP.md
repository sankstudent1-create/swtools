# Ads Setup (AdSense)

Use these environment variables in your deployment platform (for example Vercel):

- NEXT_PUBLIC_ADSENSE_CLIENT = ca-pub-xxxxxxxxxxxxxxxx
- NEXT_PUBLIC_AD_SLOT_GLOBAL_TOP = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_GLOBAL_BOTTOM = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_TOOLS_TOP = <numeric-slot-id>
- NEXT_PUBLIC_AD_SLOT_TOOLS_BOTTOM = <numeric-slot-id>

## Where these slots render

- global-top: site-wide top banner
- global-bottom: site-wide bottom banner
- tools-top: top banner for all /tools routes
- tools-bottom: bottom inline banner for all /tools routes

## Notes

- Use real AdSense slot IDs from your ad units. Do not use text placeholders.
- Ads only render when both NEXT_PUBLIC_ADSENSE_CLIENT and the matching slot variable are set.
- If variables are missing, the UI shows a reserved placeholder block.
