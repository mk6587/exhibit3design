// GA4 Debug Component - Shows when events are fired
// This component can be added to any page during testing

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GAEvent {
  timestamp: Date;
  eventName: string;
  parameters: any;
}

const GA4Debug = () => {
  const [events, setEvents] = useState<GAEvent[]>([]);

  useEffect(() => {
    // Override gtag to capture events
    const originalGtag = window.gtag;
    
    window.gtag = (...args: any[]) => {
      // Call original gtag first
      if (originalGtag) {
        originalGtag(...args);
      }

      // Capture event data
      if (args[0] === 'event') {
        const eventName = args[1];
        const parameters = args[2] || {};
        
        setEvents(prev => [...prev.slice(-9), {
          timestamp: new Date(),
          eventName,
          parameters
        }]);
      }
    };

    return () => {
      // Restore original gtag
      window.gtag = originalGtag;
    };
  }, []);

  if (events.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">GA4 Debug Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No GA4 events captured yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">GA4 Debug Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="p-2 bg-muted rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">{event.eventName}</Badge>
              <span className="text-muted-foreground">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(event.parameters, null, 2)}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GA4Debug;