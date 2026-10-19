export interface ScenePromptItem {
  id: string;
  category: string;
  title: string;
  prompt: string;
}

/**
 * Trin 1 Prompt: Foto til 2D Tegneserie Avatar.
 * Forvandler et virkeligt fotografi af enhver person til den officielle 2D cartoon avatar (Ref 1),
 * hvor personens virkelige ansigtstræk, frisure og faktiske tøj bevares (uden at antage en hættetrøje).
 */
export function buildPhotoToAvatarPrompt(options?: { language?: 'da' | 'en' }): string {
  const isEn = options?.language === 'en';
  if (isEn) {
    return `# Stage 1 Prompt — Turn Real Photo into 2D Cartoon Avatar

## Reference Images to Attach in ChatGPT / DALL-E:
- **Image 1 — Real Photo:** A real photograph of the person to convert into a cartoon avatar.
- **Image 2 — Art Style Reference:** The official 2D cartoon style example (bold smooth black outlines, flat saturated colors, subtle cel-shading, friendly approachable aesthetic).

## Instructions for ChatGPT / DALL-E:
Transform the real person in Image 1 into ONE clean, friendly 2D cartoon avatar portrait that will serve as the master character reference for an autism routine schedule.

### 1. Accurate Likeness & Authentic Clothing (DO NOT DEFAULT TO A HOODIE)
- **Face & Identity:** Capture the person's real facial structure, eye shape, smile, skin tone, and distinguishing facial features.
- **Hair:** Replicate the person's exact hairstyle, hair length, hair color, and texture as seen in Image 1.
- **Clothing:** Strictly reproduce whatever clothing the person is ACTUALLY wearing in Image 1 (e.g. sweater, t-shirt, buttoned shirt, polo, dress, jacket, or glasses). DO NOT change their clothing to a hoodie, sweatshirt, or generic cartoon uniform unless they are actually wearing one in the photo.
- **Expression:** Warm, kind, cheerful, smiling, and approachable.

### 2. Illustration Style (Matching Image 2)
- Clean, crisp 2D cartoon vector illustration style exactly matching Image 2.
- Bold, thick, smooth black outlines around the character and clothing.
- Clean flat saturated colors with minimal, simple cel-shading (no 3D, no photorealism, no airbrushing).
- Friendly rounded proportions and clear silhouette.

### 3. Composition & Framing
- Centered upper-body portrait (chest up or waist up), facing slightly toward the viewer.
- Balanced composition fitting within an avatar portrait circle or square.

### 4. 100% Genuine Transparent Background (Critical)
- The entire background surrounding the character MUST be completely transparent (PNG alpha channel).
- NO white background, NO background scenery, NO circle borders, NO card frames, NO fake checkerboard pattern.
- Only the person and their clothing should be visible.

### 5. Final Requirements
- One image only.
- No text, letters, names, or watermarks.`;
  }

  return `# Trin 1 Prompt — Konverter Virkeligt Foto til 2D Tegneserie Avatar

## Referencebilleder der SKAL vedhæftes i ChatGPT / DALL-E:
- **Billede 1 — Virkeligt Foto:** Et almindeligt foto af personen, der skal forvandles til en tegneserie-avatar.
- **Billede 2 — Tegnestilsreference:** Den officielle piktogram-tegnestil (tykke sorte omrids, mættede flade farver, cel-shading og venligt udtryk).

## Instruktioner til ChatGPT / DALL-E:
Forvandl den virkelige person fra Billede 1 til ÉT venligt, klart 2D tegneserie-portræt (avatar), som skal bruges som den faste karakterreference til piktogramkort.

### 1. Præcis Lighed & Autentisk Tøj (ANTAG IKKE EN HÆTTETRØJE)
- **Ansigt & Træk:** Aflæs personens virkelige ansigtsform, øjenform, smil, hudtone og eventuelle briller.
- **Frisure:** Genskab personens faktiske frisure, hårlængde, hårfarve og tekstur direkte fra Billede 1.
- **Tøj:** Genskab PRÆCIS det tøj, personen rent faktisk har på i fotoet (f.eks. striktrøje, t-shirt, skjorte, kjole, jakke osv.). Du må IKKE automatisk give personen en hættetrøje/hoodie på, medmindre de faktisk bærer en på fotoet.
- **Ansigtsudtryk:** Varmt, venligt, smilende og imødekommende.

### 2. Tegnestil (Matcher Billede 2)
- Ren, skarp 2D tegneseriestil der matcher Billede 2 100%.
- Tydelige, tykke og bløde sorte omrids (outlines) rundt om figuren og tøjet.
- Klare, mættede farver med enkel cel-shading (ingen 3D, ingen fotorealisme, ingen airbrush).
- Runde former, klare silhuetter og venlige proportioner.

### 3. Komposition
- Centreret brystbillede / overkrop (chest-up), vendt mod beskueren.
- Figuren skal passe harmonisk i en avatar-cirkel eller firkant.

### 4. 100% Gennemsigtig Baggrund (Kritisk krav)
- Hele baggrunden rundt om figuren SKAL være ægte gennemsigtig (transparent PNG med alpha-kanal).
- INGEN hvid baggrund, INGEN væg eller baggrundsfarve, INGEN ramme, cirkel eller kant.
- Kun figuren og personens tøj må være synligt.

### 5. Aflevering
- Kun ét enkelt billede.
- Ingen tekst, ingen bogstaver, ingen navne og ingen vandmærker.`;
}

/**
 * Dansk Master Prompt Generator til ChatGPT / DALL-E (Trin 2: Scener).
 * Tager højde for den valgte figur og bevarer figurens specifikke tøj fra Billede 1.
 */
