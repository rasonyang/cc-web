'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PhoneCall, PhoneIncoming, PhoneOff, LogIn, LogOut } from 'lucide-react';
import { SimpleUser } from "sip.js/lib/platform/web";

export function CallCenterSoftphone() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState('Logged Out');
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

    const simpleUser = new SimpleUser(server, {
      aor,
      media: {
        remote: { audio: audioRef.current },
      },
      userAgentOptions: {
        authorizationUsername,
        authorizationPassword,
        displayName: '1001',
        viaHost: "172.16.204.6", // Explicitly set the viaHost to avoid .invalid
        contactName: authorizationUsername
      },
    });

    simpleUser.delegate = {
      onCallCreated: () => {
        setIsOnCall(true);
        setStatusMessage('Call Created');
      },
      onCallReceived: async () => {
        setStatusMessage('Incoming Call');
      },
      onCallAnswered: () => {
        setStatusMessage('Call Answered');
        setIsOnCall(true);
      },
      onCallHangup: () => {
        setStatusMessage('Call Ended');
        setIsOnCall(false);
      },
      onServerConnect: () => {
        setStatusMessage('Connected to Server');
      },
      onServerDisconnect: () => {
        setStatusMessage('Disconnected from Server');
        setIsLoggedIn(false);
      },
    };

    simpleUserRef.current = simpleUser;

    simpleUser.connect();

    return () => {
      if (simpleUserRef.current) {
        simpleUserRef.current.disconnect().catch(console.error);
      }
    };
  }, []);

  const handleLogin = async () => {
    const simpleUser = simpleUserRef.current;
    if (!simpleUser) return;

    try {
      await simpleUser.register();
      setIsLoggedIn(true);
      setStatusMessage('Logged In');
    } catch (error) {
      console.error('Login failed:', error);
      setStatusMessage('Login Failed');
    }
  };

  const handleLogout = async () => {
    const simpleUser = simpleUserRef.current;
    if (!simpleUser) return;

    try {
      await simpleUser.unregister();
      await simpleUser.disconnect();
      setIsLoggedIn(false);
      setIsReady(false);
      setIsOnCall(false);
      setPhoneNumber('');
      setStatusMessage('Logged Out');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMakeCall = async () => {
    const simpleUser = simpleUserRef.current;
    if (simpleUser && phoneNumber) {
      try {
        // Construct a valid SIP URI
        const sipUri = `sip:${phoneNumber}@172.16.204.6`;
        
        // Attempt to make the call
        await simpleUser.call(sipUri)
        setIsOnCall(true);
        setStatusMessage(`Calling ${phoneNumber}`);
      } catch (error) {
        console.error('Call failed:', error);
        setStatusMessage('Call Failed');
      }
    }
  };

  const handleAnswerCall = async () => {
    const simpleUser = simpleUserRef.current;
    if (simpleUser) {
      try {
        await simpleUser.answer();
        setIsOnCall(true);
        setStatusMessage('Call Answered');
      } catch (error) {
        console.error('Answer failed:', error);
        setStatusMessage('Answer Failed');
      }
    }
  };

  const handleHangupCall = async () => {
    const simpleUser = simpleUserRef.current;
    if (simpleUser) {
      try {
        await simpleUser.hangup();
        setIsOnCall(false);
        setStatusMessage('Call Ended');
      } catch (error) {
        console.error('Hangup failed:', error);
        setStatusMessage('Hangup Failed');
      }
    }
  };

  const handleReadyToggle = () => {
    if (isLoggedIn) {
      setIsReady(!isReady);
    }
  };

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
        Status: {statusMessage}
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}