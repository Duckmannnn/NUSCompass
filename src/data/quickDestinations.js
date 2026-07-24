export const QUICK_DESTINATIONS = [
  {
    id: 'nearest-male-toilet',
    label: "Nearest men's toilet",
    type: 'nearest-toilet',
    toiletGender: 'male',
    keywords: ['man', 'men', 'mens', 'male', 'toilet', 'bathroom', 'restroom'],
  },
  {
    id: 'nearest-female-toilet',
    label: "Nearest women's toilet",
    type: 'nearest-toilet',
    toiletGender: 'female',
    keywords: ['woman', 'women', 'womens', 'female', 'toilet', 'bathroom', 'restroom'],
  },
];

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '');
}

export function filterQuickDestinations(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return QUICK_DESTINATIONS;

  return QUICK_DESTINATIONS.filter((destination) =>
    [
      destination.id,
      destination.label,
      destination.toiletGender,
      ...destination.keywords,
    ]
      .map(normalize)
      .some((value) =>
        value === normalizedQuery ||
        value.startsWith(normalizedQuery) ||
        normalizedQuery.startsWith(value)
      )
  );
}
