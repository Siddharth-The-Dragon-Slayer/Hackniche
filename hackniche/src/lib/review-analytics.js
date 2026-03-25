
export const BRANCHES = [
    { id: "pfd_b1", name: "Kalyan West", google: 4.6, zomato: 4.2, reviews: 13803, priceTwo: 900, staff: ["Kohli", "Rahul", "Sameer", "Deepak"], city: "Kalyan", sentiment: { pos: 92, neu: 6, neg: 2 } },
    { id: "pfd_b2", name: "Kalyan East", google: 4.7, zomato: 4.0, reviews: 13379, priceTwo: 850, staff: ["Bikas", "Anjali", "Sushant"], city: "Kalyan", sentiment: { pos: 90, neu: 7, neg: 3 } },
    { id: "pfd_b3", name: "Mulund", google: 4.7, zomato: 4.0, reviews: 10908, priceTwo: 950, staff: ["Kiran", "Jidau", "Anish", "Saroj", "Asha", "Amit", "Vinay"], city: "Mumbai", sentiment: { pos: 94, neu: 5, neg: 1 } },
    { id: "pfd_b4", name: "Thane", google: 4.7, zomato: 4.3, reviews: 10593, priceTwo: 1000, staff: ["Ishwar", "Manoj", "Prasad", "Sneha"], city: "Thane", sentiment: { pos: 91, neu: 7, neg: 2 } },
    { id: "pfd_b5", name: "Dombivali", google: 4.6, zomato: null, reviews: 6758, priceTwo: 950, staff: ["Padam Raj", "Kavita", "Suresh"], city: "Dombivali", sentiment: { pos: 89, neu: 8, neg: 3 } },
    { id: "pfd_b6", name: "Badlapur", google: 4.6, zomato: null, reviews: 6388, priceTwo: 1000, staff: ["Chandan Kumar", "Rajesh", "Pooja"], city: "Badlapur", sentiment: { pos: 88, neu: 9, neg: 3 } },
    { id: "pfd_b7", name: "Powai", google: 4.7, zomato: 4.0, reviews: 4398, priceTwo: 1200, staff: ["Shivam", "Anjali", "Vikram", "Neha"], city: "Mumbai", sentiment: { pos: 93, neu: 5, neg: 2 } },
    { id: "pfd_b8", name: "Virar", google: 4.7, zomato: 3.5, reviews: 3376, priceTwo: 1025, staff: ["Gopal", "Anita", "Ravi"], city: "Virar", sentiment: { pos: 87, neu: 9, neg: 4 } },
    { id: "pfd_b9", name: "Vashi", google: 4.6, zomato: null, reviews: 908, priceTwo: 1000, staff: ["Sanjay", "Meera"], city: "Navi Mumbai", sentiment: { pos: 86, neu: 10, neg: 4 } },
];

export const CATEGORIES = [
    { name: "Food Quality", mentions: 38, keywords: ["delicious", "tasty", "flavor", "bursting", "divine"] },
    { name: "Service Speed", mentions: 22, keywords: ["quick", "fast", "minimal wait", "efficient"] },
    { name: "Staff Behaviour", mentions: 29, keywords: ["attentive", "polite", "sweet", "helpful", "exceptional"] },
    { name: "Ambience", mentions: 18, keywords: ["ambiance", "interiors", "comfortable", "soothing", "beautiful"] },
    { name: "Cleanliness", mentions: 14, keywords: ["hygiene", "clean", "maintained", "washroom"] },
    { name: "Value for Money", mentions: 11, keywords: ["affordable", "worth", "great value"] },
];

export const STAFF_MENTIONS = [
    { name: "Kiran + Team (Mulund)", count: 6, branch: "Mulund" },
    { name: "Shivam & Anjali (Powai)", count: 4, branch: "Powai" },
    { name: "Padam Raj (Dombivali)", count: 3, branch: "Dombivali" },
    { name: "Kohli (Kalyan W)", count: 3, branch: "Kalyan West" },
    { name: "Ishwar (Thane)", count: 2, branch: "Thane" },
    { name: "Bikas (Kalyan E)", count: 2, branch: "Kalyan East" },
    { name: "Chandan Kumar (Badlapur)", count: 2, branch: "Badlapur" },
];

export const PLATFORM_COVERAGE = [
    { platform: "Google", outlets: 9 },
    { platform: "Zomato", outlets: 6 },
    { platform: "JustDial", outlets: 1 },
    { platform: "TripAdvisor", outlets: 2 },
];

export const RADAR_DATA = [
    { subject: "Food", A: 95 },
    { subject: "Service", A: 88 },
    { subject: "Staff", A: 91 },
    { subject: "Ambience", A: 87 },
    { subject: "Cleanliness", A: 83 },
    { subject: "Value", A: 79 },
];
