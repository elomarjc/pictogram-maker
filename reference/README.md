# Piktogram Reference Bibliotek & Mappestruktur

Dette bibliotek indeholder alle figurer (avatars), aktivitetsscener, ikoner og stilreferencer til **Piktogram Maker**.

Strukturen er designet, så **hver avatar har sin egen dedikerede mappe (`avatar_1`, `avatar_2` osv.)** med profilbillede (`avatar.webp`), metadata (`persona.json`) og alle tilhørende aktivitetsscener i undermappen `scenes/`.

---

## 📁 Mappestruktur

```
reference/ (og public/reference/)
├── personas/                          # Hver avatar har sin egen mappe
│   ├── avatar_1/                      # Avatar 1 (K.)
│   │   ├── avatar.webp                # Profilbillede / Karakterreference (Ref 1)
│   │   ├── persona.json               # Konfiguration og scenestier for Avatar 1
│   │   └── scenes/                    # Færdige aktivitetsscener for Avatar 1
│   │       ├── vaesketoeg.webp        # Hænge vasketøj op
│   │       ├── kaffe.webp             # The & Kaffe
│   │       ├── medicin.webp           # Medicin
│   │       ├── badetid.webp           # Badetid
│   │       ├── spisetid.webp          # Spisetid (Morgenmad/Frokost/Aftensmad)
│   │       ├── aktiviteter.webp       # Aktiviteter / Hobby / Musik
│   │       ├── vaske_op.webp          # Vaske op
│   │       ├── bolle.webp             # Bolle / Eftermiddagssnack
│   │       ├── sengetid.webp          # Sengetid / Sove
│   │       ├── rede_seng.webp         # Rede seng / skifte sengetøj
│   │       ├── gatur.webp             # Gåtur i frisk luft
│   │       ├── pause_sofa.webp        # Hvile / Pause / TV / Sofa
│   │       ├── skraldespand.webp      # Gå ud med skraldepose
│   │       └── handle.webp            # Handle indkøb
│   │
│   ├── avatar_2/                      # Avatar 2 (A.)
│   │   ├── avatar.webp                # Profilbillede / Karakterreference
│   │   ├── persona.json               # Konfiguration for Avatar 2
│   │   └── scenes/                    # Aktivitetsscener for Avatar 2
│   │       ├── vaesketoeg.webp
│   │       ├── kaffe.webp
│   │       ├── medicin.webp
│   │       ├── badetid.webp
│   │       ├── spisetid.webp
│   │       ├── sengetid.webp
│   │       └── ...
│   │
│   ├── .archive/                      # Papirkurv til blødt slettede figurer (fortrydelsesret)
│   └── personas_manifest.json         # Samlet liste over figurer
│
├── style_guide/                       # Fælles stil- og prompt-referencer
│   ├── ref2_example.jpg               # Officiel 2D cartoon tegnestil (Ref 2)
│   ├── ref1_avatar_man.png            # Original højopløselig avatar reference
│   ├── prompt_stage1_photo_to_avatar.md # Trin 1: Foto til 2D Tegneserie Avatar
│   ├── prompt_stage2_avatar_in_scene.md # Trin 2: Avatar i Scener & Batch-ark
│   ├── master_prompt_transparent.md   # DALL-E / ChatGPT Masterprompt
│   ├── scene_prompts.txt              # Standard prompts for alle rutiner
│   └── eksempel-paa-piktogram.webp    # Eksempel på et færdigt piktogramkort
│
├── icons/                             # 10 piktogram-ikoner til højre side
│   ├── toej_snor.webp                 # Vasketøjssnor
│   ├── kop.webp                       # Kaffekop
│   ├── piller.webp                    # Medicinpiller
│   ├── bruser.webp                    # Brusehoved
│   ├── tallerken_bestik.webp          # Tallerken, kniv og gaffel
│   ├── opvask.webp                    # Opvaskebørste og skum
│   ├── bolle_ikon.webp                # Bolle
│   ├── seng_ikon.webp                 # Seng
│   ├── sun.webp                       # Sol (dagvagt / formiddag)
│   └── cloud.webp                     # Sky / aften
│
└── cards/                             # Oprindelige udskårne referencekort fra den fysiske tavle
```

---

## 🎨 2-Trins Billedgenerering i ChatGPT

