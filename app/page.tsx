'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Download, Play, Trash2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [videoIdea, setVideoIdea] = useState('');
  const [style, setStyle] = useState('Trending');
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('videoHistory');
      if (saved) setHistory(JSON.parse(saved));
    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, []);

  const handleGenerateVideo = async () => {
    if (!videoIdea.trim()) {
      setError('Please enter a video idea');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, style, duration }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const video = await response.json();

      const newVideo = {
        id: `video_${Date.now()}`,
        title: videoIdea.substring(0, 50),
        captions: video.captions || ['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4', 'Scene 5'],
        images: video.images || Array(5).fill('https://via.placeholder.com/540x960?text=Scene'),
        duration,
        style,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      setCurrentVideo(newVideo);
      const updated = [newVideo, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('videoHistory', JSON.stringify(updated));
      setSuccessMessage('✅ Video generated successfully!');
      setVideoIdea('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to generate video: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = ['Trending', 'Educational', 'Motivational', 'Entertaining', 'Cinematic', 'Minimalist'];
  const durations = [15, 30, 60];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VideoAI</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="generator" className="text-slate-300 data-[state=active]:text-white">Generator</TabsTrigger>
            <TabsTrigger value="preview" className="text-slate-300 data-[state=active]:text-white">Preview</TabsTrigger>
            <TabsTrigger value="history" className="text-slate-300 data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Create Your Video</h2>
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
              {successMessage && <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{successMessage}</div>}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoIdea" className="text-slate-300 mb-2 block">Video Idea</Label>
                  <Textarea id="videoIdea" placeholder="Describe your video idea..." value={videoIdea} onChange={(e) => setVideoIdea(e.target.value)} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32" />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Video Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <Button key={s} variant={style === s ? 'default' : 'outline'} onClick={() => setStyle(s)} className={style === s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>{s}</Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Duration</Label>
                  <div className="flex gap-2">
                    {durations.map((d) => (
                      <Button key={d} variant={duration === d ? 'default' : 'outline'} onClick={() => setDuration(d)} className={duration === d ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}>{d}s</Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerateVideo} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 mt-6">
                  {loading ? <>⚡ Generating...</> : <><Zap className="w-5 h-5 mr-2" />Generate Video</>}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            {currentVideo ? (
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{currentVideo.title}</h2>
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mb-6">
                  <img src={currentVideo.images[0]} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Download className="w-4 h-4 mr-2" />Download Video
                </Button>
              </Card>
            ) : (
              <Card className="bg-slate-900/50 border-slate-800 p-12 text-center">
                <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Generate a video to see preview</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {history.length > 0 ? (
              <div className="grid gap-4">
                {history.map((video) => (
                  <Card key={video.id} className="bg-slate-900/50 border-slate-800 p-4">
                    <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{video.style} • {video.duration}s</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-800 p-12 text-center">
                <p className="text-slate-400">No videos generated yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
