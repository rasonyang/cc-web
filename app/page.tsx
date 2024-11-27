import { CallCenterSoftphone } from '@/components/call-center-softphone'
import { CallCenterMessages } from '@/components/call-center-messages'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <CallCenterSoftphone />
      <CallCenterMessages />
    </main>
  )
}

