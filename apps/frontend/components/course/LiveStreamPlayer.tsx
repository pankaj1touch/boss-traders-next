'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Users, MessageSquare, Send, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useGetLiveStreamChatQuery, useSendLiveStreamMessageMutation, useLikeLiveStreamMessageMutation } from '@/store/api/courseApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

interface LiveStreamPlayerProps {
  streamId: string;
  streamUrl: string;
  title: string;
  viewers: number;
  chatEnabled: boolean;
  isLive: boolean;
}

export default function LiveStreamPlayer({
  streamId,
  streamUrl,
  title,
  viewers,
  chatEnabled,
  isLive,
}: LiveStreamPlayerProps) {
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(chatEnabled);

  const { data: chatData, refetch: refetchChat } = useGetLiveStreamChatQuery(
    { streamId, limit: 50 },
    { pollingInterval: isLive ? 2000 : 0 }
  );
  const [sendMessage] = useSendLiveStreamMessageMutation();
  const [likeMessage] = useLikeLiveStreamMessageMutation();

  const messages = chatData?.messages || [];

  useEffect(() => {
    if (videoRef.current && streamUrl) {
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing stream:', error);
      dispatch(addToast({ type: 'error', message: 'Failed to play stream' }));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({ streamId, message }).unwrap();
      setMessage('');
      refetchChat();
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to send message',
        })
      );
    }
  };

  const handleLikeMessage = async (messageId: string) => {
    try {
      await likeMessage(messageId).unwrap();
      refetchChat();
    } catch (error) {
      console.error('Failed to like message:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              controls
              autoPlay={isLive}
            />
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
                <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                  <Users className="h-3 w-3 mr-1" />
                  {viewers} viewers
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            {chatEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showChat ? 'Hide' : 'Show'} Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showChat && chatEnabled && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </h4>
              <Badge>{messages.length} messages</Badge>
            </div>

            {/* Chat Messages */}
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No messages yet. Be the first to chat!
                </p>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg._id}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {msg.userId?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => handleLikeMessage(msg._id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        title="Like message"
                      >
                        <Heart className="h-3 w-3" />
                        {msg.likes || 0}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
                maxLength={500}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


