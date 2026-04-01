'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import type { Topic } from '@/lib/topics'
import NotificationBell from './NotificationBell'

type Props = {
  userTopics: Topic[]
}

// ── Topic icons ───────────────────────────────────────────────────────────────

const TOPIC_SVG: Record<string, React.ReactNode> = {
  'ai-agi': <><circle cx="6" cy="6" r="1.3" fill="currentColor"/><circle cx="1.8" cy="2.5" r="0.9" fill="currentColor"/><circle cx="10.2" cy="2.5" r="0.9" fill="currentColor"/><circle cx="1.8" cy="9.5" r="0.9" fill="currentColor"/><circle cx="10.2" cy="9.5" r="0.9" fill="currentColor"/><line x1="2.6" y1="3.1" x2="5.1" y2="5.1" stroke="currentColor" strokeWidth="1"/><line x1="9.4" y1="3.1" x2="6.9" y2="5.1" stroke="currentColor" strokeWidth="1"/><line x1="2.6" y1="8.9" x2="5.1" y2="6.9" stroke="currentColor" strokeWidth="1"/><line x1="9.4" y1="8.9" x2="6.9" y2="6.9" stroke="currentColor" strokeWidth="1"/></>,
  'cybersecurity': <><path d="M6 1L10.5 2.8V6.5C10.5 9.2 8.5 11.2 6 12C3.5 11.2 1.5 9.2 1.5 6.5V2.8Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6" cy="8.8" r="0.65" fill="currentColor"/></>,
  'blockchain-crypto': <><path d="M6 1L11 6L6 11L1 6Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 3.8L8.2 6L6 8.2L3.8 6Z" fill="currentColor"/></>,
  'consumer-tech': <><rect x="3.5" y="1" width="5" height="10" rx="1.3" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="5" y1="9" x2="7" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'robotics': <><circle cx="6" cy="6" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="6" r="1" fill="currentColor"/><line x1="6" y1="1" x2="6" y2="2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="6" y1="9.2" x2="6" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="1" y1="6" x2="2.8" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="9.2" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  'social-media-tech': <><path d="M1.5 2h9a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H7L5 11V9H2.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="4" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>,
  'ai-commercial-law': <><line x1="6" y1="1.5" x2="6" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="3" y1="3" x2="9" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2 3L1 7h2Z" fill="currentColor"/><path d="M10 3L9 7h2Z" fill="currentColor"/><line x1="3.5" y1="11" x2="8.5" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'gambling-gaming-law': <><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="4.2" cy="4.2" r="0.8" fill="currentColor"/><circle cx="7.8" cy="4.2" r="0.8" fill="currentColor"/><circle cx="4.2" cy="7.8" r="0.8" fill="currentColor"/><circle cx="7.8" cy="7.8" r="0.8" fill="currentColor"/><circle cx="6" cy="6" r="0.8" fill="currentColor"/></>,
  'data-privacy': <><rect x="3" y="5.5" width="6" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 5.5V4a1.5 1.5 0 0 1 3 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="8.2" r="0.85" fill="currentColor"/></>,
  'elections': <><rect x="2" y="4" width="8" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 2h3a.5.5 0 0 1 .5.5V4H4V2.5A.5.5 0 0 1 4.5 2z" fill="none" stroke="currentColor" strokeWidth="1.1"/><polyline points="4,7 5.5,8.5 8,6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></>,
  'human-rights': <><line x1="4" y1="5" x2="4" y2="2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="5.8" y1="4.5" x2="5.8" y2="1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="7.6" y1="5" x2="7.6" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2.8 6.5C2.8 5.7 3.4 5 4.2 5H8c.8 0 1.4.6 1.4 1.4L9 9.5c0 .8-.7 1.5-1.5 1.5H5c-.8 0-1.5-.7-1.5-1.5L3 7.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></>,
  'immigration': <><rect x="2.5" y="1.5" width="7" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="5.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.1"/><line x1="4" y1="8.8" x2="8" y2="8.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>,
  'stock-market': <><polyline points="1,9.5 4,6.5 6.5,8 9.5,4 11,5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9.5,4 11,4 11,5.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>,
  'vc-startups': <><path d="M6 1.5L7.5 4.5H11L8.2 6.6L9.3 9.8L6 8L2.7 9.8L3.8 6.6L1 4.5H4.5Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></>,
  'global-economy': <><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="6" cy="6" rx="2" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1"/><line x1="1.5" y1="6" x2="10.5" y2="6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></>,
  'real-estate': <><path d="M1.5 6.5L6 2L10.5 6.5V11.5H1.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><rect x="4.5" y="8" width="3" height="3.5" fill="none" stroke="currentColor" strokeWidth="1.1"/></>,
  'trade-tariffs': <><rect x="2" y="4.5" width="8" height="6.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 4.5V3.5a1.5 1.5 0 0 1 3 0v1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>,
  'emerging-markets': <><line x1="2" y1="11" x2="2" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="5" y1="11" x2="5" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="11" x2="8" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="11" y1="11" x2="11" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  'biotech-health': <><line x1="4.5" y1="1.5" x2="4.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="7.5" y1="1.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4.5" y1="4" x2="7.5" y2="4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4.5" y1="6" x2="7.5" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4.5" y1="8" x2="7.5" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  'science': <><path d="M5 2V6.5L2 10c-.5.8 0 1.5 1 1.5h6c1 0 1.5-.7 1-1.5L7 6.5V2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="2" x2="8" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="5.5" cy="9" r="0.7" fill="currentColor"/></>,
  'mental-health': <><path d="M6 2.5C3.8 2.5 2 4.3 2 6.5c0 1.4.7 2.6 1.8 3.3V11H6h2.2V9.8C9.3 9.1 10 7.9 10 6.5 10 4.3 8.2 2.5 6 2.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4.2" y1="11" x2="7.8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'health-wellness': <><line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'pharma': <><rect x="3.5" y="1.5" width="5" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.2"/></>,
  'nuclear': <><circle cx="6" cy="6" r="1.5" fill="currentColor"/><ellipse cx="6" cy="6" rx="4.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.1"/><ellipse cx="6" cy="6" rx="4.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(60 6 6)"/><ellipse cx="6" cy="6" rx="4.5" ry="2" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(120 6 6)"/></>,
  'climate-energy': <><circle cx="6" cy="5.5" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="1" x2="6" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="6" y1="8.5" x2="6" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="1.5" y1="5.5" x2="3" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="9" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="2.8" y1="2.8" x2="3.8" y2="3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="8.2" y1="7.2" x2="9.2" y2="8.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'environment': <><line x1="6" y1="11" x2="6" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6 6C6 6 2 5 2 2C5 2 7.5 3.5 6 6Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M6 6C6 6 10 5 10 2C7 2 4.5 3.5 6 6Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></>,
  'agriculture': <><line x1="6" y1="11" x2="6" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 3C6 3 4.5 1.5 3 2C3 4 4.5 5 6 5C7.5 5 9 4 9 2C7.5 1.5 6 3 6 3Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><line x1="4.5" y1="7" x2="6" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="7.5" y1="7" x2="6" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  'us-politics': <><path d="M6 1L7.5 4.5H11.5L8.3 6.8L9.5 10.3L6 8.3L2.5 10.3L3.7 6.8L0.5 4.5H4.5Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></>,
  'geopolitics': <><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="1.5" y1="6" x2="10.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="6" y1="1.5" x2="6" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M2 3.8C3.5 4.8 4.8 5 6 4.8S8.5 4.8 10 3.8" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><path d="M2 8.2C3.5 7.2 4.8 7 6 7.2S8.5 7.2 10 8.2" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></>,
  'military': <><path d="M6 1L10.5 2.8V6.5C10.5 9 8.5 11 6 12C3.5 11 1.5 9 1.5 6.5V2.8Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 4L7 5.8H9L7.5 7L8 8.8L6 7.8L4 8.8L4.5 7L3 5.8H5Z" fill="currentColor"/></>,
  'space-defense': <><circle cx="6" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2"/><ellipse cx="6" cy="6" rx="5" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><circle cx="10" cy="4.3" r="1" fill="currentColor"/></>,
  'entertainment': <><path d="M6 1L7.2 4.5H11L8 6.8L9.2 10.3L6 8L2.8 10.3L4 6.8L1 4.5H4.8Z" fill="currentColor"/></>,
  'film-tv': <><rect x="1.5" y="3.5" width="9" height="6.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="1.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="0.9"/><line x1="4" y1="3.5" x2="4" y2="5.5" stroke="currentColor" strokeWidth="0.9"/><line x1="7" y1="3.5" x2="7" y2="5.5" stroke="currentColor" strokeWidth="0.9"/></>,
  'gaming-esports': <><rect x="1.5" y="3.5" width="9" height="6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="4" y1="5.5" x2="4" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="2.8" y1="6.8" x2="5.2" y2="6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8.3" cy="5.8" r="0.7" fill="currentColor"/><circle cx="8.3" cy="7.8" r="0.7" fill="currentColor"/></>,
  'sports': <><path d="M4 1.5H8L10 5L8 10.5H4L2 5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="1.5" x2="8" y2="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="3.5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'classical-opera': <><path d="M5 10.5V3.5L10.5 2.5V9.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="3.5" cy="10.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="9" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.2"/></>,
  'literature': <><path d="M2.5 1.5h7a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="4" y1="4.5" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="4" y1="6.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="4" y1="8.5" x2="6.5" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>,
  'art-design': <><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="4" cy="4.5" r="1" fill="currentColor"/><circle cx="8" cy="4.5" r="1" fill="currentColor"/><circle cx="6" cy="8.2" r="1" fill="currentColor"/><circle cx="3" cy="7.2" r="0.7" fill="currentColor"/><circle cx="9" cy="7.2" r="0.7" fill="currentColor"/></>,
  'architecture': <><path d="M1.5 11V6.5L6 2L10.5 6.5V11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M4.5 11V8a1.5 1.5 0 0 1 3 0v3" fill="none" stroke="currentColor" strokeWidth="1.1"/><line x1="1.5" y1="11" x2="10.5" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'food-drink': <><line x1="4" y1="1.5" x2="4" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2.5 1.5v3.5a1.5 1.5 0 0 0 3 0V1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="9" y1="1.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M7.5 1.5C7.5 4 8 5.5 9 5.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'fashion-luxury': <><path d="M4.5 1.5C4.5 2.5 5 3 6 3s1.5-.5 1.5-1.5L9 4 8 11H4L3 4Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></>,
  'travel': <><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="1.5" y1="6" x2="10.5" y2="6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><line x1="6" y1="1.5" x2="6" y2="10.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><line x1="6" y1="6" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  'judaism': <><path d="M6 1.5L8.5 5.5H3.5Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M6 10.5L3.5 6.5H8.5Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><line x1="3.5" y1="5.5" x2="8.5" y2="5.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><line x1="3.5" y1="6.5" x2="8.5" y2="6.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></>,
  'religion': <><line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="3" y1="3.5" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
  'philosophy': <><circle cx="6" cy="4.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="7.5" x2="6" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4.5" y1="10" x2="7.5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="4.5" r="0.9" fill="currentColor"/></>,
  'automotive-ev': <><path d="M1 7.5h10M2 7.5L3.5 4h5l1.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="7.5" x2="1" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="11" y1="7.5" x2="11" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="3.5" cy="9.5" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="8.5" cy="9.5" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.2"/></>,
  'aviation': <><path d="M1.5 7L5 5.5L3.8 3L5.5 2.5L8 5.5L10 4.8L10.5 6L8.5 7.5L10 9L9 9.5L7 8.5L5.5 9.5L5 9L6.5 7.5Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></>,
  'media-journalism': <><rect x="1.5" y="2.5" width="9" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/><line x1="3" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="3" y1="7.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="3" y1="4" x2="5" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></>,
  'labor': <><circle cx="6" cy="3.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M2 11.5C2 9 3.8 7.5 6 7.5S10 9 10 11.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  'education': <><path d="M6 2.5L11.5 5.5L6 8.5L0.5 5.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M3.5 7V9.5C3.5 9.5 4.5 11.5 6 11.5S8.5 9.5 8.5 9.5V7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><line x1="11.5" y1="5.5" x2="11.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
}

