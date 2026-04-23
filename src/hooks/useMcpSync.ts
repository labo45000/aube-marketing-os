import { useEffect, useRef } from 'react'
import { subscribeToMcpEvents, fetchMcpStateIfChanged, checkMcpHealth } from '../utils/mcpApi'
import { useMcpStore } from '../store/useMcpStore'
import { useRoadmapStore } from '../store/useRoadmapStore'
import { useReleasesStore } from '../store/useReleasesStore'
import { usePlanningStore } from '../store/usePlanningStore'
import { useAnalyticsStore } from '../store/useAnalyticsStore'
import { useChecklistsStore } from '../store/useChecklistsStore'
import { useOutreachStore } from '../store/useOutreachStore'
import { useAssetsStore } from '../store/useAssetsStore'
import { saveToStorage } from '../utils/storage'
import type { Milestone } from '../types'
import type { Release } from '../types'
import type { ContentItem } from '../types'
import type { PlatformSnapshot } from '../types'
import type { Checklist } from '../types'
import type { Contact } from '../types'
import type { ArtistProfile } from '../types'

interface RemoteState {
  roadmap?: Milestone[]
  releases?: Release[]
  planning?: ContentItem[]
  analytics?: PlatformSnapshot[]
  checklists?: Checklist[]
  outreach?: Contact[]
  assets?: ArtistProfile
  [key: string]: unknown
}

function applyRemoteState(remote: RemoteState) {
  if (remote.roadmap) {
    useRoadmapStore.setState({ milestones: remote.roadmap })
    saveToStorage('dube_roadmap', remote.roadmap)
  }
  if (remote.releases) {
    useReleasesStore.setState({ releases: remote.releases })
    saveToStorage('dube_releases', remote.releases)
  }
  if (remote.planning) {
    usePlanningStore.setState({ items: remote.planning })
    saveToStorage('dube_planning', remote.planning)
  }
  if (remote.analytics) {
    useAnalyticsStore.setState({ snapshots: remote.analytics })
    saveToStorage('dube_analytics', remote.analytics)
  }
  if (remote.checklists) {
    useChecklistsStore.setState({ checklists: remote.checklists })
    saveToStorage('dube_checklists', remote.checklists)
  }
  if (remote.outreach) {
    useOutreachStore.setState({ contacts: remote.outreach })
    saveToStorage('dube_outreach', remote.outreach)
  }
  if (remote.assets) {
    useAssetsStore.setState({ profile: remote.assets })
    saveToStorage('dube_assets', remote.assets)
  }
}

export function useMcpSync() {
  const { setConnected, addEvent } = useMcpStore()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    checkMcpHealth().then(ok => {
      setConnected(ok)
      if (ok) {
        fetchMcpStateIfChanged().then(result => {
          if (result) applyRemoteState(result.data as RemoteState)
        })
      }
    })

    const unsubscribe = subscribeToMcpEvents(
      (event) => addEvent(event),
      () => setConnected(true),
      () => setConnected(false),
    )

    pollRef.current = setInterval(async () => {
      const result = await fetchMcpStateIfChanged()
      if (result) applyRemoteState(result.data as RemoteState)
    }, 2000)

    return () => {
      unsubscribe()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [setConnected, addEvent])
}
