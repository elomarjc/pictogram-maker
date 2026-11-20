# Design Spec: ChatGPT Onboarding, Startskærm & Pædagogisk Billedgenerering

**Dato:** 2026-11-20  
**Projekt:** Piktogram Maker (`pictogram-maker`)  
**Status:** Godkendt til implementering  

---

## 1. Formål & Målgruppe

Piktogram Maker anvendes af pædagoger, speciallærere, forældre og støttepersoner, som typisk **ikke er tekniske**. De skal hurtigt kunne:
1. Forstå, at generering af personlige tegneseriepiktogrammer kræver en forbundet ChatGPT-session i browseren.
2. Logge ind på ChatGPT med ét klik og få en klar, betryggende status (grønt lys / gult lys).
3. Vælge en eksisterende figur eller oprette en ny 2D-tegneseriefigur ud fra et foto af barnet eller borgeren.
4. Generere hverdagsaktiviteter til figuren — enten den store 20-i-1 grundpakke eller egne specifikke hverdagsidéer beskrevet på almindeligt dansk.
5. Se og bruge deres piktogrammer med det samme i ugeplanen uden forvirring eller skjulte menuer.

---

## 2. Brugerrejse & Skærmflow

### 2.1 Automatisk Startskærm / Onboarding Wizard (`StartWizardModal.tsx`)
Når appen åbnes i browseren:
* Hvis ChatGPT **ikke** er forbundet, ELLER hvis brugeren besøger siden for første gang (registreret via `localStorage.getItem('pictogram_has_seen_onboarding')`), åbner startskærmen automatisk.
* Brugeren kan desuden **altid** genåbne startskærmen via en ny permanent knap i top-menuen: **"🎨 Ny figur & aktiviteter"**.

Startskærmen er bygget op som en venlig 3-trins guide:

```
[ Trin 1: Forbind ChatGPT ]  ➡️  [ Trin 2: Vælg/Opret figur ]  ➡️  [ Trin 3: Generér aktiviteter & idéer ]
```

---

### 2.2 Trin 1: Forbind til ChatGPT (Login)
* **Pædagogisk tekst:**
  > *"For at appen kan tegne personlige piktogrammer med AI, skal den bruge din ChatGPT-konto i browseren."*
* **Statusindikator:**
  * 🟡 **Venter på login:** Vises når appen ikke kan registrere en aktiv session.
  * 🟢 **ChatGPT er forbundet og klar:** Vises med grøn animations-badge, når forbindelsen er aktiv.
* **Handlinger:**
  * Stor primær knap: **"Åbn og log ind på ChatGPT"** (åbner `https://chatgpt.com` i en ny fane).
  * Automatisk baggrunds-polling: Hvert 3. sekund tjekker appen status via `/api/chatgpt/status`. Når brugeren har logget ind i sin ChatGPT-fane og vender tilbage, skifter statussen automatisk til grøn, og **"Gå til næste trin ➡️"** bliver aktiv.
  * Manuel genopfriskningsknap: **"Tjek forbindelse igen"** for direkte kontrol.
  * Spring over-mulighed: *"Fortsæt uden AI (brug standardsymboler)"* for brugere der blot vil printe.

---

### 2.3 Trin 2: Vælg figur eller generér en ny figur ud fra billede
* Brugeren præsenteres for to overskuelige kort:
  1. **Vælg eksisterende figur:**
     * Viser miniaturer af eksisterende figurer (f.eks. standardfiguren K. / `avatar_1` og evt. tidligere oprettede figurer).
     * Klik på et kort for at vælge.
  2. **Opret ny figur ud fra foto:**
     * Træk-og-slip / filvælger: *"Upload foto af barn/borger"*.
     * Brugeren vælger et foto (JPG, PNG, WebP).
     * Billedet forberedes og forvandles via AI til en 2D tegneseriefigur med ren gennemsigtig baggrund og gemmes i systemet under et personligt navn (f.eks. *"Lucas"* eller *"Emma"*).
