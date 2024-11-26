'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PhoneCall, PhoneIncoming, PhoneOff, LogIn, LogOut } from 'lucide-react'
import { SimpleUser, SimpleUserOptions } from "sip.js/lib/platform/web";









export function CallCenterSoftphone() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null);
  const simpleUserRef = useRef<SimpleUser | null>(null);

  


  useEffect(() => {
    const server = "ws://172.16.204.6:5066";
    const aor = "sip:1001@172.16.204.6";
    const authorizationUsername = "1001";
    const authorizationPassword = "5678";

    if (!audioRef.current) {
      console.error('Audio element not found');
      return;
    }

    // SimpleUser options
    const simpleUserOptions: SimpleUserOptions = {
      aor,
      media: {
        remote: {
          audio: audioRef.current
        }
      },
      userAgentOptions: {
        // logLevel: "debug",
        authorizationUsername,
        authorizationPassword,
        displayName: '1001',
        viaHost: "172.16.204.6", // Explicitly set the viaHost to avoid .invalid
        contactName: authorizationUsername
      }
    };

    const simpleUser = new SimpleUser(server, simpleUserOptions);
    simpleUserRef.current = simpleUser;
    

    return () => {
      if (simpleUserRef.current) {
        simpleUserRef.current.disconnect()
          .then(() => {
            console.log('SimpleUser disconnected');
          })
          .catch((error) => {
            console.error('SimpleUser disconnect error:', error);
          });
      }
    };
  }, []);

  // Placeholder for WebRTC or similar API
  const callApi = {
    login: () => {
      simpleUserRef.current?.connect();
      simpleUserRef.current?.register();
      console.log('login')
      return Promise.resolve(true)
  },
  logout: () => {
    console.log('logout')
    return Promise.resolve(true)
  },
  makeCall: (number: string) => {
    console.log('makeCall', number)
    return Promise.resolve(true)
  },
  answerCall: () => {
    console.log('answerCall')
    return Promise.resolve(true)
  },
  hangupCall: () => {
    console.log('hangupCall')
    return Promise.resolve(true)
    },
  }

  const handleLogin = async () => {
    const success = await callApi.login()
    if (success) setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    const success = await callApi.logout()
    if (success) {
      setIsLoggedIn(false)
      setIsReady(false)
      setIsOnCall(false)
      setPhoneNumber('')
    }
  }

  const handleReadyToggle = () => {
    if (isLoggedIn) {
      setIsReady(!isReady)
    }
  }

  const handleMakeCall = async () => {
    if (isLoggedIn && isReady && phoneNumber) {
      const success = await callApi.makeCall(phoneNumber)
      if (success) setIsOnCall(true)
    }
  }

  const handleAnswerCall = async () => {
    if (isLoggedIn && isReady && !isOnCall) {
      const success = await callApi.answerCall()
      if (success) setIsOnCall(true)
    }
  }

  const handleHangupCall = async () => {
    if (isLoggedIn && isOnCall) {
      const success = await callApi.hangupCall()
      if (success) setIsOnCall(false)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center">Call Center Softphone</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={handleLogin} className="flex-1" disabled={isLoggedIn}>
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
          <Button onClick={handleLogout} className="flex-1" disabled={!isLoggedIn}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="ready-switch">Ready</Label>
          <Switch
            id="ready-switch"
            checked={isReady}
            onCheckedChange={handleReadyToggle}
            disabled={!isLoggedIn}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <div className="flex space-x-2">
            <Input
              id="phone-number"
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!isLoggedIn || !isReady || isOnCall}
            />
            <Button onClick={handleMakeCall} disabled={!isLoggedIn || !isReady || isOnCall || !phoneNumber}>
              <PhoneCall className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleAnswerCall} disabled={!isLoggedIn || !isReady || isOnCall} className="flex-1">
            <PhoneIncoming className="mr-2 h-4 w-4" /> Answer
          </Button>
          <Button onClick={handleHangupCall} disabled={!isLoggedIn || !isOnCall} className="flex-1">
            <PhoneOff className="mr-2 h-4 w-4" /> Hangup
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Status: {isLoggedIn ? (isReady ? 'Ready' : 'Not Ready') : 'Logged Out'}
        {isOnCall && ' - On Call'}
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  )
}