For at sikre 100% konsistens og bevare det rigtige tøj på enhver person (uden at ChatGPT antager en hættetrøje):

### Trin 1: Forvandl et virkeligt foto til en 2D Avatar (Ref 1)
- **Værktøj:** Brug prompten fra [`style_guide/prompt_stage1_photo_to_avatar.md`](style_guide/prompt_stage1_photo_to_avatar.md).
- **Inputs:** 
  - Billede 1: Personens virkelige foto.
  - Billede 2: [`style_guide/ref2_example.jpg`](style_guide/ref2_example.jpg) (tegnestil).
- **Resultat:** Ét rent 2D tegneserieportræt med gennemsigtig baggrund, hvor personens ansigtstræk, frisure og **faktiske tøj** (skjorte, kjole, strik, jakke osv.) bevares.
- **Placering:** Gem billedet som `reference/personas/<avatar_id>/avatar.webp`.

### Trin 2: Indsæt figuren i aktivitetsscenerne
- **Værktøj:** Brug prompten fra [`style_guide/prompt_stage2_avatar_in_scene.md`](style_guide/prompt_stage2_avatar_in_scene.md).
- **Inputs:**
  - Billede 1: Din nye avatar (`reference/personas/<avatar_id>/avatar.webp`).
  - Billede 2: [`style_guide/ref2_example.jpg`](style_guide/ref2_example.jpg).
- **Tøjkonsistens:** Prompten instruerer ChatGPT i at reproducere præcis det tøj, figuren har på i Billede 1 i alle scener.
- **Tip (Batch 4-i-1 ark):** Generér 4 scener i et 2x2 gitter på ét billede i bredformat (16:9). Beskær dem i appens beskæringsværktøj (`CropSceneModal`) for at spare 75% ChatGPT-kvoter.

---

## 🔄 Sådan udskifter du billeder

### 1. Udskiftning af profilbillede (Avatar)
Overskriv `avatar.webp` i figurens mappe:
```bash
cp /sti/til/nyt_billede.webp reference/personas/avatar_1/avatar.webp
cp /sti/til/nyt_billede.webp public/reference/personas/avatar_1/avatar.webp
```

### 2. Udskiftning af en aktivitetsscene
Alle scener har standardiserede navne på tværs af alle figurer:
- Udskift kaffe for Avatar 1: `reference/personas/avatar_1/scenes/kaffe.webp`
- Udskift kaffe for Avatar 2: `reference/personas/avatar_2/scenes/kaffe.webp`

---

## 📋 Standard scenenavne

| Scenenøgle (`key`) | Aktivitet | Standard Baggrundsfarve | Standard Ikon |
|---|---|---|---|
| `vaesketoeg` | Hænge vasketøj op / Vaskemaskine | Pink (`#fbb6db`) | `toej_snor` |
| `kaffe` | The & Kaffe / Hyggepause | Gul (`#fdef8c`) | `kop` |
| `medicin` | Medicin (Morgen / Aften) | Grøn (`#c1ea9a`) | `piller` |
| `badetid` | Badetid / Brusebad | Cyan (`#9adafd`) | `bruser` |
| `spisetid` | Spisetid (Morgenmad / Frokost / Aftensmad) | Orange (`#fdc67c`) | `tallerken_bestik` |
| `aktiviteter` | Aktiviteter / Musik / Hobby / Arbejde | Lilla (`#ccadfb`) | — |
| `vaske_op` | Vaske op i køkkenvask | Mint (`#9ceacc`) | `opvask` |
| `bolle` | Bolle / Eftermiddagssnack | Lavendel (`#cdb7f8`) | `bolle_ikon` |
| `sengetid` | Sengetid / Sove / Godnat | Himmelblå (`#97d9fc`) | `seng_ikon` |
| `rede_seng` | Rede seng / Skifte sengetøj | Pink (`#fbb6db`) | `seng_ikon` |
| `gatur` | Gåtur i frisk luft | Grøn (`#c1ea9a`) | — |
| `pause_sofa` | Hvile / Pause / TV på sofaen | Gul / Orange | — |
| `skraldespand` | Gå ud med skrald og flasker | Mint (`#9ceacc`) | — |
| `handle` | Handle indkøb / Butik | Orange (`#fdc67c`) | — |
