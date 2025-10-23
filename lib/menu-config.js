const RAW_MENU_SECTIONS = [
  {
    key: "grafik",
    title: "Grafik",
    items: [
      { label: "Akumulasi Realtime" },
      { label: "Pending & Progress" },
      { label: "Monitoring iDeb" },
      { label: "Trend Hold Aplikasi" },
      { label: "Trend Aplikasi Masuk" },
      { label: "Trend Nominal Pencairan" },
      { label: "Trend Pencairan" },
    ],
  },
  {
    key: "productivity",
    title: "Productivity",
    items: [
      { label: "Realisasi SLA FF" },
      { label: "Pipeline FF" },
    ],
  },
  {
    key: "report",
    title: "Report",
    items: [
      { label: "Report LD Pencairan" },
      { label: "Report Per Period" },
      { label: "Grafik Alasan Cancel Reject" },
    ],
  },
  {
    key: "griya",
    title: "Griya",
    alignRight: true,
    items: [
      { label: "Pipeline Griya" },
      { label: "Report Griya" },
      { label: "Report SLA Griya" },
      { label: "Master PKS Griya" },
      { label: "Pending Progress Griya" },
    ],
  },
  {
    key: "administrator",
    title: "Administrator",
    items: [
      { label: "Users" },
      { label: "Groups" },
      { label: "Divisi" },
      { label: "Master Parameter" },
      { label: "Maintenance RO (Area)" },
      { label: "Monitoring Helpdesk" },
      { label: "Monitoring Akses IP Address" },
      { label: "Manajemen Menu" },
      { label: "IT Helpdesk Task" },
      { label: "File Finder (Logs View)" },
    ],
  },
];

const RAW_STANDALONE_LINKS = [
  {
    key: "inquiry-aplikasi",
    label: "Inquiry Aplikasi",
    path: "/inquiry-aplikasi",
    category: "standalone",
  },
];

export const normalizeMenuPath = (value) => {
  if (!value) return "/";
  let normalized = String(value).trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized.toLowerCase();
};

const buildDefaultPath = (category, label) =>
  `/${category}/${label.toLowerCase().replace(/\s+/g, "-")}`;

const resolveSections = (sections) =>
  sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const path =
        item.path ?? buildDefaultPath(section.key, item.label);
      return {
        ...item,
        path,
        normalizedPath: normalizeMenuPath(path),
        category: section.key,
        title: section.title,
      };
    }),
  }));

const resolveStandalone = (links) =>
  links.map((item) => {
    const path = item.path ?? `/${item.key}`;
    return {
      ...item,
      path,
      normalizedPath: normalizeMenuPath(path),
      category: item.category ?? "standalone",
    };
  });

export const MENU_SECTIONS = resolveSections(RAW_MENU_SECTIONS);
export const STANDALONE_LINKS = resolveStandalone(RAW_STANDALONE_LINKS);

const PATH_METADATA = new Map();

for (const section of MENU_SECTIONS) {
  for (const item of section.items) {
    if (!PATH_METADATA.has(item.normalizedPath)) {
      PATH_METADATA.set(item.normalizedPath, {
        urlPath: item.path,
        label: item.label,
        category: section.key,
        title: section.title,
        normalizedPath: item.normalizedPath,
      });
    }
  }
}

for (const item of STANDALONE_LINKS) {
  if (!PATH_METADATA.has(item.normalizedPath)) {
    PATH_METADATA.set(item.normalizedPath, {
      urlPath: item.path,
      label: item.label,
      category: item.category,
      title: item.label,
      normalizedPath: item.normalizedPath,
    });
  }
}

export function findMenuEntryByPath(path) {
  if (!path) return null;
  return PATH_METADATA.get(normalizeMenuPath(path)) ?? null;
}

export const MENU_ENTRIES = Array.from(PATH_METADATA.values());
