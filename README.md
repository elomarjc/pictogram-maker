# Piktogram Maker – Visuel Ugeplan med PDF-eksport

En brugervenlig, responsiv webapplikation designet til at oprette, tilpasse og udskrive visuelle dags- og ugeplaner med piktogrammer. Applikationen er 100% klientside-baseret og klar til gratis hosting på **GitHub Pages** uden behov for database, server eller eksterne abonnementstjenester.

---

## 🌟 Hovedfunktioner

1. **Visuel dags- og ugeplan (Mandag – Søndag)**
   - Alle ugens syv dage med individuelle aktiviteter og overskrifter (f.eks. "Mandag – AV").
   - Læses fra toppen mod bunden i overskuelig rækkefølge.
   - Træk-og-slip (drag-and-drop) samt op/ned-knapper til hurtig omorganisering.
   - Forhåndsvisning i realtid.

2. **To visningstilstande**
   - **Tavle-visning (Stribeformat):** Nøjagtigt layout som på det medfølgende referencebillede med himmelblå overskrift, smilende sol, sky og vandrette piktogram-striber.
   - **Kort-visning (Klippekort):** Vertikalt iPhone-proportionskort (f.eks. 6,5 × 10 cm) med afrundede hjørner og stiplede skærelinjer, perfekt til laminering og ophæng med velcro.

3. **Piktogram-redigering**
   - Redigering af titel, undertitel og valgfrit klokkeslæt.
   - Omfattende bibliotek af specialtegnede SVG-illustrationer (vasketøj, kaffepause, medicin, badetid, spisetid, aktiviteter, opvask, bolle, sengetid, sofa-pause, gåtur, TV, skraldespand m.fl.).
   - Kategoriserede Lucide-piktogrammer (Mad & Drikke, Hygiejne, Pligter, Aktiviteter, Rutine).
   - Mulighed for at uploade egne billeder lokalt.
   - 8 rolige, venlige pastel-farvetemaer samt valg af tekststørrelse.

4. **Flere ugeplaner og skabeloner**
   - Understøttelse af flere separate ugeplaner (f.eks. "K. – Ugeplan", "Skole & Fritid", "Aflastning").
   - Opret, omdøb, kopiér og slet planer (med sikkerhedsbekræftelse).
   - Indbyggede standardskabeloner baseret på de 18 dagsnotater. Skabelonerne kan altid gendannes.

5. **100% Privatliv & Lokal Lagring**
   - **Ingen backend:** Ingen login, ingen cookies, ingen tracking (ingen Google Analytics).
   - **Midlertidig session:** Data gemmes udelukkende i browserens `sessionStorage`. Lukkes fanebladet, ryddes de midlertidige data.
   - **Sikkerhedskopi som fil:** Eksportér og importér dine planer som en lokal `.json`-fil på din egen computer.
   - **Ryd alle data:** Enkel knap til at nulstille alle data og gendanne standardskabelonen.

6. **Lokal PDF-eksport & Direkte Print (A4)**
   - Eksportér aktuel dag, en valgt ugedag eller hele ugen samlet.
   - Konfigurerbare fysiske printmål (f.eks. kortbredde 6,5 cm og højde 10 cm).
   - Automatisk sidefordeling: Et kort bliver aldrig utilsigtet delt hen over et sideskift.
   - Mulighed for fuldfarve eller sort/hvid printvenlig tilstand.

---

## 🚀 Kom i gang lokalt

### Forudsætninger
- Node.js (version 20 eller nyere anbefales)
- npm

### Installation og kørsel

1. Klon repositoryet eller åbn mappen:
   ```bash
   cd /home/pc/Documents/GitHub/pictogram-maker
   ```

2. Installer afhængigheder:
   ```bash
   npm install
   ```

3. Start udviklingsserveren:
   ```bash
   npm run dev
   ```
   Åbn adressen i din browser (typisk `http://localhost:5173/`).

4. Kør automatiserede tests:
   ```bash
   npm test
   ```

5. Byg produktionsfiler:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment på GitHub Pages

