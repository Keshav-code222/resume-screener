// Chapter registry — single source of truth for the Landing page's
// numbered section navigation. Order in this array = order on the page.

export const chapters = [
  {
    id: 'prolog',
    index: '00',
    label: 'Prolog',
    title: 'The AI that reads you.',
  },
  {
    id: 'about',
    index: '01',
    label: 'About',
    title: 'Most resumes are never read.',
  },
  {
    id: 'method',
    index: '02',
    label: 'Method',
    title: 'How it works.',
  },
  {
    id: 'results',
    index: '03',
    label: 'Results',
    title: 'A precise reading.',
  },
  {
    id: 'trust',
    index: '04',
    label: 'Trust',
    title: 'Voices from the field.',
  },
  {
    id: 'begin',
    index: '05',
    label: 'Begin',
    title: 'Your next chapter starts here.',
  },
];

export const chapterIds = chapters.map((c) => c.id);
