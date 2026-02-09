"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

type LogEntry = {
  timestamp: string
  level: string
  message: string
  icon: string
}

type ScanTerminalProps = {
  logs: LogEntry[]
  isRunning?: boolean
  className?: string
}

const levelColors: Record<string, string> = {
  info: "text-slate-300",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  progress: "text-cyan-400",
  detection: "text-blue-400",
  cookie: "text-orange-400",
  tracker: "text-purple-400",
  violation: "text-red-400",
  forensic: "text-indigo-400",
}

export function ScanTerminal({ logs, isRunning = false, className }: ScanTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      className={cn(
        "bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-sm",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-slate-500 text-xs ml-2">scan-logs</span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-2 text-xs text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            En cours...
          </span>
        )}
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="p-4 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">En attente des logs...</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                <span className="shrink-0">{log.icon}</span>
                <span className={cn("break-words", levelColors[log.level] || "text-slate-300")}>
                  {log.message}
                </span>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-slate-600">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="animate-pulse">|</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