export function buildDanishMasterPrompt(options: {
  sceneDescription: string;
  personaName?: string;
}): string {
  return `# Master Prompt — Piktogram Generator (Dansk)

## Referencebilleder der SKAL vedhæftes i ChatGPT / DALL-E:
- **Billede 1 — Figur / Avatar (Ref 1):** Brug dette billede som den præcise figur- og tøjreference. Alt vedrørende personens udseende, ansigt, hudtone, frisure, ansigtstræk og tøj skal aflæses 100% direkte fra Billede 1 og holdes fuldstændig konsistent.
- **Billede 2 — Eksempel / Tegnestil (Ref 2):** Brug dette billede som den visuelle stilart-reference for tegneserie-illustrationen: linjetykkelse, farvemætning, cel-shading og venlig, pædagogisk piktogram-æstetik. Lav IKKE en hel tavle eller ramme, kun selve illustrationen.

## Scene der skal genereres:
${options.sceneDescription.trim() || 'Personen udfører aktiviteten glad og naturligt.'}

## Instruktioner til ChatGPT / DALL-E:
Skab **én enkeltstående 2D cartoon illustration** af den angivne scene. Resultatet skal indsættes direkte på et piktogramkort i en visuel dagsplan.

### 1. Karakter- & Tøjkonsistens (Ref 1)
- Hovedpersonen er figuren fra Referencebillede 1 (Ref 1).
- Figurens udseende, ansigtstræk, frisure, hudtone og tøj SKAL være 100% konsistent med figuren/avataren i Referencebillede 1 (Ref 1).
- Bevar PRÆCIS det tøj, som figuren bærer i Billede 1 (f.eks. skjorte, kjole, strik eller jakke). Du må IKKE antage standardtøj eller ændre tøjet; tøjet skal holdes fuldstændig tro mod Billede 1.
- Tilpas figurens kropsstilling, ansigtsudtryk og håndstillinger naturligt til den ønskede aktivitet.
- Udtrykket skal være venligt, glad, imødekommende og let at afkode med et enkelt blik.

### 2. Tegnestil (Ref 2)
- Ren, skarp 2D tegneseriestil som i Referencebillede 2 (Ref 2).
- Tydelige, tykke og bløde sorte omrids (outlines) rundt om figuren og genstande.
- Klare, mættede farver med enkel cel-shading (skygger uden fotorealisme).
- Runde former, klare silhuetter og venlige proportioner (som i Referencebillede 2).
- Ingen 3D-effekter, ingen fotorealisme, ingen skitseteksturer og ingen unødvendige detaljer.

### 3. Komposition & Rekvisitter
- Vis kun figuren i gang med aktiviteten sammen med de relevante rekvisitter (f.eks. bord, kaffekop, vasketøjskurv, tandbørste).
- Vandret, balanceret komposition (16:9 format) der passer i et aflangt piktogram-felt.
- Hold figuren i centrum som det primære fokuspunkt uden at skære hoved eller hænder af.

### 4. 100% Gennemsigtig Baggrund (Kritisk krav — Transparent PNG)
- Hele baggrunden rundt om figuren og rekvisitterne SKAL være ægte gennemsigtig (transparent PNG med alpha-kanal).
- INGEN hvid baggrund, INGEN farvet baggrund, INGEN væg eller gulvfarve.
- INGEN ramme, INGEN boks, INGEN kort-kant rundt om tegningen.
- INGEN ternet "fake-transparency" mønster; det skal være ægte gennemsigtighed.
- Kun figuren og selve rekvisitterne må være synlige, så billedet kan lægges direkte oven på en farvet baggrund i piktogrammerne.

### 5. Aflevering
- Kun ét enkelt billede.
- Ingen tekst, ingen bogstaver, ingen tal og ingen vandmærker i billedet.`;
}

export function buildEnglishMasterPrompt(options: {
  sceneDescription: string;
  personaName?: string;
}): string {
  return `# Master Prompt — Transparent Cartoon Pictogram Generator

## Reference Images (Attach in ChatGPT / DALL-E)
- **Image 1 — Avatar (Ref 1):** Use this image exclusively as the character and clothing reference. All physical appearance, face, hairstyle, skin tone, and clothing must be derived 100% directly from Image 1 and kept strictly consistent.
- **Image 2 — Example (Ref 2):** Use this image as the visual style reference for the 2D cartoon illustration: linework, saturated colors, cel shading, and friendly educational pictogram aesthetic. Do not reproduce the full chart or card frame.

## Scene to Generate:
${options.sceneDescription.trim() || 'The character performs the requested activity cheerfully and naturally.'}

## Instructions for ChatGPT / DALL-E:
Create ONE standalone 2D cartoon illustration of the specified scene for a visual autism schedule pictogram card.

### 1. Character & Clothing Consistency (Ref 1)
- Main subject is the character from Reference Image 1 (Ref 1).
- The character's face, hairstyle, skin tone, and clothing MUST be 100% consistent with the avatar in Reference Image 1 (Ref 1).
- Strictly maintain WHATEVER clothing the character is wearing in Image 1 (e.g. shirt, sweater, dress, jacket, glasses). DO NOT assume default clothing or a generic outfit; stay 100% faithful to the clothing shown on the avatar in Image 1.
- Adapt body posture, facial expression, and hands naturally to the activity.
- Expression must be warm, friendly, smiling, and easy to understand at a glance.

### 2. Illustration Style (Ref 2)
- Clean, crisp 2D cartoon style matching Reference Image 2 (Ref 2).
- Bold, thick, smooth black outlines around the character and objects.
- Clean flat saturated colors with simple subtle cel shading.
- Rounded friendly shapes, clear silhouettes. No 3D, no photorealism.

### 3. Composition & Props
- Show only the character performing the activity with essential props (e.g., table, cup, books).
- Balanced horizontal 16:9 composition fitting a pictogram card. Character centered as the main focus.

### 4. 100% Transparent Background (Critical — Transparent PNG)
- Entire background around character and props MUST be genuinely transparent (alpha channel PNG).
- NO white background, NO colored walls or floors, NO card frames or borders, NO fake checkerboard pattern.
- Only the character and immediate scene objects should be visible.

### 5. Final Requirements
- One image only.
- No text, no letters, no numbers, no watermarks.`;
}

