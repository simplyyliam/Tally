import { createContext, useContext, type ReactNode } from "react"
import type { ReminderChannel } from "../domain/reminder-channel"
import { WaMeChannel } from "./wa-me-channel"

const ReminderChannelContext = createContext<ReminderChannel>(new WaMeChannel())

export function ReminderChannelProvider({ channel, children }: { channel: ReminderChannel; children: ReactNode }) {
  return <ReminderChannelContext.Provider value={channel}>{children}</ReminderChannelContext.Provider>
}

export function useReminderChannel(): ReminderChannel {
  return useContext(ReminderChannelContext)
}