function TopicIcon({ topicId }: { topicId: string }) {
  const content = TOPIC_SVG[topicId]
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {content ?? <circle cx="6" cy="6" r="1.5" fill="currentColor" />}
    </svg>
  )
}

// ── Nav icons ─────────────────────────────────────────────────────────────────

function IconFeed() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0.5" width="15" height="2.2" rx="1.1"/>
      <rect x="0" y="5.5" width="10" height="2.2" rx="1.1"/>
      <rect x="0" y="10.5" width="12.5" height="2.2" rx="1.1"/>
    </svg>
  )
}

function IconBreaking() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="6.4" y="0.5" width="2.2" height="8.5" rx="1.1"/>
      <rect x="6.4" y="11.5" width="2.2" height="2.5" rx="1.1"/>
    </svg>
  )
}

function IconConnections() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7.5" cy="2.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="2"   cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <circle cx="13"  cy="12.5" r="1.8" fill="currentColor" stroke="none"/>
      <line x1="7.5" y1="4.3"  x2="2.8"  y2="10.7"/>
      <line x1="7.5" y1="4.3"  x2="12.2" y2="10.7"/>
      <line x1="3.8" y1="12.5" x2="11.2" y2="12.5"/>
    </svg>
  )
}

// Anthropic "A" monogram — two diagonal strokes + crossbar
function IconAnthropic() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,13.5 7.5,1.5 13.5,13.5"/>
      <line x1="4.2" y1="9.5" x2="10.8" y2="9.5"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.2"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.87 2.87l1.06 1.06M11.07 11.07l1.06 1.06M2.87 12.13l1.06-1.06M11.07 3.93l1.06-1.06"/>
    </svg>
  )
}