export const PRESET_SCENE_PROMPTS: ScenePromptItem[] = [
  // 1. MORGEN, BAD & PERSONLIG HYGIEJNE
  {
    id: 'morgen_vaagne',
    category: 'Morgen, Bad & Hygiejne',
    title: 'Morgenrutine / Vågne op',
    prompt: 'Figuren strækker armene glad op i luften ved siden af sengen om morgenen, med en blød pude og dyne i baggrunden.',
  },
  {
    id: 'rede_seng',
    category: 'Morgen, Bad & Hygiejne',
    title: 'Rede seng',
    prompt: 'Figuren er i gang med at rede sengen pænt, glatter dynen ud og puffer den hvide pude på plads med et smil.',
  },
  {
    id: 'badetid',
    category: 'Morgen, Bad & Hygiejne',
    title: 'Badetid / Brusebad',
    prompt: 'Figuren er i bad og vasker glad sit hår med shampoo-skum, mens der sprøjter vanddråber fra brusehovedet.',
  },
  {
    id: 'boerste_taender',
    category: 'Morgen, Bad & Hygiejne',
    title: 'Børste tænder',
    prompt: 'Figuren står foran badeværelsesvasken og børster tænder med en tandbørste og hvidt tandpastaskum.',
  },
  {
    id: 'tage_toej_paa',
    category: 'Morgen, Bad & Hygiejne',
    title: 'Tage tøj på',
    prompt: 'Figuren tager rent tøj på og lyner sin hættetrøje med et tilfreds smil.',
  },

  // 2. MEDICIN & VELVÆRE
  {
    id: 'medicin',
    category: 'Medicin & Velvære',
    title: 'Medicin (Morgen / Aften)',
    prompt: 'Figuren tager sin medicin ved et bord med et glas vand, pille-blisterpakke og et lille medicinbæger.',
  },
  {
    id: 'drikke_vand',
    category: 'Medicin & Velvære',
    title: 'Drikke et glas vand',
    prompt: 'Figuren drikker et frisk, klart glas vand og holder glasset op med et tilfreds smil.',
  },

  // 3. MAD & DRIKKE (MÅLTIDER)
  {
    id: 'kaffe_the',
    category: 'Mad & Drikke',
    title: 'The & Kaffe',
    prompt: 'Figuren sidder ved et hyggeligt bord og holder en varm dampende kaffekop med begge hænder, med en klassisk kaffekande på bordet.',
  },
  {
    id: 'morgenmad',
    category: 'Mad & Drikke',
    title: 'Morgenmad',
    prompt: 'Figuren sidder ved bordet og spiser morgenmad med en skål cornflakes, mælkekarton og en ske i hånden.',
  },
  {
    id: 'frokost',
    category: 'Mad & Drikke',
    title: 'Frokost (Rugbrødsmadder)',
    prompt: 'Figuren sidder ved spisebordet og spiser lækre rugbrødsmadder fra en tallerken med kniv og gaffel.',
  },
  {
    id: 'aftensmad',
    category: 'Mad & Drikke',
    title: 'Aftensmad',
    prompt: 'Figuren spiser aftensmad, holder kniv og gaffel, med en lun tallerken mad og et glas på bordet.',
  },
  {
    id: 'bolle',
    category: 'Mad & Drikke',
    title: 'Bolle / Eftermiddagshygge',
    prompt: 'Figuren sidder ved bordet og nyder en friskbagt bolle med smør og holder den glad med begge hænder.',
  },
  {
    id: 'snack_frugt',
    category: 'Mad & Drikke',
    title: 'Snack / Frugt',
    prompt: 'Figuren sidder ved bordet og spiser et frisk rødt æble og en banan fra en lille frugtskål.',
  },

  // 4. PLIGTER & HJEMLIGE OPGAVER
  {
    id: 'haenge_vasketoej',
    category: 'Pligter & Opgaver',
    title: 'Hænge vasketøj op',
    prompt: 'Figuren hænger rent, vådt tøj op på et tørrestativ med tøjklemmer, med en vasketøjskurv stående ved siden af.',
  },
  {
    id: 'laegge_toej_sammen',
    category: 'Pligter & Opgaver',
    title: 'Lægge tøj sammen',
    prompt: 'Figuren står ved et bord og folder pænt rene, farverige t-shirts i en nydelig stak.',
  },
  {
    id: 'vaske_op_haand',
    category: 'Pligter & Opgaver',
    title: 'Vaske op i hånden',
    prompt: 'Figuren vasker tallerkener i køkkenvasken med mildt sæbeskum, en opvaskebørste og rene tallerkener i opvaskestativet.',
  },
  {
    id: 'opvaskemaskine',
    category: 'Pligter & Opgaver',
    title: 'Tømme / Fylde opvaskemaskine',
    prompt: 'Figuren sætter en ren tallerken ind i den åbne låge på en opvaskemaskine og smiler glad.',
  },
  {
    id: 'skraldespand_pant',
    category: 'Pligter & Opgaver',
    title: 'Gå med skrald & flasker',
    prompt: 'Figuren bærer en grøn skraldepose og en kasse med tomme sodavandsflasker ud til genbrugscontaineren.',
  },
  {
    id: 'stoevsuge',
    category: 'Pligter & Opgaver',
    title: 'Støvsuge / Rengøring',
    prompt: 'Figuren støvsuger gulvet med en støvsuger og fører støvsugerhovedet hen over gulvet.',
  },
  {
    id: 'toerre_bord_af',
    category: 'Pligter & Opgaver',
    title: 'Tørre bord af',
    prompt: 'Figuren tørrer bordpladen af med en fugtig rengøringsklud, så overfladen bliver ren og skinnende.',
  },
  {
    id: 'rydde_op',
    category: 'Pligter & Opgaver',
    title: 'Rydde op på værelset',
    prompt: 'Figuren lægger bøger og hobbyting ned i en opbevaringskasse og gør værelset pænt og ryddeligt.',
  },

  // 5. FRITID, HOBBY & AKTIVITETER
  {
    id: 'kreativ',
    category: 'Fritid & Hobby',
    title: 'Kreativ aktivitet (Tegne / Maling)',
    prompt: 'Figuren sidder ved et hobbybord og tegner med farverige tuscher på papir, med farveblyanter og perler i glas.',
  },
  {
    id: 'puslespil',
    category: 'Fritid & Hobby',
    title: 'Lægge puslespil / Brætspil',
    prompt: 'Figuren sidder fordybet og glad ved et bord og sætter brikker på plads i et farverigt puslespil.',
  },
  {
    id: 'musik',
    category: 'Fritid & Hobby',
    title: 'Høre musik / Hovedtelefoner',
    prompt: 'Figuren har store behagelige hovedtelefoner på ørerne, vipper med foden og lytter glad til musik.',
  },
  {
    id: 'gaatur',
    category: 'Fritid & Hobby',
    title: 'Gåtur / Frisk luft',
    prompt: 'Figuren går en dejlig tur udendørs på en sti i parken med grønne træer i baggrunden.',
  },
  {
    id: 'cykeltur',
    category: 'Fritid & Hobby',
    title: 'Cykeltur',
    prompt: 'Figuren cykler glad afsted med cykelhjelm på hovedet og hænderne på styret.',
  },
  {
    id: 'bold_fodbold',
    category: 'Fritid & Hobby',
    title: 'Spille bold / Fodbold',
    prompt: 'Figuren sparker til en fodbold på en græsplæne med et energisk og glad udtryk.',
  },
  {
    id: 'svoemmehal',
    category: 'Fritid & Hobby',
    title: 'Svømmehal / Svømmetur',
    prompt: 'Figuren er i svømmehallen med badeshorts og håndklæde over skulderen ved det blå vand.',
  },

  // 6. AFSLAPNING & PAUSE
  {
    id: 'pause_sofa',
    category: 'Afslapning & Pause',
    title: 'Pause på sofaen / Se TV',
    prompt: 'Figuren slapper af på en blød sofa med hyggelige puder og holder en fjernbetjening med et roligt smil.',
  },
  {
    id: 'ipad_tablet',
    category: 'Afslapning & Pause',
    title: 'iPad / Tablet-tid',
    prompt: 'Figuren sidder behageligt i en lænestol og kigger på en tablet og trykker på skærmen med et smil.',
  },
  {
    id: 'laese_bog',
    category: 'Afslapning & Pause',
    title: 'Læse i bog eller blad',
    prompt: 'Figuren sidder hyggeligt og bladrer i en illustreret bog eller tegneserie og nyder en stille stund.',
  },

  // 7. TURE UD AF HUSET & FAMILIE
  {
    id: 'handle',
    category: 'Ture & Udflugter',
    title: 'Handle indkøb (Supermarked)',
    prompt: 'Figuren går i supermarkedets gang med en indkøbskurv fyldt med mælk, brød og sodavand.',
  },
  {
    id: 'bus_tog',
    category: 'Ture & Udflugter',
    title: 'Køre i bus / tog',
    prompt: 'Figuren sidder ved bussens vindue og kigger ud på vejen med sit buskort i hånden.',
  },
  {
    id: 'pakke_taske',
    category: 'Ture & Udflugter',
    title: 'Pakke taske (Weekendtur)',
    prompt: 'Figuren pakker en weekendtaske på sengen og lægger foldet tøj ned og lyner tasken.',
  },
  {
    id: 'besoeg_ankomst',
    category: 'Ture & Udflugter',
    title: 'Besøg hos familie',
    prompt: 'Figuren står foran en hyggelig husdør med sin taske og vinker glad med et varmt smil.',
  },

  // 8. AFTENRUTINE & SENGETID
  {
    id: 'aftenrutine',
    category: 'Aften & Sengetid',
    title: 'Aftenrutine / Nattøj',
    prompt: 'Figuren sidder på sengekanten i behageligt nattøj og gør sig klar til at sove.',
  },
  {
    id: 'sengetid',
    category: 'Aften & Sengetid',
    title: 'Sengetid / Sove',
    prompt: 'Figuren ligger trygt i sengen med hovedet på en blød pude under en varm dyne og sover fredeligt.',
  },
];

