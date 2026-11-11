# CareerProof Global: brand basics

Files: `apps/web/public/brand/` (preview at `/brand/preview.html` on the dev server).

| File | Use |
|---|---|
| `careerproof-global-logo.svg` | Primary, horizontal, light backgrounds |
| `careerproof-global-logo-dark.svg` | Horizontal on dark (navy) backgrounds; wording turns white |
| `careerproof-global-stacked.svg` | Square spaces: social avatars, posters, slides |
| `careerproof-global-icon.svg` | App icon, home-screen icons, small spaces |
| `careerproof-global-icon-32.svg`, `-16.svg` | The same mark redrawn on 32 and 16 px grids for browser tabs (`icon.svg`, `favicon.ico`); regenerate with `node scripts/brand-icons.mjs` |

## The idea
A check mark drawn as a career path: two teal steps rising to a gold destination. The check says *proof* (verified); the nodes say *paths*.

## Colours
| Name | Hex | Where |
|---|---|---|
| CareerProof Blue | `#0A3D8F` | icon tile (lower right), site navy accents |
| Bright Blue | `#1257D1` | icon tile (upper left): the tile is a diagonal gradient Bright Blue to CareerProof Blue |
| Wordmark Blue | `#0B4AB0` | "Career" and "GLOBAL" on light backgrounds |
| Pathway Teal | `#00B4D8` | start of the "Proof" gradient, path nodes |
| Global Gold | `#FDC500` | end of the "Proof" gradient, destination node |

The "Proof" gradient runs Teal `#00B4D8` → `#00C8BA` → `#5DD389` → `#B4D24A` → Gold `#FDC500`. The middle stops are the perceptual (OKLCH) blend; a plain two-stop gradient turns olive in the middle and looks dull.
| Slate | `#475569` | slogan on light backgrounds |
| Navy | `#0B1F33` | dark backgrounds |

## Type
Plus Jakarta Sans: ExtraBold 800 (CareerProof), Bold 700 (GLOBAL, letter-spaced), Medium 500 (slogan). The SVGs fall back to Montserrat, Poppins, Segoe UI or Arial if the font is missing. **Before print or merchandise, convert the text to outlines** (Illustrator: Type > Create Outlines) so it looks identical everywhere.

## Slogan
Primary: **Map your path. Prove your future.**
Alternatives: "Your path, proven." · "Find your path. Prove your potential." · "Every career path, proven."

## Usage rules
- Keep clear space around the logo equal to the height of the gold node.
- **Below about 280 px wide, drop the slogan**; below about 160 px, use the icon alone.
- The gold end of "Proof" is pale on white, so for very small or low-quality print use solid teal `#00B4D8` or Blue for "Proof".
- Do not stretch, recolour the mark, add effects or place the light version on busy photos.
