# Trin 2: Avatar indsat i Dagsplan Scener (Master Prompt)

Dette dokument indeholder prompts til at indsætte figuren fra **Trin 1** i alle aktivitetsscenerne (f.eks. kaffe, medicin, bad, børste tænder, måltider, pligter og sengetid).

> [!IMPORTANT]
> **Tøjkonsistens fra Trin 1 Avatar:**
> Modellen skal reproducere PRÆCIS det tøj og udseende, som figuren har på i **Billede 1** (Trin 1 avataren). Ingen ændring til standardsæt eller hættetrøje, medmindre Billede 1 viser det!

---

## 🚀 Hovedmetode: 20-i-1 Master Ark (2x10 Gitter i 1080x1920)

Ved at generere 20 scener på ét samlet ark sparer du 95% af dine ChatGPT/DALL-E kvoter og sikrer maksimal karakter- og tøjkonsistens på tværs af hele dagsplanen!

### Matematikken bag 2x10 layoutet (25% Skalering)
- Piktogramkortets standardformat er **2126 x 740 pixels** (aflangt format, ratio ~2.87:1).
- Skaleret til **25%** fylder hver scene ca. **531.5 x 185 pixels**.
- På et standard højformat lærred (**1080 x 1920 pixels**, 9:16 portrait):
  - **2 søjler** fylder: $531.5 \times 2 = 1063\text{ px}$ (passer perfekt i 1080 px bredde med 17 px margen).
  - **10 rækker** fylder: $185 \times 10 = 1850\text{ px}$ (passer perfekt i 1920 px højde med 70 px margen).
- Scriptet `slice-sheet-2x10.py` forstørrer automatisk hver celle med 4x (400%) tilbage til det fulde knivskarpe **2126 x 740** WebP-format med gennemsigtig baggrund!

---

### Billeder der skal vedhæftes i ChatGPT:
1. **Billede 1 (Ref 1):** Din færdige cartoon avatar (`reference/personas/<avatar_id>/avatar.webp`).
2. **Billede 2 (Ref 2):** Tegnestilsreferencen ([`style_guide/ref2_example.jpg`](ref2_example.jpg)).
3. **Billede 3 (Valgfrit layout):** Gitterreferencen ([`style_guide/sheet_2x10_example.png`](sheet_2x10_example.png)).

---

### Prompt til ChatGPT (Kopier direkte):