function translateActivityToEnglish(input: string): string {
  const clean = input.trim();
  if (!clean) return 'performing daily routine happily';

  const lower = clean.toLowerCase();

  // If input is already English or descriptive English phrase:
  if (
    /^(sleeping|sitting|holding|walking|reading|cooking|eating|drinking|standing|playing|working|cleaning|drawing|riding|taking|watering)/i.test(
      clean
    )
  ) {
    return clean;
  }

  if (lower.includes('seng') || lower.includes('sove') || lower.includes('godnat')) {
    return 'sleeping peacefully sideways on a fluffy white pillow under a blue duvet, smiling with closed eyes, blue ZZZ letters floating above';
  }
  if (lower.includes('vaske tøj') || lower.includes('vasketøj') || lower.includes('vaskemaskine') || lower.includes('hænge vasketøj')) {
    return 'happily holding a white laundry basket full of colorful folded clothes in front of a modern front-loading washing machine, green plant in pot on the side, detergent bottle';
  }
  if (lower.includes('kaffe') || lower.includes('the') || lower.includes('te') || lower.includes('drikke')) {
    return 'sitting happily at a cozy table holding a steaming warm mug of coffee with both hands, friendly smile';
  }
  if (lower.includes('børste tænder') || lower.includes('tandbørst') || lower.includes('tænder')) {
    return 'standing by a bathroom mirror brushing teeth with a blue toothbrush and foaming white toothpaste, smiling';
  }
  if (lower.includes('spise') || lower.includes('morgenmad') || lower.includes('frokost') || lower.includes('aftensmad') || lower.includes('mad')) {
    return 'sitting happily at a dining table with a plate of delicious food, fork and knife, and a glass of water, smiling';
  }
  if (lower.includes('opvask') || lower.includes('vaske op')) {
    return 'happily washing dishes at a kitchen sink with bubbly soap suds, yellow sponge and clean plates drying';
  }
  if (lower.includes('rydde op') || lower.includes('rydder op')) {
    return 'happily tidying and organizing the room, putting items in neat order, cheerful smile';
  }
  if (lower.includes('fodre') || lower.includes('kæledyr') || lower.includes('kat') || lower.includes('hund')) {
    return 'happily feeding a friendly pet with a small bowl of food, smiling';
  }
  if (lower.includes('toilet') || lower.includes('vaske hænder')) {
    return 'washing hands cleanly at a bathroom washbasin with bubbly soap and water, smiling';
  }
  if (lower.includes('gåtur') || lower.includes('gå tur') || lower.includes('spadsere')) {
    return 'walking happily outdoors on a sunny day along a path in a green park with lush trees, smiling';
  }
  if (lower.includes('støvsuge') || lower.includes('støvsug')) {
    return 'happily vacuuming the living room floor with a modern vacuum cleaner, cheerful smile';
  }
  if (lower.includes('pause') || lower.includes('sofa') || lower.includes('slappe af')) {
    return 'sitting comfortably relaxed on a cozy soft living room sofa, warm friendly smile';
  }
  if (lower.includes('rede seng')) {
    return 'happily making a neat bed with fluffy white pillows and smooth tidy blanket';
  }
  if (lower.includes('skrald') || lower.includes('skraldespand')) {
    return 'carrying a green trash bag to throw into a tidy wheelie dustbin outside, smiling';
  }
  if (lower.includes('handle') || lower.includes('indkøb')) {
    return 'pushing a colorful shopping basket with groceries happily down a tidy supermarket aisle';
  }
  if (lower.includes('bad') || lower.includes('bade') || lower.includes('brusebad')) {
    return 'taking a warm cozy shower with bubbly soap suds and shampoo, smiling';
  }
  if (lower.includes('medicin') || lower.includes('pille')) {
    return 'sitting by a clean table with a small daily medicine organizer box and a glass of water, smiling';
  }
  if (lower.includes('brætspil') || lower.includes('spil')) {
    return 'sitting at a table playing a colorful board game, smiling and focused';
  }
  if (lower.includes('bog') || lower.includes('læse')) {
    return 'sitting comfortably in a soft armchair reading an interesting book with a warm smile';
  }
  if (lower.includes('cykel') || lower.includes('cykle')) {
    return 'riding a bicycle happily on a bike path on a sunny day with a bicycle helmet';
  }
  if (lower.includes('have') || lower.includes('plante') || lower.includes('blomst') || lower.includes('vande')) {
    return 'in a green garden watering potted plants with a small watering can, smiling';
  }
  if (lower.includes('bage') || lower.includes('kage') || lower.includes('bolle')) {
    return 'standing in the kitchen wearing an apron baking delicious cakes at the kitchen counter';
  }
  if (lower.includes('musik') || lower.includes('høretelefon') || lower.includes('headset')) {
    return 'sitting relaxed wearing large over-ear headphones and happily listening to music';
  }
  if (lower.includes('tegne') || lower.includes('male') || lower.includes('kreativ')) {
    return 'sitting at a desk drawing a colorful picture with marker pens and paper, smiling proudly';
  }
  if (lower.includes('computer') || lower.includes('gamer') || lower.includes('pc')) {
    return 'sitting at a computer desk in front of a monitor with mouse and keyboard, focused and happy';
  }
  if (lower.includes('tv') || lower.includes('fjernsyn')) {
    return 'sitting on a comfortable couch watching television happily with a remote control';
  }

  // Strip generic Danish subject if user started with "Figuren..."
  const englishActivity = clean
    .replace(/^figuren\s+(er\s+i\s+gang\s+med\s+at\s+|skal\s+|er\s+ved\s+at\s+|sidder\s+og\s+|)/i, '')
    .trim();

  return `happily doing: ${englishActivity}`;
}

