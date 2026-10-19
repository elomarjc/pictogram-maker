# Trin 1: Foto til 2D Tegneserie Avatar (Master Prompt)

Dette prompt bruges til at forvandle et **almindeligt fotografi af enhver person** (voksen, barn, briller, særlige frisurer osv.) til det officielle 2D cartoon avatar format, som herefter bruges som den faste karakterreference (**Ref 1** / `avatar.webp`) til alle piktogrammer.

> [!IMPORTANT]
> **Tøjet fra fotoet bevares:** Modellen må **IKKE** automatisk give personen en grå hættetrøje eller standardtegneserie-tøj på. Personens virkelige tøj (skjorte, kjole, striktrøje, t-shirt, jakke osv.) genskabes i tegneseriestilen!

---

## Billeder der skal vedhæftes i ChatGPT:
1. **Billede 1:** Dit rigtige foto af personen.
2. **Billede 2:** Stilarten fra [`style_guide/ref2_example.jpg`](ref2_example.jpg).

---

## Kopiér denne tekst direkte ind i ChatGPT:

```markdown
# Turn Real Photo into 2D Cartoon Pictogram Avatar

Please attach:
- Image 1: Real photo of the person
- Image 2: Art style reference (thick smooth black outlines, flat saturated colors, friendly cartoon aesthetic)

Instructions:
Transform the real person in Image 1 into ONE clean, friendly 2D cartoon avatar portrait that will serve as the master character reference for an autism routine pictogram schedule.

### 1. Authentic Likeness & Clothing (DO NOT DEFAULT TO A HOODIE)
- Identity & Face: Capture the person's real facial structure, eye shape, smile, skin tone, and distinguishing facial features (including glasses if worn).
- Hairstyle: Replicate the person's exact hairstyle, hair length, hair color, and texture as seen in Image 1.
- Clothing: Strictly reproduce whatever clothing the person is ACTUALLY wearing in Image 1 (e.g. sweater, t-shirt, buttoned shirt, polo, dress, jacket). DO NOT change their clothing to a hoodie, sweatshirt, or generic uniform unless they are actually wearing one in the photo.
- Expression: Warm, friendly, cheerful, smiling, and approachable.

### 2. Illustration Style (Matching Image 2)
- Clean, crisp 2D cartoon vector illustration style exactly matching Image 2.
- Bold, thick, smooth black outlines around the character and clothing.
- Clean flat saturated colors with minimal, simple cel-shading (no 3D, no photorealism, no airbrushing).
- Friendly rounded proportions and clear silhouette.

### 3. Composition & Framing
- Centered upper-body portrait (chest up), facing slightly toward the viewer.
- Balanced composition fitting within an avatar portrait circle or square.

### 4. 100% Genuine Transparent Background (Critical)
- The entire background surrounding the character MUST be completely transparent (PNG alpha channel).
- NO white background, NO background scenery, NO circle borders, NO card frames, NO fake checkerboard pattern.
- Only the person and their clothing should be visible.

### 5. Final Requirements
- One image only.
- No text, letters, names, or watermarks.
```

---

## Hvad gør du efter generering?
1. Download billedet som PNG fra ChatGPT.
2. Gem det som `avatar.webp` (eller `avatar.png`) i figurens mappe:
   `reference/personas/<avatar_id>/avatar.webp`
   (f.eks. `reference/personas/avatar_1/avatar.webp`).
3. Nu er din avatar klar som **Ref 1** til Trin 2 (Scenerne)!
