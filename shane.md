# Shane's tasks (human-only)

Ordered by what each one unblocks. ✅ done · ⬜ open · ⏸ parked.

1. ⬜ **Pick the end-card styles to ship first** (art direction). Built and verified: Endpage,
   Slate, Announcement slate, Support end card. Not built: Notice / In memoriam, Title card, Show promo.
   Say which go live now; Claude links the picker to them the same day. (BUILD-endcards.md §10.1)
2. ⬜ **Decide where the studio lives** (hosting). Today: public at nashvillepbs.github.io/wnpt-lowerthird.
   Option: a wnpt.app subdomain behind Cloudflare Access like the other staff tools. Consequences and the
   recommendation are in BUILD-endcards.md §10.2. If you say move, Claude builds the Worker, the DNS
   record and the redirect; the one click that is yours: Cloudflare Zero Trust → Access → Applications →
   Add an application → Self-hosted → the new hostname → policy "Allow", include Emails ending in
   `@wnpt.org`, identity provider Entra → Save. Then tell Claude the hostname you chose.
3. ⬜ **Confirm the support card's facts** before anyone airs it: the address `wnpt.org/support`, the
   text-to-give keyword "GIVE" and number `1 (844) 213-5345`, and the terms line "Msg & Data rates may
   apply. Terms: wnpt.org/terms. Text STOP to cancel." They are the October 2026 On-Air template's
   defaults; this session did not verify them with Membership. Reply with corrections or "they stand".
4. ⬜ **Art direction defaults** (silence keeps them): the support card's fine print at the 40px on-air
   minimum (the template had 29px); the slate rail at 3 pattern columns; the full pattern field at 5
   rows; PBS KIDS on screen as the paired color digital file (design-system shane.md 5). Each is one
   config value in `endcards/endcards.js` (BUILD-endcards.md §5).