/**
 * Generates an optimized prompt for Cloudflare Workers AI text-to-image models
 * (Flux-1-Schnell or SD-XL Lightning). Maintains exact persona characteristics,
 * clean 2D vector pictogram style, thick outlines and clean isolated background.
 */
export function buildCloudflareAiPrompt(options: {
  sceneDescription: string;
  personaName?: string;
  personaId?: string;
  personaDescription?: string;
}): string {
  let characterDesc: string;
  if (
    options.personaDescription &&
    options.personaId !== 'avatar_1' &&
    options.personaId !== 'man_k' &&
    options.personaDescription !== options.personaId
  ) {
    characterDesc = `A cheerful friendly cartoon character, ${options.personaDescription}`;
  } else {
    // Default avatar_1
    characterDesc =
      'A cheerful friendly cartoon character with closely shaved buzzcut hair, round friendly face, rosy cheeks, warm open smile, wearing a grey hoodie jacket over a white t-shirt';
  }

  const activity = translateActivityToEnglish(options.sceneDescription);

  return `Clean 2D cartoon pictogram vector illustration, horizontal aspect ratio. ${characterDesc}, ${activity}. Bold thick smooth black outlines, simple flat cel-shading, colorful and cheerful, isolated on pure white background, cute autism schedule pictogram, no text, no frame, wide horizontal composition.`;
}

/**
 * Optimizes and formats a brief Danish user input into an ideal, descriptive prompt
 * for custom pictogram scenes without default clutter.
 */
export function optimizeScenePrompt(input: string): string {
  const clean = input.trim();
  if (!clean) return 'Figuren sidder ved skrivebordet og tegner med farveblyanter, smilende og glad.';

  const lower = clean.toLowerCase();
  if (lower.includes('brætspil') || lower.includes('spil') || lower.includes('kort')) {
    return 'Figuren sidder ved stuebordet og spiller et farverigt brætspil, smilende og koncentreret.';
  }
  if (lower.includes('bog') || lower.includes('læser')) {
    return 'Figuren sidder behageligt i en blød lænestol og fordyber sig i en god bog med et varmt smil.';
  }
  if (lower.includes('cykel') || lower.includes('cykler')) {
    return 'Figuren cykler glad på en cykelsti i godt vejr med cykelhjelm og hænderne solidt på styret.';
  }
  if (lower.includes('gå') || lower.includes('gåtur') || lower.includes('spadsere') || lower.includes('lufte')) {
    return 'Figuren går en frisk gåtur udendørs i behageligt tøj, smilende og glad i det gode vejr.';
  }
  if (lower.includes('have') || lower.includes('blomst') || lower.includes('plante') || lower.includes('vande')) {
    return 'Figuren er i haven og vander grønne planter med en lille vandkande, smilende og tilfreds.';
  }
  if (lower.includes('bage') || lower.includes('kage') || lower.includes('boller')) {
    return 'Figuren står i køkkenet med et forklæde og bager lækre kager ved køkkenbordet, glad stemning.';
  }
  if (lower.includes('musik') || lower.includes('hovedtelefon') || lower.includes('headset')) {
    return 'Figuren sidder afslappet i sofaen med store høretelefoner på og lytter fornøjet til musik.';
  }
  if (lower.includes('tegne') || lower.includes('male') || lower.includes('kreativ')) {
    return 'Figuren sidder ved et bord og tegner en farverig tegning med tuscher og papir, smilende og stolt.';
  }
  if (lower.includes('computer') || lower.includes('gamer') || lower.includes('skærm')) {
    return 'Figuren sidder ved sit computerbord foran skærmen med mus og tastatur, fokuseret og glad.';
  }

  // General formatting: ensure subject starts with "Figuren" and ends with friendly cartoon mood
  let formatted = clean;
  if (!/^figuren/i.test(formatted)) {
    formatted = `Figuren ${formatted.charAt(0).toLowerCase() + formatted.slice(1)}`;
  }
  if (!formatted.includes('glad') && !formatted.includes('smil') && !formatted.includes('hyggelig')) {
    formatted += ', smilende og i godt humør, hyggelig tegneseriestil.';
  } else if (!formatted.endsWith('.')) {
    formatted += '.';
  }
  return formatted;
}

