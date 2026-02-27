export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string; // The URL of the audio
}

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Shape of You",
    artist: "Ed Sheeran",
    artwork: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    artwork: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Dance Monkey",
    artist: "Tones And I",
    artwork: "https://i.scdn.co/image/ab67616d0000b273c5240c54117b38d381b16ee8",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    artwork: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "5",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    artwork: "https://i.scdn.co/image/ab67616d0000b27377fdcf27c09104c86e00ec64",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
];
