export type MilestoneStatus = 'done' | 'progress' | 'todo'

export interface Milestone {
  id: string
  year: string
  title: string
  description: string
  items: string[]
  status: MilestoneStatus
  target?: string
}

export type ReleaseStatus = 'idea' | 'wip' | 'recorded' | 'mixed' | 'mastered' | 'submitted' | 'live'
export type ReleaseType = 'Original' | 'Remix' | 'Edit' | 'EP' | 'Set'

export interface ReleaseLink {
  platform: string
  url: string
}

export interface Release {
  id: string
  title: string
  artistCredit: string
  type: ReleaseType
  status: ReleaseStatus
  releaseDate?: string
  distributor?: string
  isrc?: string
  upc?: string
  bpm?: number
  key?: string
  genre: string
  lufs?: string
  platforms: string[]
  links: ReleaseLink[]
  notes: string
  artworkUrl?: string
  createdAt: string
}

export type ContentPlatform = 'Instagram' | 'SoundCloud' | 'YouTube' | 'TikTok' | 'Spotify'
export type ContentType = 'Post' | 'Story' | 'Reel' | 'Upload' | 'Live' | 'Pitch'
export type ContentStatus = 'idea' | 'draft' | 'ready' | 'published'

export interface ContentItem {
  id: string
  platform: ContentPlatform
  type: ContentType
  title: string
  description: string
  caption?: string
  hashtags?: string[]
  scheduledDate: string
  status: ContentStatus
  releaseId?: string
  assetUrl?: string
}

export interface PlatformSnapshot {
  id: string
  platform: string
  date: string
  followers: number
  streams?: number
  views?: number
  likes?: number
  saves?: number
  reach?: number
  notes?: string
}

export type ChecklistType = 'pre-release' | 'post-release' | 'set' | 'pitch' | 'collab' | 'custom'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  deadline?: string
  assignedTo?: string
  notes?: string
}

export interface Checklist {
  id: string
  name: string
  type: ChecklistType
  items: ChecklistItem[]
  releaseId?: string
  createdAt: string
  completedAt?: string
  archived?: boolean
}

export type ContactRole = 'Playlist curator' | 'Blog/Média' | 'Label' | 'Booker' | 'Artiste' | 'Manager' | 'Autre'
export type ContactStatus = 'à contacter' | 'contacté' | 'répondu' | 'positif' | 'négatif' | 'partenaire'
export type ContactTier = 'A' | 'B' | 'C'
export type InteractionType = 'Email' | 'DM Instagram' | 'DM SoundCloud' | 'Appel' | 'Meeting' | 'Autre'

export interface Interaction {
  id: string
  date: string
  type: InteractionType
  summary: string
  outcome?: string
}

export interface Contact {
  id: string
  name: string
  role: ContactRole
  platform?: string
  profileUrl?: string
  email?: string
  instagram?: string
  followers?: number
  genre?: string
  tier: ContactTier
  status: ContactStatus
  lastContact?: string
  notes: string
  interactions: Interaction[]
}

export interface ArtistLink {
  platform: string
  url: string
  handle: string
  verified: boolean
}

export interface VisualAsset {
  id: string
  label: string
  category: string
  url?: string
  date: string
}

export interface ArtistProfile {
  artistName: string
  realName: string
  location: string
  genres: string[]
  bpmRange: string
  influences: string[]
  daw: string
  gear: string[]
  founded: string
  venuePlayed: string[]
  bioShortFR: string
  bioLongFR: string
  bioShortEN: string
  bioLongEN: string
  pitchOral: string
  links: ArtistLink[]
  visualAssets: VisualAsset[]
}