export interface BatchSheetDefinition {
  id: string;
  name: string;
  description: string;
  scenes: {
    key: string;
    title: string;
    description: string;
  }[];
}

export const PRESET_BATCH_SHEETS: BatchSheetDefinition[] = [
  {
    id: 'sheet_dagplan_1',
    name: 'Ark 1: Morgen & Formiddag (K. Dagplan)',
    description: 'De første 4 scener fra K.s officielle dagsplan: Vasketøj, Kaffe, Medicin og Badetid.',
    scenes: [
      { key: 'vaesketoeg', title: 'Hænge vasketøj op', description: 'Hænger vasketøj op med tøjklemmer foran vaskemaskine med vasketøjskurv' },
      { key: 'kaffe', title: 'The & Kaffe', description: 'Sidder hyggeligt ved bord med dampende kaffekop og kande' },
      { key: 'medicin', title: 'Medicin', description: 'Tager pille ved bord med et glas vand og blisterpakke' },
      { key: 'badetid', title: 'Badetid', description: 'Står under bruseren med sæbeskum i håret og sprøjtende vanddråber' },
    ],
  },
  {
    id: 'sheet_dagplan_2',
    name: 'Ark 2: Middag & Eftermiddag (K. Dagplan)',
    description: 'De næste 4 scener fra K.s officielle dagsplan: Spisetid, Aktiviteter, Vaske op og Bolle.',
    scenes: [
      { key: 'spisetid', title: 'Spisetid', description: 'Sidder ved spisebord med tallerken mad, bestik og smiler' },
      { key: 'aktiviteter', title: 'Aktiviteter', description: 'Laver kreativ aktivitet ved arbejdsbord (tegner eller perler)' },
      { key: 'vaske_op', title: 'Vaske op', description: 'Vasker tallerkener i køkkenvask med opvaskebørste og skum' },
      { key: 'bolle', title: 'Bolle', description: 'Nyder en friskbagt bolle med smør ved bordet' },
    ],
  },
  {
    id: 'sheet_dagplan_3',
    name: 'Ark 3: Aften & Ugeplan (K. Dagplan)',
    description: 'Aftenrutine og ekstra ugentlige aktiviteter: Sengetid, Rede seng, Gåtur og Sofa-pause.',
    scenes: [
      { key: 'sengetid', title: 'Sengetid', description: 'Ligger i seng under blå dyne på hvid pude med ZZZ sovebobler' },
      { key: 'rede_seng', title: 'Rede seng', description: 'Ryster puden og glatter dynen pænt på plads' },
      { key: 'gatur', title: 'Gåtur', description: 'Går en frisk gåtur udendørs i frisk luft med et muntert smil' },
      { key: 'pause_sofa', title: 'Pause på sofa', description: 'Slapper behageligt af på sofaen og ser fjernsyn eller hviler sig' },
    ],
  },
];

export function buildBatchSpriteSheetPrompt(sheet: BatchSheetDefinition): string {
  const scenesList = sheet.scenes
    .map((s, idx) => `${idx + 1}. [Scene ${idx + 1}: ${s.title}] — ${s.description}.`)
    .join('\n');

  return `# Master Prompt — Multi-Scene Character Sheet (4-in-1 Batch)

## Reference Images (Attach in ChatGPT / DALL-E)
- **Image 1 — Avatar (Ref 1):** Exact character and clothing reference. Face, hair, skin tone, clothing, and proportions must strictly match Image 1.
- **Image 2 — Art Style (Ref 2):** 2D cartoon pictogram style reference: bold smooth black outlines, flat saturated colors, soft cel shading, friendly rounded shapes.

## Request:
Create ONE single wide sticker/sprite sheet containing exactly 4 separate standalone scenes of the character arranged in a clear, well-spaced 2x2 grid on a pure white, 100% transparent background (no floor, no wall, no background scenery):

${scenesList}

## Requirements:
1. Character & Clothing Consistency: The exact same character from Image 1 in all 4 scenes. Strictly preserve whatever clothing the character is wearing in Image 1 (do NOT default to a hoodie or generic uniform; faithfully maintain their specific clothing from Image 1).
2. Spacing: Leave plenty of empty transparent space between the 4 scenes so each scene can easily be cropped out without touching neighboring elements.
3. Props: Include only essential props for each scene (cup, laundry basket, pill glass, etc.).
4. Art Style: Crisp 2D cartoon matching Image 2 with clear outlines.
5. 100% Transparent Background: Only the character and immediate activity props should be visible.
6. No text, labels, or numbers.`;
}

export interface Sheet2x10Slot {
  key: string;
  title: string;
  row: number;
  col: number;
  descriptionEn: string;
  descriptionDa: string;
}