Projektet er fuldt forberedt til automatisk deployment via **GitHub Actions**:

1. Push kildekoden til grenen `main` på GitHub:
   ```bash
   git add .
   git commit -m "Udrul Piktogram Maker"
   git push origin main
   ```

2. Gå ind på dit repository på GitHub:
   - Klik på **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**: Vælg **GitHub Actions**.

3. GitHub Actions workflowet (`.github/workflows/deploy.yml`) bygger og udruller automatisk applikationen ved hvert fremtidigt push til `main`.

---

## 🖼️ Sådan tilføjes rigtige piktogrambilleder i fremtiden

Når de rigtige referencebilleder eller piktogramtegninger leveres, er arkitekturen designet til nem udvidelse:

### Metode 1: Upload via brugergrænsefladen (Uden kodning)
Enhver bruger kan klikke på **"Rediger"** på et kort, vælge fanen **"Upload eget billede"** og vælge en JPG- eller PNG-fil fra computeren. Billedet vises med det samme og medtages i print og PDF.

### Metode 2: Tilføjelse som faste statiske billeder i kildekoden
1. Læg billedfilerne (f.eks. `kaffe.png`, `medicin.png`, `spisetid.png`) i mappen `public/images/`.
2. I filen `src/types/index.ts` og `src/data/illustrations.tsx` kan du tilføje en billedsti eller opdatere standardskabelonerne i `src/data/templates.ts`:
   ```ts
   {
     title: 'Medicin',
     customImageUrl: './images/medicin.png',
     bgColor: '#BBF7D0'
   }
   ```
3. Genkør `npm run build` og push til GitHub.

---

## 📁 Projektstruktur & Reference Bibliotek

Repositoryet er organiseret, så figurer (avatars), scener og ikoner er intuitive at finde:

```
pictogram-maker/
├── reference/                         # Centralt reference-bibliotek (se reference/README.md)
│   ├── personas/
│   │   ├── man/                       # Mandlig figur (K.)
│   │   │   ├── avatar.webp            # Avatar portræt (Ref 1)
│   │   │   └── scenes/                # 14 aktivitetsscener (sengetid, vasketøj, kaffe m.fl.)
│   │   └── woman/                     # Kvindelig figur (A.)
│   │       ├── avatar.webp            # Avatar portræt (Ref 1)
│   │       └── scenes/                # Aktivitetsscener (vasketøj, kaffe, medicin m.fl.)
│   ├── icons/                         # Piktogram-symboler (kop, seng, bruser m.fl.)
│   ├── cards/                         # Fulde referencekort
│   ├── style_guide/                   # Visuel tegnestilsreference (Ref 2)
│   └── README.md                      # Detaljeret oversigt over alle figurer og scener
├── public/
│   ├── favicon.svg                    # Browser-fane ikon
│   └── reference/                     # Statiske reference-aktiver til Vite / GitHub Pages
├── src/
│   ├── components/                    # React UI-komponenter (DailyBoard, PictogramCard, etc.)
│   ├── data/                          # Ikoner, skabeloner og prompt-generatorer
│   ├── services/                      # PDF-eksport, farveværktøjer og Cloudflare AI integration
│   ├── types/                         # TypeScript interfaces
│   └── App.tsx                        # Hovedapplikation
├── index.html                         # HTML template
├── package.json                       # Afhængigheder og scripts
├── vite.config.ts                     # Vite konfiguration
└── vitest.config.ts                   # Vitest enhedstests
```

Se den komplette oversigt over alle avatarer og scener i [reference/README.md](reference/README.md).

---

## 🔒 Privatlivsgaranti

* **Ingen eksterne serverkald:** Appen udfører ingen netværkskald under oprettelse eller redigering af ugeplaner.
* **sessionStorage:** Dine ændringer bevares under genindlæsning af siden i det aktuelle vindue, men slettes automatisk, når fanebladet lukkes.
* **Eksplicit eksport:** Vil du gemme dit arbejde permanent, downloades en JSON-fil direkte til din egen harddisk.
