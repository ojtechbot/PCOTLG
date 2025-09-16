
"use client"

import ReactPlayer from 'react-player/youtube'

interface VideoPlayerProps {
    streamUrl: string;
}

export function VideoPlayer({ streamUrl }: VideoPlayerProps) {
    return (
        <div className="relative aspect-video rounded-lg overflow-hidden">
            <ReactPlayer
                url={streamUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={true}
                className="absolute top-0 left-0"
            />
        </div>
    );
}