* Når en figur er valgt eller genereret, går guiden automatisk videre til Trin 3 med den valgte figur i fokus.

---

### 2.4 Trin 3: Generér aktiviteter til figuren / tilføj egne idéer
I toppen ses et mini-overblik over den valgte figur (avatar, navn og antal klar-gjorte scener).
Brugeren gives to klare muligheder:

1. **Mulighed A: Generér standardpakken (20 grundrutiner på ét ark)**
   * Kører automatiseret 20-i-1 ark (Morgenmad, Tandbørstning, Påklædning, Medicin, Badetid, Skole/Aktiviteter, Frokost, Gåtur, Aftensmad, Sove osv.).
   * Sikrer 100% konsistent tøj og streg, og bruger kun 1 ChatGPT prompt.
   * Viser live dansk fremskridtsbjælke (*"Tegner sceneark... Beskærer automatisk de 20 scener..."*).

2. **Mulighed B: Tilføj egne idéer til aktiviteter**
   * **Hurtig-idé knapper (klik for at tilføje prompt):**
     * *Brætspil, Læse bog, Fysioterapi, iPad/tablet, Svømmehal, Bage boller, Havearbejde, Bus & Tog, Sansepause, Cykeltur*.
   * **Tekstfelt:** *"Skriv hvad figuren skal lave..."* (brugeren kan skrive almindeligt dansk, f.eks. *"Skal hen til mormor og spise vafler"* eller *"Tage høreværn på ved larm"*).
   * Knap: **"Tegn aktiviteten med ChatGPT"**.

3. **Afslutning:**
   * Knap: **"🎉 Åbn ugeplanen med de nye piktogrammer"**.
   * Lukker guiden og viser tavlen, hvor brugeren med det samme kan indsætte og flytte de nye piktogrammer.

---

## 3. Faste elementer i appen (`Header.tsx` & Tavlen)

1. **Header ChatGPT-statusindikator:**
   * Placeres synligt i navigationsbjælken:
     * 🟢 **"ChatGPT forbundet"** (rolig grøn farve).
     * 🟡 **"Log ind på ChatGPT"** (venlig gul knap; klik åbner direkte Trin 1 i guiden).
2. **Permanent Hovedknap:**
   * **"🎨 Ny figur & aktiviteter"** placeret ved siden af *Skabeloner* og *Print/PDF*.
3. **Piktogram-editoren (`PictogramEditorModal.tsx`):**
   * Forenklet dansk vejledning i tabben for oprettelse af nye scener.
   * Hvis ChatGPT ikke er forbundet, vises en direkte knap: *"Log ind på ChatGPT for at tegne denne scene"* i stedet for en kryptisk fejl.

---

## 4. Tekniske rettelser & Windows-kompatibilitet

1. **`scripts/generate-with-chatgpt.mjs`**:
   * Rettelse af `checkImageUseInstalled()`: Brug platformsuafhængig tjek (`where image-use` på Windows / `which image-use` på macOS/Linux).
   * Rettelse af `openChatGPTInBrowser()`: På Windows eksekveres `cmd.exe /c start https://chatgpt.com` med `{ shell: true }` for at forhindre `ENOENT` fejl ved direkte spawn af `start`.
2. **`src/services/chatgptGeneration.ts`**:
   * Forbedret fejlhåndtering og automatisk polling af `/api/chatgpt/status` under ventetid.
3. **`localStorage` tracking**:
   * Gem flag `pictogram_has_seen_onboarding` når brugeren har gennemført eller aktivt lukket startskærmen, så den ikke generer ved hvert sideskift, men altid kan tilgås fra topmenuen.

---

## 5. Verifikationsplan
* Kør `npm test` i `pictogram-maker` for at sikre, at eksisterende enhedstests består.
* Kør TypeScript-typecheck (`npm run build`).
* Test at statustjek og åbning af browser fungerer på Windows uden fejl.
* Bekræft at 3-trins flowet fungerer smidigt og uden tekniske fagudtryk.