export const DEFAULT_2X10_SLOTS: Sheet2x10Slot[] = [
  // Række 1
  {
    key: 'morgenmad',
    title: 'Morgenmad',
    row: 1,
    col: 1,
    descriptionEn: 'Character sitting at the dining table eating breakfast from a bowl with a spoon and milk carton, smiling',
    descriptionDa: 'Figuren sidder ved spisebordet og spiser morgenmad fra en skål med ske og mælkekarton, smilende',
  },
  {
    key: 'rede_seng',
    title: 'Rede seng',
    row: 1,
    col: 2,
    descriptionEn: 'Character making the bed, neatly smoothing out the duvet and fluffing the white pillow',
    descriptionDa: 'Figuren reder sengen pænt, glatter dynen ud og puffer den hvide pude på plads',
  },
  // Række 2
  {
    key: 'badetid',
    title: 'Badetid',
    row: 2,
    col: 1,
    descriptionEn: 'Character happily taking a shower, washing hair with shampoo foam and gentle water droplets',
    descriptionDa: 'Figuren står glad under bruseren og vasker hår med shampoo-skum og fine vanddråber',
  },
  {
    key: 'boerste_taender',
    title: 'Børste tænder',
    row: 2,
    col: 2,
    descriptionEn: 'Character brushing teeth with a toothbrush and white foam in front of the bathroom sink',
    descriptionDa: 'Figuren børster tænder foran badeværelsesvasken med tandbørste og hvidt skum',
  },
  // Række 3
  {
    key: 'tage_toej_paa',
    title: 'Tage tøj på',
    row: 3,
    col: 1,
    descriptionEn: 'Character putting on their authentic clothes and adjusting them with a pleased smile',
    descriptionDa: 'Figuren tager sit tøj på og retter trøjen til med et tilfreds smil',
  },
  {
    key: 'medicin',
    title: 'Medicin',
    row: 3,
    col: 2,
    descriptionEn: 'Character taking daily medicine at the table with a glass of water and pill blister pack',
    descriptionDa: 'Figuren tager daglig medicin ved bordet med et glas vand og en pille-blisterpakke',
  },
  // Række 4
  {
    key: 'kaffe',
    title: 'The & Kaffe',
    row: 4,
    col: 1,
    descriptionEn: 'Character sitting cozily holding a steaming hot coffee mug with both hands, kettle on table',
    descriptionDa: 'Figuren sidder hyggeligt og holder en dampende varm kaffekop med en kaffekande på bordet',
  },
  {
    key: 'bolle',
    title: 'Bolle / Formiddagssnack',
    row: 4,
    col: 2,
    descriptionEn: 'Character enjoying a freshly baked buttered bread roll, holding it cheerfully with both hands',
    descriptionDa: 'Figuren spiser en friskbagt bolle med smør og holder den glad med begge hænder',
  },
  // Række 5
  {
    key: 'spisetid',
    title: 'Frokost / Spisetid',
    row: 5,
    col: 1,
    descriptionEn: 'Character eating lunch with open-faced sandwiches on a plate with knife and fork',
    descriptionDa: 'Figuren spiser frokost med rugbrødsmadder fra en tallerken med kniv og gaffel',
  },
  {
    key: 'vaske_op',
    title: 'Vaske op',
    row: 5,
    col: 2,
    descriptionEn: 'Character washing plates in the kitchen sink with a dish brush, gentle suds, and dish rack',
    descriptionDa: 'Figuren vasker op i køkkenvasken med opvaskebørste, skum og rene tallerkener',
  },
  // Række 6
  {
    key: 'vaesketoeg',
    title: 'Hænge vasketøj op',
    row: 6,
    col: 1,
    descriptionEn: 'Character hanging clean wet laundry with clothes pegs on a drying rack next to a basket',
    descriptionDa: 'Figuren hænger rent vådt vasketøj op på et tørrestativ med tøjklemmer ved en vasketøjskurv',
  },
  {
    key: 'aktiviteter',
    title: 'Aktiviteter / Hobby',
    row: 6,
    col: 2,
    descriptionEn: 'Character sitting at a hobby desk drawing with colorful markers or listening to music',
    descriptionDa: 'Figuren laver en hyggelig hobbyaktivitet ved bordet (tegner med tuscher eller hører musik)',
  },
  // Række 7
  {
    key: 'gatur',
    title: 'Gåtur',
    row: 7,
    col: 1,
    descriptionEn: 'Character walking outdoors in fresh air along a peaceful park path with a relaxed smile',
    descriptionDa: 'Figuren går en dejlig tur på en sti i parken med et roligt og glad smil',
  },
  {
    key: 'handle',
    title: 'Handle indkøb',
    row: 7,
    col: 2,
    descriptionEn: 'Character carrying a grocery shopping basket filled with daily groceries in a supermarket',
    descriptionDa: 'Figuren bærer en indkøbskurv med dagligvarer i supermarkedet med et muntert smil',
  },
  // Række 8
  {
    key: 'pause_sofa',
    title: 'Pause på sofa / TV',
    row: 8,
    col: 1,
    descriptionEn: 'Character resting comfortably on a living room sofa holding a TV remote control',
    descriptionDa: 'Figuren slapper af på en blød sofa med fjernbetjening i hånden og ser fjernsyn',
  },
  {
    key: 'skraldespand',
    title: 'Skraldespand & Pant',
    row: 8,
    col: 2,
    descriptionEn: 'Character carrying a green garbage bag and empty returnable bottles to the recycle bin',
    descriptionDa: 'Figuren bærer en skraldepose og tomme pantflasker ud til affaldscontaineren',
  },
  // Række 9
  {
    key: 'forberede_mad',
    title: 'Lave aftensmad',
    row: 9,
    col: 1,
    descriptionEn: 'Character preparing evening meal at the kitchen counter with a cutting board and pot',
    descriptionDa: 'Figuren gør aftensmad klar ved køkkenbordet med et skærebræt og en gryde',
  },
  {
    key: 'toej_af',
    title: 'Aftenhygiejne / Gøre klar til nat',
    row: 9,
    col: 2,
    descriptionEn: 'Character washing hands and face at the bathroom sink, getting ready for the night',
    descriptionDa: 'Figuren vasker hænder og ansigt ved badeværelsesvasken og gør sig klar til sengetid',
  },
  // Række 10
  {
    key: 'sengetid',
    title: 'Sengetid / Sove',
    row: 10,
    col: 1,
    descriptionEn: 'Character sleeping peacefully tucked in bed under a soft duvet with head on pillow',
    descriptionDa: 'Figuren sover trygt og godt under en blød dyne med hovedet hvilende på puden',
  },
  {
    key: 'weekend',
    title: 'Weekendhygge / Frisk luft',
    row: 10,
    col: 2,
    descriptionEn: 'Character enjoying a relaxed weekend outdoor moment with relaxed posture and a warm smile',
    descriptionDa: 'Figuren nyder en afslappet weekendstund med rolige skuldre og godt humør',
  },
];