```markdown
# 20-in-1 Master Sheet Prompt — 2x10 Daily Schedule Grid (Transparent Background)

Please attach:
- Image 1: Avatar character & clothing reference (Ref 1)
- Image 2: Art style reference (Ref 2 - bold smooth black outlines, flat saturated colors, friendly cartoon)
- Image 3 (Optional): Layout grid reference (sheet_2x10_example.png)

Format & Canvas:
- Canvas: One tall portrait sheet (9:16 aspect ratio, 1080 x 1920 pixels).
- Grid Layout: Exactly 2 columns × 10 rows (20 distinct standalone scene cells in total).
- Cell Aspect Ratio: Wide/horizontal (~2.8:1 ratio, approx 531 x 185 px at 25% scale), arranged side-by-side in 2 clean vertical columns.
- 100% Genuine Transparent Background: Pure alpha channel transparency. NO background panels, NO boxes, NO white card frames, NO background walls or floors. Only the character and immediate activity props are visible.
- Spacing: Generous clear transparent space between rows and columns so each scene can be sliced cleanly without touching adjacent scenes.

The 20 Distinct Scenes (Organized Morning to Night):

### Row 1:
- [Row 1, Col 1 — Breakfast]: Character sitting at the dining table eating breakfast from a bowl with a spoon and milk carton, smiling.
- [Row 1, Col 2 — Make Bed]: Character making the bed, neatly smoothing out the duvet and fluffing the white pillow.

### Row 2:
- [Row 2, Col 1 — Shower]: Character happily taking a shower, washing hair with shampoo foam and gentle water droplets.
- [Row 2, Col 2 — Brush Teeth]: Character brushing teeth with a toothbrush and white foam in front of the bathroom sink.

### Row 3:
- [Row 3, Col 1 — Get Dressed]: Character putting on their authentic clothes and adjusting them with a pleased smile.
- [Row 3, Col 2 — Medicine]: Character taking daily medicine at the table with a glass of water and pill blister pack.

### Row 4:
- [Row 4, Col 1 — Coffee & Tea]: Character sitting cozily holding a steaming hot coffee mug with both hands, kettle on table.
- [Row 4, Col 2 — Morning Roll]: Character enjoying a freshly baked buttered bread roll, holding it cheerfully with both hands.

### Row 5:
- [Row 5, Col 1 — Lunch / Mealtime]: Character eating lunch (open-faced sandwiches on a plate) with knife and fork.
- [Row 5, Col 2 — Wash Dishes]: Character washing plates in the kitchen sink with a dish brush, gentle suds, and dish rack.

### Row 6:
- [Row 6, Col 1 — Hang Laundry]: Character hanging clean wet laundry with clothes pegs on a drying rack next to a basket.
- [Row 6, Col 2 — Activities / Hobby]: Character sitting at a hobby desk drawing with colorful markers or listening to music.

### Row 7:
- [Row 7, Col 1 — Outdoor Walk]: Character walking in fresh air along a park pathway with a relaxed, cheerful smile.
- [Row 7, Col 2 — Grocery Shopping]: Character carrying a grocery shopping basket filled with daily groceries in a supermarket.

### Row 8:
- [Row 8, Col 1 — Sofa Rest / TV]: Character resting cozily on a living room sofa holding a TV remote control.
- [Row 8, Col 2 — Trash & Recycling]: Character carrying a green garbage bag and empty returnable bottles to the recycle bin.

### Row 9:
- [Row 9, Col 1 — Prepare Dinner]: Character preparing evening meal at the kitchen counter with a cutting board and cooking pot.
- [Row 9, Col 2 — Night Hygiene]: Character washing hands and face at the bathroom sink, getting ready for the night.

### Row 10:
- [Row 10, Col 1 — Bedtime / Sleep]: Character sleeping peacefully tucked in bed under a soft duvet with head resting on pillow.
- [Row 10, Col 2 — Weekend Relaxation]: Character enjoying a calm weekend outdoor moment with relaxed posture and a warm smile.

Critical Requirements:
1. All 20 scenes MUST be generated on this single 1080x1920 image in the exact 2x10 grid order.
2. Character must be 100% identical to Image 1 across all 20 cells, wearing the EXACT same clothing shown in Image 1.
3. Completely transparent background (PNG alpha). Only the character and direct scene props are visible.
4. No text, labels, numbers, or border lines.
```

---

## ✂️ Automatisk Udklipping af de 20 Scener

Når du har downloadet 1080x1920 billedet fra ChatGPT:

Kør den automatiske slicer:
```bash
npm run slice:sheet /sti/til/dit_ark.png avatar_1
```
eller med Python direkte:
```bash
python3 scripts/slice-sheet-2x10.py /home/pc/Downloads/10x2.png avatar_1
```

Scriptet vil:
1. Dele billedet op i de 2 søjler x 10 rækker.
2. Fjerne overflødig gennemsigtig luft rundt om hver scene.
3. Skalere hver scene 4x op med Lanczos-interpolering til det officielle **2126 x 740** format.
4. Gemme alle 20 WebP-scener direkte i:
   - `reference/personas/avatar_1/scenes/`
   - `public/reference/personas/avatar_1/scenes/`
5. Automatisk opdatere `persona.json` så de nye scener er klar med det samme i appen!

---

## Alternative Metoder

### Mulighed B: 4-i-1 Batch Ark (2x2 Gitter i 16:9 bredformat)
Brug [`style_guide/master_prompt_transparent.md`](master_prompt_transparent.md) til at generere 4 scener i bredformat.

### Mulighed C: Enkelt Scene Prompt
Hvis du kun mangler en enkelt scene:
```markdown
# 2D Cartoon Pictogram Routine Scene
Please attach:
- Image 1: Avatar character & clothing reference
- Image 2: Art style reference (Ref 2)

Scene to generate:
[Beskriv scenen, f.eks.: The character happily hanging laundry with clothes pegs in front of a washing machine.]

Requirements:
- Same character and exact same clothing as in Image 1.
- Clean 2D cartoon style with bold black outlines matching Image 2.
- Wide 16:9 horizontal format.
- 100% genuine transparent background (PNG alpha).
- No text, letters, or borders.
```
