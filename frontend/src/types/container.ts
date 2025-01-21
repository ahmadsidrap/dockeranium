export interface Container {
  id: string
  name: string
  image: string
  status: string
  State: {
    Status: string
    Running: boolean
    Paused: boolean
    Restarting: boolean
    OOMKilled: boolean
    Dead: boolean
    Pid: number
    ExitCode: number
    Error: string
    StartedAt: string
    FinishedAt: string
  }
  ports: Record<string, Array<{ HostIp: string; HostPort: string }>>
  created: string
} 