/**
 * 20-in-1 Master Sheet Prompt Generator (2x10 Grid).
 * Generates all 20 daily routine scenes in one single ChatGPT image (1080x1920 portrait).
 */
export function buildBatch20SheetPrompt(options?: { language?: 'da' | 'en' }): string {
  const isEn = options?.language !== 'da';

  if (isEn) {
    const rowsText = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map((r) => {
        const col1 = DEFAULT_2X10_SLOTS.find((s) => s.row === r && s.col === 1)!;
        const col2 = DEFAULT_2X10_SLOTS.find((s) => s.row === r && s.col === 2)!;
        return `### Row ${r}:
- **[Row ${r}, Col 1 — ${col1.title}]:** ${col1.descriptionEn}.
- **[Row ${r}, Col 2 — ${col2.title}]:** ${col2.descriptionEn}.`;
      })
      .join('\n\n');

    return `# 20-in-1 Master Sheet Prompt — 2x10 Daily Schedule Grid (Transparent Background)

## Reference Images to Attach in ChatGPT / DALL-E:
- **Image 1 — Avatar & Clothing Reference (Ref 1):** The 2D cartoon avatar. All physical appearance, facial identity, hairstyle, skin tone, AND WHATEVER SPECIFIC CLOTHING the character wears in Image 1 must be strictly replicated across all 20 scenes. Do NOT default to generic clothes or any outfit different from Image 1.
- **Image 2 — Art Style Reference (Ref 2):** 2D cartoon pictogram style: bold smooth black outlines, flat saturated colors, soft cel shading, friendly rounded proportions.
- **Image 3 (Optional) — Layout Grid Example:** \`sheet_2x10_example.png\` showing the 2 columns x 10 rows grid layout.

## Format & Canvas Layout:
- **Canvas Orientation:** One tall portrait sheet (9:16 aspect ratio, 1080 x 1920 pixels).
- **Grid Layout:** Exactly 2 columns × 10 rows (20 distinct standalone scenes in total).
- **Cell Proportion:** Each scene cell is wide/horizontal (aspect ratio ~2.8:1, approx 531 x 185 px at 25% scale of 2126x740), arranged side-by-side in 2 clean vertical columns.
- **100% Genuine Transparent Background:** Pure alpha transparency between and around all 20 scenes. NO background panels, NO boxes, NO white card frames, NO background walls or floors. Only the character and immediate activity props.
- **Spacing:** Generous clear transparent space between rows and columns so each scene can be sliced cleanly without touching adjacent scenes.

## The 20 Distinct Scenes (Organized Morning to Night):

${rowsText}

## Critical Requirements:
1. All 20 scenes MUST be generated on this single 1080x1920 image in the exact 2x10 grid order.
2. Character must be 100% identical to Image 1 across all 20 cells, wearing the EXACT same clothing shown in Image 1.
3. Completely transparent background (PNG alpha). Only the character and direct scene props are visible.
4. No text, labels, numbers, or border lines.`;
  }

  const rowsTextDa = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((r) => {
      const col1 = DEFAULT_2X10_SLOTS.find((s) => s.row === r && s.col === 1)!;
      const col2 = DEFAULT_2X10_SLOTS.find((s) => s.row === r && s.col === 2)!;
      return `### Række ${r}:
- **[Række ${r}, Søjle 1 — ${col1.title}]:** ${col1.descriptionDa}.
- **[Række ${r}, Søjle 2 — ${col2.title}]:** ${col2.descriptionDa}.`;
    })
    .join('\n\n');

  return `# 20-i-1 Master Ark Prompt — 2x10 Dagsplan Gitter (Gennemsigtig Baggrund)

## Referencebilleder der SKAL vedhæftes i ChatGPT / DALL-E:
- **Billede 1 — Figur / Avatar (Ref 1):** Din færdige cartoon avatar. Alt vedrørende personens udseende, ansigt, hudtone, frisure og DET PRÆCISE TØJ fra Billede 1 skal holdes 100% konsistent på tværs af alle 20 scener.
- **Billede 2 — Stilreference (Ref 2):** 2D tegneseriestil: tykke sorte omrids, flade mættede farver, cel-shading og venligt udtryk.
- **Billede 3 (Valgfrit) — Layout-reference:** \`sheet_2x10_example.png\` der viser 2 søjler x 10 rækker layoutet.

## Format & Komposition:
- **Lærred:** Ét højformat ark (9:16 format, 1080 x 1920 pixels).
- **Gitter:** Nøjagtig 2 søjler × 10 rækker (20 separate selvstændige scener).
- **Celle-proportion:** Hver scene er i aflangt bredformat (~2.8:1, ca. 531 x 185 px ved 25% skalering af 2126x740), placeret pænt ved siden af hinanden i 2 lodrette søjler.
- **100% Gennemsigtig Baggrund:** Ægte gennemsigtighed (alpha-kanal). INGEN baggrundskasser, INGEN hvide rammer, INGEN vægge eller gulve. Kun figuren og de nødvendige rekvisitter.
- **Afstand:** God luft imellem scenerne, så hver scene kan beskæres automatisk uden overlap.

## De 20 Forskellige Scener (Morgen til Aften):

${rowsTextDa}

## Vigtige Krav:
1. Alle 20 scener SKAL være på dette ene 1080x1920 billede i den angivne 2x10 rækkefølge.
2. Figuren skal være 100% identisk med Billede 1 og have det SAMME tøj på i alle 20 felter.
3. 100% gennemsigtig baggrund uden baggrundsfarve eller rammer.
4. Ingen tekst, ingen bogstaver, ingen tal og ingen kantstreger.`;
}
