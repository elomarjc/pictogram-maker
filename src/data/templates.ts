import type { TemplateDefinition, WeekPlan, DayOfWeek, DaySchedule, DayShift, DayShiftState, Pictogram } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { REFERENCE_PALETTE } from '../services/personas';

export const BUILTIN_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'k_fuld_uge',
    name: 'K. – Komplet Ugeplan (Anbefalet)',
    description: 'Den autentiske ugeplan baseret på referencebilledet og de 18 dagsplaner for K. med personlige rutiner, dag- og aftenprogrammer.',
    icon: 'Calendar',
    personaId: 'avatar_1',
    shortCode: 'K.',
    days: {
      mandag: {
        headerSubtitle: 'AV',
        pictograms: [
          {
            title: 'Hænge vasketøj op',
            subtitle: 'Vasketøjskurv og vaskemaskine',
            iconId: 'shirt',
            illustrationId: 'vaesketoeg',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'lg',
          },
          {
            title: 'The & Kaffe',
            subtitle: 'Hyggepause',
            iconId: 'coffee',
            illustrationId: 'kaffe',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'lg',
          },
          {
            title: 'Medicin',
            subtitle: 'Husk et glas vand',
            iconId: 'pill',
            illustrationId: 'medicin',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'lg',
          },
          {
            title: 'Badetid',
            subtitle: 'Bruser og sæbe',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'lg',
          },
          {
            title: 'Spisetid',
            subtitle: 'Frokost eller aftensmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'lg',
          },
          {
            title: 'Aktiviteter',
            subtitle: 'Tegne, perler, musik eller bold',
            iconId: 'palette',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'lg',
          },
          {
            title: 'Vaske op',
            subtitle: 'Rene tallerkener',
            iconId: 'brush',
            illustrationId: 'vaske_op',
            bgColor: REFERENCE_PALETTE.mint,
            fontSize: 'lg',
          },
          {
            title: 'Bolle',
            subtitle: 'Lækker snack',
            iconId: 'bun',
            illustrationId: 'bolle',
            bgColor: REFERENCE_PALETTE.lavender,
            fontSize: 'lg',
          },
          {
            title: 'Sengetid',
            subtitle: 'Godnat og sov godt',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'lg',
          },
        ],
      },
      tirsdag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin',
            subtitle: 'Morgenmedicin',
            iconId: 'pill',
            illustrationId: 'medicin',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Morgenmad',
            subtitle: 'Spise morgenmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Bad',
            subtitle: 'Morgenbad',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Skifte seng og støvsuge',
            subtitle: 'Aflevere sengetøj',
            iconId: 'bed_make',
            illustrationId: 'rede_seng',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Gåtur',
            subtitle: 'Gå en tur i frisk luft',
            iconId: 'walk',
            illustrationId: 'gatur',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Aktiviteter',
            subtitle: 'Kreativt / spil',
            iconId: 'palette',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Frokost',
            subtitle: 'Spisetid',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Vaske op',
            subtitle: 'Rydde op efter frokost',
            iconId: 'brush',
            illustrationId: 'vaske_op',
            bgColor: REFERENCE_PALETTE.mint,
            fontSize: 'base',
          },
          {
            title: 'Hvile / Pause',
            subtitle: 'Ligge på sofa med telefon/TV',
            iconId: 'smile',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Forberede mad ved K.',
            subtitle: 'Lave aftensmad',
            iconId: 'utensils_crossed',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Aftensmad',
            subtitle: 'Spise sammen',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'TV',
            subtitle: 'Slappe af med TV',
            iconId: 'tv',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Medicin & Bolle',
            subtitle: 'Aftensnack og medicin',
            iconId: 'pill',
            illustrationId: 'bolle',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Sove',
            subtitle: 'Godnat',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
      onsdag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin & Morgenmad',
            subtitle: 'Start dagen roligt',
            iconId: 'sun',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Bad & Rede seng',
            subtitle: 'Gøre klar',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Støvsuge bag sofa',
            subtitle: 'Gøre pænt rent',
            iconId: 'brush',
            illustrationId: 'vaske_op',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Handle indkøb',
            subtitle: 'Sodavand, øl & varer',
            iconId: 'shopping',
            illustrationId: 'handle',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Frokost & Opvask',
            subtitle: 'Midt på dagen',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Hvile på sofa',
            subtitle: 'Pause med kaffe og personale',
            iconId: 'coffee',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Forberede mad & Spise',
            subtitle: 'Aftensmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Vaske op & TV',
            subtitle: 'Aftenhygge',
            iconId: 'tv',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Medicin, Bolle & Sove',
            subtitle: 'Godnat',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
      torsdag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin & Morgenmad',
            subtitle: 'Morgenrutine',
            iconId: 'sun',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Bad & Rede seng',
            subtitle: 'Personlig hygiejne',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Vasketøj i vaskeri',
            subtitle: 'Vaske tøj over med poser',
            iconId: 'shirt',
            illustrationId: 'vaesketoeg',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Musik i stalden',
            subtitle: 'Husorkester og spil',
            iconId: 'music',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'lg',
          },
          {
            title: 'Frokost & Vaske op',
            subtitle: 'Madpause',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Hvile & Film/Kaffe',
            subtitle: 'Pause med personale',
            iconId: 'coffee',
            illustrationId: 'kaffe',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Forberede mad & Spise',
            subtitle: 'Aftensmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Medicin, Bolle & Sove',
            subtitle: 'Godnat',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
      fredag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin & Morgenmad',
            subtitle: 'God fredag morgen',
            iconId: 'sun',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Bad & Rede seng',
            subtitle: 'Gøre klar',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Aktivitet i salen',
            subtitle: 'Gymnastik / bevægelse',
            iconId: 'workout',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Gåtur',
            subtitle: 'Frisk luft',
            iconId: 'walk',
            illustrationId: 'gatur',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Frokost & Opvask',
            subtitle: 'Spise og rydde af',
            iconId: 'utensils',
            illustrationId: 'vaske_op',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Film & Kaffe',
            subtitle: 'Fredagshygge med personale',
            iconId: 'tv',
            illustrationId: 'kaffe',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Aftensmad & Hygge',
            subtitle: 'Lækker fredagsmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Medicin, Bolle & Sove',
            subtitle: 'Godnat',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
      loerdag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin & Morgenmad',
            subtitle: 'Rolig weekend morgen',
            iconId: 'sun',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Skrald & Flasker',
            subtitle: 'Aflevere pant',
            iconId: 'trash',
            illustrationId: 'skraldespand',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Handle lørdagssnack',
            subtitle: 'Kage, flæskesvær og sodavand',
            iconId: 'shopping',
            illustrationId: 'handle',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Aktivitet & Hobby',
            subtitle: 'Frit valg',
            iconId: 'palette',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Frokost & Pause',
            subtitle: 'Slap af på sofaen',
            iconId: 'smile',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Forberede mad & Spise',
            subtitle: 'God weekendmad',
            iconId: 'utensils',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'TV & Film',
            subtitle: 'Lørdagsfilm',
            iconId: 'tv',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Medicin, Boller & Sove',
            subtitle: 'Godnat',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
      soendag: {
        headerSubtitle: 'K.',
        pictograms: [
          {
            title: 'Medicin & Morgenmad',
            subtitle: 'Morgenhygge',
            iconId: 'sun',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.yellow,
            fontSize: 'base',
          },
          {
            title: 'Bad & Rede seng',
            subtitle: 'Rent og pænt',
            iconId: 'shower',
            illustrationId: 'badetid',
            bgColor: REFERENCE_PALETTE.cyan,
            fontSize: 'base',
          },
          {
            title: 'Gåtur & Frisk luft',
            subtitle: 'Gå en god tur',
            iconId: 'walk',
            illustrationId: 'gatur',
            bgColor: REFERENCE_PALETTE.green,
            fontSize: 'base',
          },
          {
            title: 'Aktivitet (Sansehus / Bamsehus)',
            subtitle: 'Oplevelser eller afslapning',
            iconId: 'heart',
            illustrationId: 'aktiviteter',
            bgColor: REFERENCE_PALETTE.purple,
            fontSize: 'base',
          },
          {
            title: 'Frokost & Opvask',
            subtitle: 'Middag',
            iconId: 'utensils',
            illustrationId: 'vaske_op',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Hvile på sofa',
            subtitle: 'Pause uden personale',
            iconId: 'smile',
            illustrationId: 'pause_sofa',
            bgColor: REFERENCE_PALETTE.pink,
            fontSize: 'base',
          },
          {
            title: 'Lave mad & Spise',
            subtitle: 'Søndagsmiddag',
            iconId: 'utensils_crossed',
            illustrationId: 'spisetid',
            bgColor: REFERENCE_PALETTE.orange,
            fontSize: 'base',
          },
          {
            title: 'Medicin, Bolle & Sove',
            subtitle: 'Klar til ny uge',
            iconId: 'bed',
            illustrationId: 'sengetid',
            bgColor: REFERENCE_PALETTE.blue,
            fontSize: 'base',
          },
        ],
      },
    },
  },
  {
    id: 'k_dag_uge',
    name: 'K. – Dagsprogrammer (Hverdag & Weekend)',
    description: 'Fokuseret på formiddags- og eftermiddagsrutiner, rengøring, gåture, bad og frokost.',
    icon: 'Sun',
    personaId: 'avatar_1',
    shortCode: 'K.',
    days: {
      mandag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', subtitle: 'Morgen', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', subtitle: 'Spise morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', subtitle: 'Personlig pleje', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', subtitle: 'Gøre værelse klart', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Vasketøj', subtitle: 'Sætte tøj over', iconId: 'shirt', illustrationId: 'vaesketoeg', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', subtitle: 'Gå en tur', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', subtitle: 'Perler, film, cykle, have', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', subtitle: 'Spisetid', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', subtitle: 'Rydde af bordet', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', subtitle: 'Pause på sofa', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe', subtitle: 'Med personale', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', subtitle: 'Ligge på sofa', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      tirsdag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Skifte seng og støvsuge', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktiviteter', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe', subtitle: 'Med personale', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      onsdag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Støvsuge bag sofa', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Handle / Film/Kaffe', iconId: 'shopping', illustrationId: 'handle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      torsdag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Vasketøj (vaskeri m. poser)', iconId: 'shirt', illustrationId: 'vaesketoeg', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet (Musik i stalden)', iconId: 'music', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      fredag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet (I Salen)', iconId: 'workout', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe m. personale', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      loerdag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
      soendag: {
        headerSubtitle: 'Dag',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Rede seng', iconId: 'bed_make', illustrationId: 'rede_seng', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktiviteter', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'Hvile', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Film / Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
        ],
      },
    },
  },
  {
    id: 'k_aften_uge',
    name: 'K. – Aftenprogrammer (Mandag–Søndag Aften)',
    description: 'Struktur for aftenhygge: kaffe, skrald, madlavning, opvask, TV, medicin-bolle og sengetid.',
    icon: 'Moon',
    personaId: 'avatar_1',
    shortCode: 'K.',
    days: {
      mandag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Vasketøj (Hænge tøj op)', iconId: 'shirt', illustrationId: 'vaesketoeg', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet / Arbejde', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause (uden personale)', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove / God nat', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      tirsdag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      onsdag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      torsdag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Vasketøj', iconId: 'shirt', illustrationId: 'vaesketoeg', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      fredag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      loerdag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skrald - Flasker', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Handle', iconId: 'shopping', illustrationId: 'handle', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Forberede mad ved K.', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Boller', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      soendag: {
        headerSubtitle: 'Aften',
        pictograms: [
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Kaffe', iconId: 'coffee', illustrationId: 'kaffe', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Skraldespand', iconId: 'trash', illustrationId: 'skraldespand', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Gå', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Lave mad', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
    },
  },
  {
    id: 'k_hjem_til_far',
    name: 'K. – Hjem til far & Ophold',
    description: 'Skabelon til weekendbesøg: Forberedelse, afhentning af far, tilbagekomst til ophold og aftenro.',
    icon: 'Heart',
    personaId: 'avatar_1',
    shortCode: 'K.',
    days: {
      fredag: {
        headerSubtitle: 'Hjem til far',
        pictograms: [
          { title: 'Medicin', iconId: 'pill', illustrationId: 'medicin', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Morgenmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Afslapning på sofa', subtitle: 'Sammen med personale', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Far kommer', subtitle: 'Husk medicin og tøj', iconId: 'car', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.orange, fontSize: 'lg' },
        ],
      },
      soendag: {
        headerSubtitle: 'Tilbage til ophold',
        pictograms: [
          { title: 'Far afleverer', subtitle: 'Velkommen hjem til ophold', iconId: 'car', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.orange, fontSize: 'lg' },
          { title: 'Afslapning på sofa', subtitle: 'Er sammen med personale', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.lavender, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Pause', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.pink, fontSize: 'base' },
          { title: 'Forberede mad', iconId: 'utensils_crossed', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Spise', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Vaske op', iconId: 'brush', illustrationId: 'vaske_op', bgColor: REFERENCE_PALETTE.mint, fontSize: 'base' },
          { title: 'TV', iconId: 'tv', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Medicin - Bolle', iconId: 'pill', illustrationId: 'bolle', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Sove', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      mandag: { headerSubtitle: 'Hverdag', pictograms: [] },
      tirsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      onsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      torsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      loerdag: { headerSubtitle: 'Ved far', pictograms: [] },
    },
  },
  {
    id: 'enkel_hverdag',
    name: 'Enkel Hverdagsplan',
    description: 'Klassisk overskuelig struktur til hverdagen for voksne eller børn.',
    icon: 'Sun',
    days: {
      mandag: {
        headerSubtitle: 'Hverdag',
        pictograms: [
          { title: 'Morgenmad', iconId: 'coffee', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.yellow, fontSize: 'base' },
          { title: 'Børste tænder & Bad', iconId: 'shower', illustrationId: 'badetid', bgColor: REFERENCE_PALETTE.cyan, fontSize: 'base' },
          { title: 'Aktivitet', iconId: 'palette', illustrationId: 'aktiviteter', bgColor: REFERENCE_PALETTE.purple, fontSize: 'base' },
          { title: 'Frokost', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Pause & Slap af', iconId: 'smile', illustrationId: 'pause_sofa', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Gåtur', iconId: 'walk', illustrationId: 'gatur', bgColor: REFERENCE_PALETTE.green, fontSize: 'base' },
          { title: 'Aftensmad', iconId: 'utensils', illustrationId: 'spisetid', bgColor: REFERENCE_PALETTE.orange, fontSize: 'base' },
          { title: 'Sengetid', iconId: 'bed', illustrationId: 'sengetid', bgColor: REFERENCE_PALETTE.blue, fontSize: 'base' },
        ],
      },
      tirsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      onsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      torsdag: { headerSubtitle: 'Hverdag', pictograms: [] },
      fredag: { headerSubtitle: 'Hverdag', pictograms: [] },
      loerdag: { headerSubtitle: 'Weekend', pictograms: [] },
      soendag: { headerSubtitle: 'Weekend', pictograms: [] },
    },
  },
  {
    id: 'tom_plan',
    name: 'Tom Ugeplan',
    description: 'En helt tom plan med 7 blanke dage, hvor du kan opbygge dit eget program fra bunden.',
    icon: 'FileText',
    days: {
      mandag: { headerSubtitle: '', pictograms: [] },
      tirsdag: { headerSubtitle: '', pictograms: [] },
      onsdag: { headerSubtitle: '', pictograms: [] },
      torsdag: { headerSubtitle: '', pictograms: [] },
      fredag: { headerSubtitle: '', pictograms: [] },
      loerdag: { headerSubtitle: '', pictograms: [] },
      soendag: { headerSubtitle: '', pictograms: [] },
    },
  },
];

let idCounter = 1;
export function generateUniqueId(prefix: string = 'pic'): string {
  return `${prefix}_${Date.now()}_${idCounter++}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getDefaultDagPictogramsForDay(dayId: DayOfWeek): Pictogram[] {
  const dagTemplate = BUILTIN_TEMPLATES.find((t) => t.id === 'k_dag_uge');
  const items = dagTemplate?.days[dayId]?.pictograms || [];
  return items.map((p) => ({
    ...p,
    id: generateUniqueId('item'),
  }));
}

export function getDefaultAftenPictogramsForDay(dayId: DayOfWeek): Pictogram[] {
  const aftenTemplate = BUILTIN_TEMPLATES.find((t) => t.id === 'k_aften_uge');
  const items = aftenTemplate?.days[dayId]?.pictograms || [];
  return items.map((p) => ({
    ...p,
    id: generateUniqueId('item'),
  }));
}

export function createWeekPlanFromTemplate(template: TemplateDefinition, name?: string): WeekPlan {
  const planId = generateUniqueId('plan');
  const now = new Date().toISOString();

  const isAftenOnly = template.id === 'k_aften_uge';
  const initialShift: DayShift = isAftenOnly ? 'aften' : 'dag';

  const daysRecord = {} as Record<DayOfWeek, DaySchedule>;

  DAYS_OF_WEEK.forEach((day) => {
    const tDay = template.days[day.id] || { headerSubtitle: '', pictograms: [] };

    const dagPics: Pictogram[] =
      tDay.dagPictograms?.map((p) => ({ ...p, id: generateUniqueId('item') })) ||
      (!isAftenOnly && tDay.pictograms.length > 0
        ? tDay.pictograms.map((p) => ({ ...p, id: generateUniqueId('item') }))
        : getDefaultDagPictogramsForDay(day.id));

    const aftenPics: Pictogram[] =
      tDay.aftenPictograms?.map((p) => ({ ...p, id: generateUniqueId('item') })) ||
      (isAftenOnly && tDay.pictograms.length > 0
        ? tDay.pictograms.map((p) => ({ ...p, id: generateUniqueId('item') }))
        : getDefaultAftenPictogramsForDay(day.id));

    const activePics = initialShift === 'aften' ? aftenPics : dagPics;
    const activeSubtitle = initialShift === 'aften' ? 'Aften' : (tDay.headerSubtitle || 'Dag');
    const activeDayName = `${day.name} - ${initialShift === 'aften' ? 'Aften' : 'Dag'}`;
    const activeLeftIcon = initialShift === 'aften' ? 'moon' : 'sun';
    const activeRightIcon = initialShift === 'aften' ? 'star' : 'cloud';

    daysRecord[day.id] = {
      dayId: day.id,
      dayName: activeDayName,
      headerSubtitle: activeSubtitle,
      headerLeftIcon: activeLeftIcon,
      headerRightIcon: activeRightIcon,
      pictograms: activePics,
      activeShift: initialShift,
      dag: {
        dayName: `${day.name} - Dag`,
        headerSubtitle: 'Dag',
        headerLeftIcon: 'sun',
        headerRightIcon: 'cloud',
        pictograms: dagPics,
      },
      aften: {
        dayName: `${day.name} - Aften`,
        headerSubtitle: 'Aften',
        headerLeftIcon: 'moon',
        headerRightIcon: 'star',
        pictograms: aftenPics,
      },
    };
  });

  return {
    id: planId,
    name: name || template.name.split(' (')[0],
    description: template.description,
    personaId: template.personaId || 'avatar_1',
    shortCode: template.shortCode || 'K.',
    days: daysRecord,
    createdAt: now,
    updatedAt: now,
  };
}

export function ensureDayShiftState(daySchedule: DaySchedule): DaySchedule {
  const currentShift = daySchedule.activeShift || 'dag';
  const dayNameBase = DAYS_OF_WEEK.find((d) => d.id === daySchedule.dayId)?.name || 'Dag';
  const cleanBase = daySchedule.dayName.replace(/\s*[-–—]?\s*(Dag|Aften)\s*$/i, '').trim() || dayNameBase;
  const formattedDayName = currentShift === 'aften' ? `${cleanBase} - Aften` : `${cleanBase} - Dag`;

  let dag = daySchedule.dag;
  if (!dag || !dag.pictograms || dag.pictograms.length === 0) {
    dag = {
      dayName: `${cleanBase} - Dag`,
      headerSubtitle: 'Dag',
      headerLeftIcon: 'sun',
      headerRightIcon: 'cloud',
      pictograms:
        currentShift === 'dag' && daySchedule.pictograms?.length > 0
          ? [...daySchedule.pictograms]
          : getDefaultDagPictogramsForDay(daySchedule.dayId),
    };
  } else if (!dag.dayName || dag.dayName === cleanBase) {
    dag.dayName = `${cleanBase} - Dag`;
  }

  let aften = daySchedule.aften;
  if (!aften || !aften.pictograms || aften.pictograms.length === 0) {
    aften = {
      dayName: `${cleanBase} - Aften`,
      headerSubtitle: 'Aften',
      headerLeftIcon: 'moon',
      headerRightIcon: 'star',
      pictograms:
        currentShift === 'aften' && daySchedule.pictograms?.length > 0
          ? [...daySchedule.pictograms]
          : getDefaultAftenPictogramsForDay(daySchedule.dayId),
    };
  } else if (!aften.dayName || aften.dayName === cleanBase) {
    aften.dayName = `${cleanBase} - Aften`;
  }

  return {
    ...daySchedule,
    dayName: daySchedule.dayName && daySchedule.dayName.includes(' - ') ? daySchedule.dayName : formattedDayName,
    activeShift: currentShift,
    dag,
    aften,
  };
}

export function switchDayScheduleShift(daySchedule: DaySchedule, targetShift: DayShift): DaySchedule {
  const schedule = ensureDayShiftState(daySchedule);
  const currentShift = schedule.activeShift || 'dag';

  if (currentShift === targetShift) {
    return schedule;
  }

  // Snapshot current state
  const currentState: DayShiftState = {
    dayName: schedule.dayName,
    headerSubtitle: schedule.headerSubtitle,
    headerFontSize: schedule.headerFontSize,
    headerLeftIcon: schedule.headerLeftIcon,
    headerRightIcon: schedule.headerRightIcon,
    pictograms: schedule.pictograms,
  };

  const updatedDag = currentShift === 'dag' ? currentState : schedule.dag!;
  const updatedAften = currentShift === 'aften' ? currentState : schedule.aften!;

  const targetState = targetShift === 'aften' ? updatedAften : updatedDag;
  const dayNameBase = DAYS_OF_WEEK.find((d) => d.id === schedule.dayId)?.name || 'Dag';
  const cleanBase =
    (targetState.dayName || schedule.dayName).replace(/\s*[-–—]?\s*(Dag|Aften)\s*$/i, '').trim() || dayNameBase;
  const targetDayName = targetShift === 'aften' ? `${cleanBase} - Aften` : `${cleanBase} - Dag`;

  return {
    ...schedule,
    activeShift: targetShift,
    dag: updatedDag,
    aften: updatedAften,
    dayName: targetDayName,
    headerSubtitle: targetState.headerSubtitle || (targetShift === 'aften' ? 'Aften' : 'Dag'),
    headerFontSize: targetState.headerFontSize ?? schedule.headerFontSize,
    headerLeftIcon: targetState.headerLeftIcon || (targetShift === 'aften' ? 'moon' : 'sun'),
    headerRightIcon: targetState.headerRightIcon || (targetShift === 'aften' ? 'star' : 'cloud'),
    pictograms:
      targetState.pictograms && targetState.pictograms.length > 0
        ? targetState.pictograms
        : targetShift === 'aften'
          ? getDefaultAftenPictogramsForDay(schedule.dayId)
          : getDefaultDagPictogramsForDay(schedule.dayId),
  };
}

export function syncActiveShiftState(daySchedule: DaySchedule): DaySchedule {
  const currentShift = daySchedule.activeShift || 'dag';
  const state: DayShiftState = {
    dayName: daySchedule.dayName,
    headerSubtitle: daySchedule.headerSubtitle,
    headerFontSize: daySchedule.headerFontSize,
    headerLeftIcon: daySchedule.headerLeftIcon,
    headerRightIcon: daySchedule.headerRightIcon,
    pictograms: daySchedule.pictograms,
  };
  return {
    ...daySchedule,
    dag: currentShift === 'dag' ? state : daySchedule.dag,
    aften: currentShift === 'aften' ? state : daySchedule.aften,
  };
}

