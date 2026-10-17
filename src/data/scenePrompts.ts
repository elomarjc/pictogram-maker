export interface ScenePromptItem {
  id: string;
  category: string;
  title: string;
  prompt: string;
}

/**
 * Dansk Master Prompt Generator til ChatGPT / DALL-E.
 * Tager højde for den valgte figur (Mand, Kvinde eller Tilpasset).
 */
export function buildDanishMasterPrompt(options: {
  sceneDescription: string;
  personaName?: string;
  isWoman?: boolean;
}): string {
  const charSubject = options.isWoman
    ? 'kvinden fra Referencebillede 1 (kvindelig figur med hestehale og turkis hættetrøje)'
    : 'manden fra Referencebillede 1 (mandlig figur med kort hår og grå hættetrøje)';

  return `# Master Prompt — Piktogram Generator (Dansk)

## Referencebilleder
- **Billede 1 — Figur / Avatar (Ref 1):** Brug dette billede som den præcise figur-reference. Bevar personens udseende, ansigt, hudtone, frisure, ansigtstræk, tøj, kropsproportioner og genkendelige identitet nøjagtigt.
- **Billede 2 — Eksempel / Tegnestil (Ref 2):** Brug dette billede som den visuelle stilart-reference for tegneserie-illustrationen: linjetykkelse, farvemætning, cel-shading og venlig, pædagogisk piktogram-æstetik. Lav IKKE en hel tavle, kun selve illustrationen.

## Scene der skal genereres:
${options.sceneDescription.trim() || 'Personen udfører aktiviteten glad og naturligt.'}

## Instruktioner til ChatGPT / DALL-E:

Skab **én enkeltstående 2D cartoon illustration** af den angivne scene. Resultatet skal indsættes direkte på et piktogramkort i en visuel dagsplan.

### 1. Karakter-konsistens
- Hovedpersonen er ${charSubject}.
- Personen skal være 100% genkendelig og visuelt konsistent med Referencebillede 1.
- Tilpas personens kropsstilling, ansigtsudtryk og håndstillinger naturligt til den ønskede aktivitet.
- Udtrykket skal være venligt, glad, imødekommende og let at afkode med et enkelt blik.

### 2. Tegnestil
- Ren, skarp 2D tegneseriestil.
- Tydelige, tykke og bløde sorte omrids (outlines) rundt om figuren og genstande.
- Klare, mættede farver med enkel cel-shading (skygger uden fotorealisme).
- Runde former, klare silhuetter og venlige proportioner (som i Referencebillede 2).
- Ingen 3D-effekter, ingen fotorealisme, ingen skitseteksturer og ingen unødvendige detaljer.

### 3. Komposition & Rekvisitter
- Vis kun figuren i gang med aktiviteten sammen med de relevante rekvisitter (f.eks. bord, kaffekop, vasketøjskurv, tandbørste).
- Vandret, balanceret komposition der passer i et aflangt piktogram-felt.
- Hold figuren i centrum som det primære fokuspunkt.

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

/**
 * Generates an optimized prompt for Cloudflare Workers AI text-to-image models
 * (Flux-1-Schnell or SD-XL Lightning). Maintains exact persona characteristics,
 * clean 2D vector pictogram style, thick outlines and clean isolated background.
 */
export function buildCloudflareAiPrompt(options: {
  sceneDescription: string;
  personaName?: string;
  isWoman?: boolean;
}): string {
  const character = options.isWoman
    ? 'friendly young woman with dark hair in a ponytail wearing a teal hoodie'
    : 'friendly young man with short dark hair wearing a grey hoodie';

  const activity = options.sceneDescription.trim() || 'performing daily task happily';

  return `Clean 2D cartoon pictogram vector illustration of a ${character}, ${activity}. Cute flat cel-shaded vector art style, thick soft black outlines, bright clean solid colors, isolated on pure white background, friendly autism visual schedule icon, no text, no frame, high quality.`;
}

