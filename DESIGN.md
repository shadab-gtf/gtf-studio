# Design contract

The user's explicit references determine the visual direction: a spacious, editorial landing page and a precise, quiet creative workspace. Original artwork is the expressive element; interface chrome stays restrained.

## Tokens

- Ink #17212b, muted #586572, paper #ffffff, canvas #f5f7fa, line #dce2e8.
- GTF cyan #29afe4 and pink #e24397; accessible action pink #bf2173 and action blue #087ca9.
- Pale cyan #eaf8fe, pale pink #fff0f7. Dark surface #171d26, dark canvas #10151d, dark text #f3f6fa.
- Self-hosted Manrope variable type. Display 48–88px, title 28–40px, body 15–18px, controls 13–14px.
- 4px spacing base, 12px card radius, 8px input radius, restrained offset shadows.

## Surfaces

Landing: large left-aligned headline, one primary action, an original template composition, a working studio preview, template browsing, and an honest local-first explanation.
Workspace: persistent navigation, search, format actions, document cards, list/grid controls and meaningful empty states.
Editor: compact header, tools and library at left, central canvas, inspector at right, pages at bottom. On mobile panels become accessible drawers and the canvas remains reachable.

## Interaction

Minimum 44px touch targets, visible focus, no hover-only actions, reduced-motion support. Save success means IndexedDB has committed; failure remains visible with retry and backup. Theme is shared across routes. The install prompt follows browser capability and remembers dismissal.
