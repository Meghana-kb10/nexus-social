export const CURRENT_USER = {
  id: 'u_curr_01',
  name: 'Alex Rivera',
  username: 'alexdev',
  badge: 'Creator',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  notificationsCount: 3
};

export const INITIAL_POSTS = [
  {
    id: 'post_1',
    author: {
      name: 'Nitin Patel',
      username: 'nitin3w',
      badge: 'Legend',
      tier: 7,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isFollowing: false
    },
    timestamp: '15m ago',
    tag: 'Design & Architecture',
    text: 'Just completed the responsive layout revamp for our real-time social platform! 🚀 Clean navy design system, optimized CSS grid, and sub-millisecond local state updates. What do you all think of the mobile navigation flow?',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    likesCount: 206,
    commentsCount: 38,
    sharesCount: 15,
    isLiked: false,
    filterType: 'popular',
    comments: [
      {
        id: 'c1',
        author: {
          name: 'Sarah Jenkins',
          username: 'sarah_j',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        },
        text: 'The contrast on the dark navy cards is crisp and readable. Great work on the mobile drawer too!',
        timestamp: '10m ago'
      },
      {
        id: 'c2',
        author: {
          name: 'Marcus Chen',
          username: 'marcus_dev',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        text: 'Love the blue accent highlights. Did you use CSS variables for theme switching?',
        timestamp: '5m ago'
      }
    ]
  },
  {
    id: 'post_2',
    author: {
      name: 'Kailash Sharma',
      username: 'gardefv3k',
      badge: 'Platinum',
      tier: 4,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isFollowing: true
    },
    timestamp: '26m ago',
    tag: null,
    text: 'Good evening everyone ❤️ Quick tip for React developers: keep your component states localized when dealing with high-frequency feeds. Optimistic UI updates make the entire experience feel 10x faster.',
    image: null,
    likesCount: 42,
    commentsCount: 5,
    sharesCount: 2,
    isLiked: true,
    filterType: 'latest',
    comments: [
      {
        id: 'c3',
        author: {
          name: 'Elena Rostova',
          username: 'elena_codes',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        },
        text: '100% agreed! Optimistic updates are non-negotiable for interactive feeds.',
        timestamp: '18m ago'
      }
    ]
  },
  {
    id: 'post_3',
    author: {
      name: 'Adane Baye',
      username: 'adanemij3',
      badge: 'Gold',
      tier: 3,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isFollowing: false
    },
    timestamp: '45m ago',
    tag: 'Milestone',
    text: 'Milestone reached! 🎉 Just launched our community beta test to 5,000 developers worldwide. Thank you to everyone who tested the early prototype and provided actionable UI feedback.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    likesCount: 318,
    commentsCount: 64,
    sharesCount: 43,
    isLiked: false,
    filterType: 'popular',
    comments: [
      {
        id: 'c4',
        author: {
          name: 'David Kim',
          username: 'david_k',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
        },
        text: 'Huge congratulations team! Excited to build on top of this platform.',
        timestamp: '30m ago'
      }
    ]
  },
  {
    id: 'post_4',
    author: {
      name: 'Elena Rostova',
      username: 'elena_codes',
      badge: 'Pro',
      tier: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowing: true
    },
    timestamp: '2h ago',
    tag: 'WebDev',
    text: 'Modern Vanilla CSS is genuinely incredible. With CSS custom properties, grid subgrid, and modern color functions, you rarely need heavyweight CSS frameworks for clean, scalable component styling.',
    image: null,
    likesCount: 89,
    commentsCount: 12,
    sharesCount: 7,
    isLiked: false,
    filterType: 'latest',
    comments: []
  },
  {
    id: 'post_5',
    author: {
      name: 'Marcus Chen',
      username: 'marcus_dev',
      badge: 'Core Contributor',
      tier: 6,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowing: false
    },
    timestamp: '4h ago',
    tag: 'Engineering',
    text: 'Clean dark mode workstation ready for the sprint week. Multi-monitor setup with ultra-minimalist desktop and dark blue ambient lighting to match our app aesthetic 💻✨',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
    likesCount: 174,
    commentsCount: 23,
    sharesCount: 19,
    isLiked: true,
    filterType: 'popular',
    comments: []
  }
];

export const SUGGESTED_USERS = [
  {
    id: 'sug_1',
    name: 'Devon Vance',
    username: 'devon_v',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Architect',
    isFollowing: false
  },
  {
    id: 'sug_2',
    name: 'Aisha Malik',
    username: 'aisha_m',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'UI/UX Designer',
    isFollowing: false
  },
  {
    id: 'sug_3',
    name: 'Jordan Lee',
    username: 'jordan_builds',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Full Stack Dev',
    isFollowing: false
  }
];

export const TRENDING_TOPICS = [
  {
    id: 'trend_1',
    category: 'Technology · Trending',
    topic: '#WebDevelopment',
    postsCount: '18.4K posts'
  },
  {
    id: 'trend_2',
    category: 'Design Systems · Trending',
    topic: '#DarkModeUI',
    postsCount: '9.2K posts'
  },
  {
    id: 'trend_3',
    category: 'Frameworks · Trending',
    topic: '#ReactJS',
    postsCount: '45.1K posts'
  },
  {
    id: 'trend_4',
    category: 'Career · Popular',
    topic: '#BuildInPublic',
    postsCount: '12.8K posts'
  }
];