const NAV: { href: string; label: string; Icon: () => React.ReactElement }[] = [
  { href: '/dashboard',             label: 'My Feed',     Icon: IconFeed },
  { href: '/dashboard/breaking',    label: 'Breaking',    Icon: IconBreaking },
  { href: '/dashboard/connections', label: 'Connections', Icon: IconConnections },
  { href: '/dashboard/ask',         label: 'Ask AI',      Icon: IconAnthropic },
  { href: '/dashboard/settings',    label: 'Settings',    Icon: IconSettings },
]

export default function Sidebar({ userTopics }: Props) {
  const pathname = usePathname()

  return (
    <aside className="sidebar-glass hidden md:flex h-full w-56 flex-col shrink-0 px-3 py-5">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: '#111111', fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Vantage
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
          style={{
            color: 'var(--accent)',
            background: 'rgba(255,55,95,0.08)',
            border: '1px solid rgba(255,55,95,0.18)',
          }}
        >
          BETA
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150"
              style={active ? {
                background: 'rgba(255,55,95,0.08)',
                border: '1px solid rgba(255,55,95,0.18)',
                color: 'var(--accent)',
              } : {
                border: '1px solid transparent',
                color: 'rgba(0,0,0,0.48)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.88)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.48)' }}
            >
              <span className="w-4 flex items-center justify-center shrink-0">
                <Icon />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Topic list */}
      {userTopics.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto min-h-0">
          <p
            className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(0,0,0,0.36)' }}
          >
            My Topics
          </p>
          <div className="flex flex-col gap-0.5">
            {userTopics.map((topic) => {
              const active = pathname === `/dashboard/topic/${topic.slug}`
              return (
                <Link
                  key={topic.id}
                  href={`/dashboard/topic/${topic.slug}`}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-all duration-150"
                  style={active ? {
                    background: 'rgba(255,55,95,0.08)',
                    border: '1px solid rgba(255,55,95,0.18)',
                    color: 'var(--accent)',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(0,0,0,0.52)',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.88)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(0,0,0,0.52)' }}
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    <TopicIcon topicId={topic.id} />
                  </span>
                  <span className="truncate">{topic.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom: notifications + account */}
      <div
        className="mt-auto pt-3 flex flex-col gap-1"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        <NotificationBell />
        <div className="flex items-center gap-2.5 px-2 py-2">
          <UserButton
            appearance={{
              variables: {
                colorBackground: '#ffffff',
                colorText: '#111111',
              },
            }}
          />
          <span style={{ color: 'rgba(0,0,0,0.40)', fontSize: '12px' }}>Account</span>
        </div>
      </div>
    </aside>
  )
}
