'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { io, Socket } from 'socket.io-client'

export function CallCenterMessages() {
  const [requestEventName, setRequestEventName] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [subscribeEventName, setSubscribeEventName] = useState('')
  const [receivedEvent, setReceivedEvent] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])


  // Emit event to send message
  const handleSend = () => {
    if (socket && requestEventName && messageToSend) {
      socket.emit(requestEventName, messageToSend)
      console.log('Emitted event:', requestEventName, messageToSend)
      setMessageToSend('')
    } else {
      console.warn('Socket not connected or missing event name/message.')
    }
  }

  // Prepare to subscribe to an event (subscription handled by useEffect)
  const handleSubscribe = () => {
    if (!subscribeEventName) {
      console.warn('Please enter an event name to subscribe.')
    } else if (socket) {
      console.log('Ready to subscribe to event:', subscribeEventName)
      socket.on(subscribeEventName, (message: string) => {
        try {
          console.log('Received message:', message)
          const jsonString = JSON.stringify(message, null, 2)
          console.log('Received message:', jsonString)
          setReceivedEvent(jsonString)
        } catch (error) {
          console.error('Failed to parse message as JSON:', error)
          setReceivedEvent(message)
        }
      })
    } else {
      console.warn('Socket is not connected.')
    }
  }

  return (
    <div className="p-6 space-y-4 bg-card text-card-foreground rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center">Message Center</h2>
      
      <div className="flex space-x-2">
        <div className="flex-grow">
          <Label htmlFor="requestEventName">Request Event Name</Label>
          <Input
            id="requestEventName"
            value={requestEventName}
            onChange={(e) => setRequestEventName(e.target.value)}
            placeholder="Enter event name"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>

      <div>
        <Label htmlFor="messageToSend">Message to Send</Label>
        <Textarea
          id="messageToSend"
          value={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value)}
          placeholder="Enter message to send"
          rows={4}
        />
      </div>

      <div className="flex space-x-2">
        <div className="flex-grow">
          <Label htmlFor="subscribeEventName">Subscribe Event Name</Label>
          <Input
            id="subscribeEventName"
            value={subscribeEventName}
            onChange={(e) => setSubscribeEventName(e.target.value)}
            placeholder="Enter event name to subscribe"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSubscribe}>Subscribe</Button>
        </div>
      </div>

      <div>
        <Label htmlFor="receivedEvent">Received Event</Label>
        <Textarea
          id="receivedEvent"
          value={receivedEvent}
          readOnly
          placeholder="Received events will appear here"
          rows={4}
        />
      </div>
    </div>
  )
}

